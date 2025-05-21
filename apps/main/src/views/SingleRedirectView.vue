<script setup lang="ts">
import SingleQR from "@/components/screens/SingleQR.vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useTeamStore } from "@/stores/team";
import { getRedirect } from "@novulink/api";
import type { Endpoint } from "@novulink/types";
import { useQuery } from "@tanstack/vue-query";
import { assertIsUnifiedError } from "@novulink/api";

import { useRedirectEventListeners } from "@/composables/useRedirectEventListeners";
import { useTimer } from "@novulink/vue-composables/useTimer";

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

const { isPending, data, refetch } = useQuery({
  queryKey: ["redirects", props.redirectId],
  queryFn: async () => {
    try {
      const result = await getRedirect({ id: props.redirectId });
      localClicks.value = 0;
      return result;
    } catch (error) {
      assertIsUnifiedError(error);
      if (error.status === 404) {
        router.push("/404");
      }
    }
  },
});

const convertSecondsToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const localClicks = ref(0);

useRedirectEventListeners(() => refetch(), localClicks);

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

const timerLength = 60 * 3;

const {timer} = useTimer(timerLength);
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
    <h1
      v-if="isPending"
      class="gl-animate-skeleton-loader"
    />
    <h1 v-else-if="!teamStore.activeTeam">
      {{
        $t("Link ready to use. time left to claim it.", {
          time: convertSecondsToMinutes(timer),
        })
      }}
    </h1>
    <h1 v-else>
      {{ data?.name ?? $t("Magic link") }}
    </h1>
    <p v-if="teamStore.activeTeam">
      <router-link to="/redirects">
        Default Campaign
      </router-link>
    </p>
  </hgroup>
  <progress
    v-if="!teamStore.activeTeam"
    :value="timer"
    :max="timerLength"
  />
  <single-q-r
    v-bind="$props"
    ref="singleQRElement"
    :show-title="false"
    :redirect-name="data?.name"
    :subscribed="
      teamStore.activeTeam?.is_billing_exempt || !!data?.subscribed_at
    "
    :clicks-today="localClicks + (data?.todays_clicks_count ?? 0)"
    :clicks-all-time="clicksAllTime"
    :best-endpoint="bestEndpoint"
    :endpoints="data?.endpoints"
    :placements="data?.sources"
    :designs="data?.qr_designs"
    :webhooks="data?.webhooks"
    :alerts="data?.alerts"
    :loading="isPending"
    :authenticated="!!teamStore.activeTeam"
    :description="teamStore.activeTeam ? undefined : ''"
    :clicks-same-time-yesterday="data?.yesterdays_clicks_up_to_now_count"
    :remaining-clicks="data?.remaining_clicks"
    :heatmap-data="data?.heatmap"
  />
</template>
