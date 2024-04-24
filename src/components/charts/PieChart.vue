<script setup lang="ts">
import { ArcElement, Chart as ChartJS, Title, Tooltip } from "chart.js";
import type { PropType } from "vue";
import { Pie } from "vue-chartjs";
import BaseChart from "./BaseChart.vue";

ChartJS.register(Title, Tooltip, ArcElement);

defineProps({
  clickData: {
    type: Array as PropType<{ name: string; count: number }[]>,
    required: true,
  },
});
</script>

<template>
  <base-chart :clickData="clickData" :combineData="true">
    <template #default="{ data, options, handleClick, style }">
      <Pie
        :data="data"
        :options="options"
        @click="handleClick"
        :style="style"
      />
    </template>
  </base-chart>
</template>
