<script setup lang="ts">
import SingleQR from "@/components/screens/SingleQR.vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useTeamStore } from "@/stores/team";
import { getRedirect } from "@/repositories/redirect/redirectRepository";
import type { Endpoint } from "@novulink/types";
import { useQuery } from "@tanstack/vue-query";
import { assertIsUnifiedError } from "@/services/api/apiServiceErrorHandler";

import { useRedirectEventListeners } from "@/composables/useRedirectEventListeners";

const router = useRouter();

const teamStore = useTeamStore();

const props = defineProps({
  /** The redirect ID to add the endpoint for */
  redirectId: {
    type: String,
    required: true,
  },
});

const singleQRElement = ref();

const bestEndpoint = ref(undefined as Endpoint["endpoint"] | undefined);

const { isPending, data, error, refetch } = useQuery({
  queryKey: ["redirects", props.redirectId],
  queryFn: async () => {
    try {
      return await getRedirect({ id: props.redirectId });
    } catch (error) {
      assertIsUnifiedError(error);
      if (error.status === 404) {
        router.push("/404");
      }
    }
  },
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

const localClicks = ref(0);

useRedirectEventListeners(refetch, localClicks);

const clicksAllTime = computed(() => {
  // Sum of all clicks from all endpoints
  return (
    localClicks.value +
    (data.value?.endpoints.reduce((acc, endpoint) => {
      const totalSum = endpoint.clicks_by_time_of_day.reduce(
        (acc, curr) => acc + curr.click_count,
        0
      );
      return acc + (totalSum ?? 0);
    }, 0) ?? 0)
  );
});
</script>
<template>
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
    <h1 v-if="isPending" class="gl-animate-skeleton-loader"></h1>
    <h1 v-else-if="!teamStore.activeTeam">
      {{
        $t("Link ready to use. time left to claim it.", {
          time: convertSecondsToMinutes(timer),
        })
      }}
    </h1>
    <h1 v-else>{{ data?.name ?? $t("Magic link") }}</h1>
    <p v-if="teamStore.activeTeam">
      <router-link to="/redirects">Default Campaign</router-link>
    </p>
  </hgroup>
  <progress v-if="!teamStore.activeTeam" :value="timer" :max="timerLength" />
  <single-q-r
    :showTitle="false"
    :redirectName="data?.name"
    :subscribed="
      teamStore.activeTeam?.is_billing_exempt || !!data?.subscribed_at
    "
    v-bind="$props"
    :clicksToday="localClicks + (data?.todays_clicks_count ?? 0)"
    :clicksAllTime="clicksAllTime"
    :bestEndpoint="bestEndpoint"
    :endpoints="data?.endpoints"
    :placements="data?.sources"
    :designs="data?.qr_designs"
    :webhooks="data?.webhooks"
    :alerts="data?.alerts"
    :loading="isPending"
    :authenticated="!!teamStore.activeTeam"
    :description="teamStore.activeTeam ? undefined : ''"
    :clicksSameTimeYesterday="data?.yesterdays_clicks_up_to_now_count"
    :remainingClicks="data?.remaining_clicks"
    :heatmapData="data?.heatmap"
    ref="singleQRElement"
  />
</template>
