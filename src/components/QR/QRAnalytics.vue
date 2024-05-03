<script setup lang="ts">
import LineChart from "@/components/charts/LineChart.vue";
import CardElement from "@/components/CardElement.vue";
import { removeProtocol } from "@/helpers/urlFormatter";
import BaseButton from "@/components/BaseButton.vue";
import { type PropType, computed } from "vue";

import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";

const props = defineProps({
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
  clicksSameTimeYesterday: {
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
  barChartData: {
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

const percentChange = computed(() => {
  if (props.clicksToday === null || props.clicksSameTimeYesterday === null) {
    return null;
  }
  // If both are 0, return 0
  if (props.clicksToday === 0 && props.clicksSameTimeYesterday === 0) {
    return 0;
  } else if (props.clicksSameTimeYesterday === 0) {
    return 100;
  } else if (props.clicksToday === 0) {
    return -100;
  }
  return Math.round(
    ((props.clicksToday - props.clicksSameTimeYesterday) /
      props.clicksSameTimeYesterday) *
      100
  );
});
</script>
<template>
  <div class="two-column-grid mobile-grid">
    <card-element
      :loading="isLoading"
      :title="clicksToday !== null ? `${clicksToday}` : '--'"
      :subtitle="
        clicksSameTimeYesterday !== null && percentChange !== null
          ? `${$t('Scans today')} (${
              percentChange > 0 ? '+' : ''
            }${percentChange}%)`
          : $t('Scans today')
      "
      :loadingOn="['title']"
    >
    </card-element>

    <card-element
      :loading="isLoading"
      :title="clicksAllTime !== null ? `${clicksAllTime}` : '--'"
      :subtitle="$t('Scans all time')"
      :loadingOn="['title']"
    >
    </card-element>
  </div>
  <template v-if="subscribed">
    <card-element
      :loading="isLoading"
      :loadingOn="['title']"
      :title="
        barChartData !== null
          ? `${barChartData.reduce((sum, item) => sum + item.count, 0)}`
          : '--'
      "
      :subtitle="$t('Scans in the last x minutes', [30])"
    >
      <div
        v-if="isLoading"
        class="placeholder-chart gl-animate-skeleton-loader"
        style="height: 240px"
      ></div>
      <line-chart
        v-else-if="barChartData && barChartData.length > 0"
        :clickData="barChartData"
        height="240px"
      />
      <div v-else class="placeholder-chart" style="height: 240px">
        {{ $t("No data available") }}
      </div>
    </card-element>

    <card-element
      v-if="bestEndpoint"
      :title="removeProtocol(bestEndpoint)"
      :subtitle="$t('Best performing destination')"
      :loading="isLoading"
      :loadingOn="['title']"
    >
    </card-element>

    <card-element
      :title="$t('Scans by time of day')"
      :subtitle="$t('By scans')"
    >
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

    <card-element
      title="--"
      :subtitle="$t('Scans in the last x minutes', [30])"
    >
      <div class="placeholder-chart" style="height: 240px">
        <p>
          {{
            $t(
              "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
            )
          }}
        </p>
      </div>
    </card-element>

    <card-element title="--" :subtitle="$t('Best performing destination')">
      <p>
        {{
          $t(
            "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
          )
        }}
      </p>
    </card-element>

    <card-element
      :title="$t('Scans by time of day')"
      :subtitle="$t('By scans')"
    >
      <div class="placeholder-chart">
        <p>
          {{
            $t(
              "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
            )
          }}
        </p>
      </div>
    </card-element>

    <div class="two-column-grid">
      <card-element :title="$t('Languages')" :subtitle="$t('By scans')">
        <div class="placeholder-chart">
          <p>
            {{
              $t(
                "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
              )
            }}
          </p>
        </div>
      </card-element>
      <card-element :title="$t('Countries')" :subtitle="$t('By scans')">
        <div class="placeholder-chart">
          <p>
            {{
              $t(
                "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
              )
            }}
          </p>
        </div>
      </card-element>
    </div>
  </template>
</template>
