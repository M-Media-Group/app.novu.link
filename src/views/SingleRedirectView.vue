<script setup lang="ts">
import SingleQR from "@/components/screens/SingleQR.vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import type { Endpoint } from "@/types/redirect";
import { type PropType, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const $bus = useEventsBus();
const router = useRouter();

defineProps({
  /** The redirect ID to add the endpoint for */
  redirectId: {
    type: String,
    required: true,
  },
  redirectName: {
    type: String,
    required: false,
  },
  clicksToday: {
    type: Number,
    required: false,
    default: 0,
  },
  clicksAllTime: {
    type: Number,
    required: false,
    default: 0,
  },
  bestEndpoint: {
    type: String,
    required: false,
    default: "",
  },
  subscribedAt: {
    type: String as PropType<string | null>,
    default: null,
  },
  /** All endpoints */
  endpoints: {
    type: Array as PropType<Endpoint[]>,
    required: false,
    default: () => [],
  },
});

const refreshPage = () => {
  router.go(0);
};

onMounted(() => {
  $bus.$on(eventTypes.started_subscription, refreshPage);
});

onUnmounted(() => {
  $bus.$off(eventTypes.started_subscription, refreshPage);
});
</script>
<template>
  <div>
    <hgroup>
      <h1>{{ redirectName ?? $t("Magic link") }}</h1>
      <p>
        <router-link to="/redirects">Default Campaign</router-link>
      </p>
    </hgroup>
    <single-q-r
      :showTitle="false"
      :redirectName="redirectName"
      :subscribedAt="subscribedAt"
      v-bind="$props"
    />
  </div>
</template>
