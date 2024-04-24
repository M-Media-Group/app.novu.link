<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import type { PropType } from "vue";
import BaseChart from "./BaseChart.vue";
import { Line } from "vue-chartjs";

ChartJS.register(
  LineElement,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  LineController,
  LinearScale,
  PointElement
);

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
      <Line
        :data="data"
        :options="options"
        @click="handleClick"
        :style="style"
      />
    </template>
  </base-chart>
</template>
