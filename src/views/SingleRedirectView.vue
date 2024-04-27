<script setup lang="ts">
import SingleQR from "@/components/screens/SingleQR.vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useTeamStore } from "@/stores/team";
import { getRedirect } from "@/useRedirects";
import type { Endpoint, Redirect } from "@/types/redirect";

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

// All refs
const redirectName = ref(null as Redirect["name"] | null);
const subscribedAt = ref(null as Redirect["subscribed_at"]);
const clicksToday = ref(0);
const clicksTodayUnique = ref(0);
const clicksAllTime = ref(0);
const bestEndpoint = ref(undefined as Endpoint["endpoint"] | undefined);
const endpoints = ref([] as Endpoint[]);

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

      const totalClicks = () => {
        return response.data.endpoints.reduce((total: any, endpoint: any) => {
          return total + endpoint.clicks.length;
        }, 0);
      };

      const bestPerformingEndpoint = () => {
        return response.data.endpoints.reduce((best: any, endpoint: any) => {
          return best.clicks.length > endpoint.clicks.length ? best : endpoint;
        });
      };

      // set clicksToday and clicksTodayUnique
      clicksToday.value = response.data.endpoints.reduce(
        (total: any, endpoint: any) => {
          return (
            total +
            endpoint.clicks.filter((click: any) => {
              return (
                new Date(click.created_at).toDateString() ===
                new Date().toDateString()
              );
            }).length
          );
        },
        0
      );

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

onMounted(() => {
  $bus.$on(eventTypes.started_subscription, getData);
  $bus.$on(eventTypes.unsubscribed, getData);
  $bus.$on(eventTypes.updated_redirect, getData);
  $bus.$on(eventTypes.updated_endpoint, getData);
  $bus.$on(eventTypes.logged_in, getData);
  $bus.$on(eventTypes.registered, getData);
  if (!teamStore.activeTeam) {
    isLoading.value = false;
    startTimer();
  } else {
    getData();
  }
});

onUnmounted(() => {
  $bus.$off(eventTypes.started_subscription, getData);
  $bus.$off(eventTypes.unsubscribed, getData);
  $bus.$off(eventTypes.updated_redirect, getData);
  $bus.$off(eventTypes.updated_endpoint, getData);
  $bus.$off(eventTypes.logged_in, getData);
  $bus.$off(eventTypes.registered, getData);
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
      <p>
        <router-link to="/redirects">Default Campaign</router-link>
      </p>
    </hgroup>
    <single-q-r
      :showTitle="false"
      :redirectName="redirectName"
      :subscribed="teamStore.activeTeam?.is_billing_exempt || !!subscribedAt"
      v-bind="$props"
      :clicksToday="clicksToday"
      :clicksTodayUnique="clicksTodayUnique"
      :clicksAllTime="clicksAllTime"
      :bestEndpoint="bestEndpoint"
      :endpoints="endpoints"
      :loading="isLoading"
      :authenticated="!!teamStore.activeTeam"
    />
  </div>
</template>
