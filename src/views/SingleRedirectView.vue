<script setup lang="ts">
import SingleQR from "@/components/screens/SingleQR.vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useTeamStore } from "@/stores/team";
import { getRedirect } from "@/useRedirects";
import type {
  Alert,
  Endpoint,
  Placement,
  Redirect,
  Webhook,
} from "@/types/redirect";
import type { QRDesign } from "@/types/qrDesign";

const $bus = useEventsBus();
const router = useRouter();

const teamStore = useTeamStore();

const props = defineProps({
  /** The redirect ID to add the endpoint for */
  redirectId: {
    type: String,
    required: true,
  },
});

const isLoading = ref(true);

const singleQRElement = ref();

// All refs
const redirectName = ref(null as Redirect["name"] | null);
const subscribedAt = ref(null as Redirect["subscribed_at"]);
const clicksToday = ref(0);
const clicksSameTimeYesterday = ref(null as number | null);
const clicksAllTime = ref(0);
const bestEndpoint = ref(undefined as Endpoint["endpoint"] | undefined);
const placements = ref([] as Placement[]);
const endpoints = ref([] as Endpoint[]);
const designs = ref([] as QRDesign[]);
const webhooks = ref([] as Webhook[]);
const alerts = ref([] as Alert[]);
const remainingClicks = ref(0);
const heatmapData = ref(undefined as Redirect["heatmap"] | undefined);

const getData = () => {
  if (teamStore.activeTeam === null) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  getRedirect(props.redirectId)
    .then((response) => {
      // From the response, we need to pass as props the redirect name, the redirect URL, and the redirect ID
      redirectName.value = response.data.name;
      subscribedAt.value = response.data.subscribed_at;
      remainingClicks.value = response.data.remaining_clicks;
      placements.value = response.data.sources ?? [];
      designs.value = response.data.qr_designs ?? [];
      webhooks.value = response.data.webhooks ?? [];
      alerts.value = response.data.alerts ?? [];
      heatmapData.value = response.data.heatmap;

      const totalClicks = () => {
        return response.data.endpoints.reduce((total: any, endpoint: any) => {
          return (
            total +
            endpoint.clicks_by_time_of_day.reduce((sum: any, click: any) => {
              return sum + click.click_count;
            }, 0)
          );
        }, 0);
      };

      const bestPerformingEndpoint = () => {
        return response.data.endpoints.reduce(
          (best: any, endpoint: any) => {
            const totalClicks = endpoint.clicks_by_time_of_day.reduce(
              (sum: any, click: any) => {
                return sum + click.click_count;
              },
              0
            );
            return totalClicks > best.totalClicks
              ? { endpoint: endpoint.endpoint, totalClicks }
              : best;
          },
          { endpoint: undefined, totalClicks: 0 }
        );
      };

      // set clicksToday and clicksTodayUnique
      clicksToday.value = response.data.todays_clicks_count;
      clicksSameTimeYesterday.value =
        response.data.yesterdays_clicks_up_to_now_count ?? null;

      clicksAllTime.value = totalClicks();

      bestEndpoint.value =
        // If there is more than 1 endpoint, return the best performing endpoint. If there is only 1 endpoint, return that endpoint.
        response.data.endpoints.length > 1
          ? bestPerformingEndpoint().endpoint
          : undefined;

      endpoints.value = response.data.endpoints;

      // next()\
    })
    .catch(() => {
      router.push("/404");
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const redirectToCreate = () => {
  router.push("/redirects/create");
};

const incrementClicks = () => {
  clicksToday.value += 1;
  clicksAllTime.value += 1;
};

onMounted(() => {
  if (!teamStore.activeTeam) {
    isLoading.value = false;
    singleQRElement.value.triggerSuccess();
    startTimer();
  } else {
    getData();
  }

  $bus.$on(eventTypes.started_subscription, getData);
  $bus.$on(eventTypes.unsubscribed, getData);
  $bus.$on(eventTypes.updated_redirect, getData);
  $bus.$on(eventTypes.updated_endpoint, getData);
  $bus.$on(eventTypes.deleted_endpoint, getData);
  $bus.$on(eventTypes.deleted_redirect, redirectToCreate);
  $bus.$on(eventTypes.set_active_team, getData);
  $bus.$on(eventTypes.created_qr_design, getData);
  $bus.$on(eventTypes.created_webhook, getData);
  $bus.$on(eventTypes.created_alert, getData);
  $bus.$on(eventTypes.tested_redirect, incrementClicks);
});

onUnmounted(() => {
  $bus.$off(eventTypes.started_subscription, getData);
  $bus.$off(eventTypes.unsubscribed, getData);
  $bus.$off(eventTypes.updated_redirect, getData);
  $bus.$off(eventTypes.updated_endpoint, getData);
  $bus.$off(eventTypes.deleted_endpoint, getData);
  $bus.$off(eventTypes.deleted_redirect, redirectToCreate);
  $bus.$off(eventTypes.set_active_team, getData);
  $bus.$off(eventTypes.created_qr_design, getData);
  $bus.$off(eventTypes.created_webhook, getData);
  $bus.$off(eventTypes.created_alert, getData);
  $bus.$off(eventTypes.tested_redirect, incrementClicks);
});

const timerLength = 60 * 3;

/**
 * A timer that shows a countdown (mm:ss)
 */
const timer = ref(timerLength);

const startTimer = () => {
  const interval = setInterval(() => {
    timer.value -= 1;
    if (timer.value <= 0) {
      clearInterval(interval);
    }
  }, 1000);
};

const convertSecondsToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
</script>
<template>
  <div>
    <!-- <nav aria-label="breadcrumb">
      <ul>
        <li>
          <router-link to="/dashboard">{{ $t("Dashboard") }}</router-link>
        </li>
        <li>
          <router-link to="/redirects">{{ $t("Magic links") }}</router-link>
        </li>
        <li>
          <router-link to="/redirects">Default Campaign</router-link>
        </li>
        <li>{{ redirectName }}</li>
      </ul>
    </nav> -->
    <hgroup>
      <h1 v-if="isLoading" class="gl-animate-skeleton-loader"></h1>
      <h1 v-else-if="!teamStore.activeTeam">
        {{
          $t("Link ready to use. time left to claim it.", {
            time: convertSecondsToMinutes(timer),
          })
        }}
      </h1>
      <h1 v-else>{{ redirectName ?? $t("Magic link") }}</h1>
      <p v-if="teamStore.activeTeam">
        <router-link to="/redirects">Default Campaign</router-link>
      </p>
    </hgroup>
    <progress v-if="!teamStore.activeTeam" :value="timer" :max="timerLength" />
    <single-q-r
      :showTitle="false"
      :redirectName="redirectName"
      :subscribed="teamStore.activeTeam?.is_billing_exempt || !!subscribedAt"
      v-bind="$props"
      :clicksToday="clicksToday"
      :clicksAllTime="clicksAllTime"
      :bestEndpoint="bestEndpoint"
      :endpoints="endpoints"
      :placements="placements"
      :designs="designs"
      :webhooks="webhooks"
      :alerts="alerts"
      :loading="isLoading"
      :authenticated="!!teamStore.activeTeam"
      :description="teamStore.activeTeam ? undefined : ''"
      :clicksSameTimeYesterday="clicksSameTimeYesterday"
      :remainingClicks="remainingClicks"
      :heatmapData="heatmapData"
      ref="singleQRElement"
    />
  </div>
</template>
