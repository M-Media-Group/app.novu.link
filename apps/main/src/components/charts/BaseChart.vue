<script setup lang="ts">
import { getCssVarForStripe } from "@/helpers/cssVariables";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { type PropType, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  clickData: {
    type: Array as PropType<{ name: string; count: number }[]>,
    required: true,
  },
  combineData: {
    type: Boolean,
    default: false,
  },
  height: {
    type: String,
    default: "47vh",
  },
});

const combineDatasets = () => {
  const combinedData = props.clickData.reduce(
    (acc, curr) => {
      acc.data.push(curr.count);
      //   We'll add the labels from "name"
      acc.labels.push(curr.name);
      return acc;
    },
    { labels: [] as string[], data: [] as number[] }
  );

  return [
    {
      label: t("All scans"),
      data: combinedData.data,
      hidden: false,
      backgroundColor: getCssVarForStripe("pico-primary-background"),
      color: getCssVarForStripe("pico-primary"),
      borderColor: getCssVarForStripe("pico-contrast-border"),
      labels: combinedData.labels,
    },
  ];
};

const datasets = ref(
  props.combineData
    ? combineDatasets()
    : props.clickData.map((item) => ({
        label: item.name,
        data: [item.count],
        hidden: false,
        backgroundColor: getCssVarForStripe("pico-primary-background"),
        color: getCssVarForStripe("pico-primary"),
        borderColor: getCssVarForStripe("pico-primary-border"),
        labels: undefined,
      }))
);

const data = ref({
  labels: props.combineData ? datasets.value[0].labels : [t("Scans")],
  datasets: datasets.value,
});

const options = {
  responsive: true,
  // Always start at 0
  scales: {
    y: {
      beginAtZero: true,
      // Minimum step 1
      ticks: {
        stepSize: 1,
      },
    },
  },
};

const handleClick = (event: MouseEvent, items: any[]) => {
  console.log(event, items);
};
</script>

<template>
  <slot
    v-bind:datasets="datasets"
    v-bind:data="data"
    v-bind:options="options"
    v-bind:handleClick="handleClick"
    :style="{ width: '100%', height }"
  />
</template>
