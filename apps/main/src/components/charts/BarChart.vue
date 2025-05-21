<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import type { PropType } from "vue";
import { Bar } from "vue-chartjs";
import BaseChart from "./BaseChart.vue";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

defineProps({
  clickData: {
    type: Array as PropType<{ name: string; count: number }[]>,
    required: true,
  },
});
</script>

<template>
  <base-chart :click-data="clickData">
    <template #default="{ data, options, handleClick, style }">
      <bar
        :data="data"
        :options="options"
        :style="style"
        @click="handleClick"
      />
    </template>
  </base-chart>
</template>
