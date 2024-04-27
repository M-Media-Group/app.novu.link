<script setup lang="ts">
import LineChart from "@/components/charts/LineChart.vue";
import CardElement from "@/components/CardElement.vue";
import { removeProtocol } from "@/helpers/urlFormatter";
import BaseButton from "@/components/BaseButton.vue";
import type { PropType } from "vue";

import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";

defineProps({
  redirectId: {
    type: String,
    required: true,
    default: null,
  },
  clicksToday: {
    type: Number,
    required: false,
    default: null,
  },
  clicksAllTime: {
    type: Number,
    required: false,
    default: null,
  },
  bestEndpoint: {
    type: String,
    required: false,
    default: null,
  },
  lineChartData: {
    type: Array as PropType<Array<{ name: string; count: number }> | null>,
    required: false,
    default: null,
  },
  subscribed: {
    type: Boolean,
    required: false,
    default: false,
  },

  isLoading: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
<template>
  <div class="two-column-grid mobile-grid">
    <card-element :loading="isLoading">
      <hgroup>
        <h3>{{ clicksToday ?? "--" }}</h3>
        <p>{{ $t("Scans today") }}</p>
      </hgroup>
    </card-element>

    <card-element :loading="isLoading">
      <hgroup>
        <h3>{{ clicksAllTime ?? "--" }}</h3>
        <p>{{ $t("Scans all time") }}</p>
      </hgroup>
    </card-element>
  </div>
  <template v-if="subscribed">
    <card-element v-if="bestEndpoint">
      <hgroup>
        <h3 class="gl-animate-skeleton-loader" v-if="isLoading"></h3>
        <h3 v-else>{{ removeProtocol(bestEndpoint) }}</h3>
        <p>{{ $t("Best performing destination") }}</p>
      </hgroup>
    </card-element>

    <card-element>
      <hgroup>
        <h2>{{ $t("Scans by time of day") }}</h2>
        <p>{{ $t("By scans") }}</p>
      </hgroup>
      <div
        v-if="isLoading"
        class="placeholder-chart gl-animate-skeleton-loader"
      ></div>
      <line-chart
        v-else-if="lineChartData && lineChartData.length > 0"
        :clickData="lineChartData"
      />
      <div v-else class="placeholder-chart">
        {{ $t("No data available") }}
      </div>
    </card-element>

    <base-button class="full-width" to="/analytics">{{
      $t("Go to advanced analytics")
    }}</base-button>
  </template>
  <template v-else>
    <confirms-gate
      :title="$t('Enable advanced analytics')"
      :description="
        $t(
          'Additional destinations and design changes are free after you subscribe.'
        )
      "
      :allowBackgroundClickToClose="false"
      :gate="[
        'confirmedEmailOrPhone',
        {
          name: 'subscribedRedirect',
          options: {
            redirectId,
            title: $t('Enable advanced analytics'),
            submitText: $t('Enable advanced analytics'),
          },
        },
      ]"
    >
      <base-button class="full-width">
        {{ $t("Enable advanced analytics") }}</base-button
      >
    </confirms-gate>

    <card-element>
      <hgroup>
        <h2>{{ $t("Scans by time of day") }}</h2>
        <p>{{ $t("By scans") }}</p>
      </hgroup>
      <p>
        {{
          $t(
            "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
          )
        }}
      </p>
    </card-element>
    <card-element>
      <hgroup>
        <h3>--</h3>
        <p>{{ $t("Best performing destination") }}</p>
      </hgroup>
      <p>
        {{
          $t(
            "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
          )
        }}
      </p>
    </card-element>
  </template>
</template>
