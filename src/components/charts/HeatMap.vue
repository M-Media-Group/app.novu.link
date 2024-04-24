<script lang="ts" setup>
import { computed } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  matrix: {
    type: Array as PropType<number[][]>,
    required: true,
  },
});

const totalSum = computed(() =>
  props.matrix.reduce(
    (acc, row) => acc + row.reduce((acc, num) => acc + num, 0),
    0
  )
);

const percentageMatrix = computed(() =>
  props.matrix.map((row) => row.map((num) => (num / totalSum.value) * 100))
);

/**
 * This function takes the percentages and normalizes them from 0 to 100, so that the lowest percentage is 0 and the highest is 100,
 */
const normalisedPercentageMatrix = computed(() => {
  // Finding the maximum value in the entire matrix
  const max = Math.max(...percentageMatrix.value.flatMap((row) => row));

  // Normalizing each value based on the maximum value
  return percentageMatrix.value.map((row) =>
    row.map((num) => (num / max) * 100)
  );
});

function getPercentage(number: number) {
  return (number / totalSum.value) * 100;
}

/** This function takes the percentages and normalizes them from 0 to 100, so that the lowest percentage is 0 and the highest is 100, therefore the lowest color is red and the highest is green */
function getSquareColor(x: number, y: number) {
  const percentage = normalisedPercentageMatrix.value[x][y];
  // Interpolating between red (0%) and green (100%)
  const red = Math.round(255 * (1 - percentage / 100));
  const green = Math.round(255 * (percentage / 100));
  return `rgb(${red}, ${green}, 0)`;
}

/** This function chooses pure black or white based on an incoming RGB value and the minimum contrast ratio of 4.5 */
function getContrastColor(rgb: string) {
  const [r, g, b] = rgb
    .slice(4, -1)
    .split(", ")
    .map((num) => parseInt(num));
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return luminance > 0.5 ? "black" : "white";
}
</script>

<template>
  <div class="matrix">
    {{ normalisedPercentageMatrix }}
    <div v-for="(row, i) in matrix" :key="i" class="row">
      <div
        v-for="(number, j) in row"
        :key="j"
        class="square"
        :style="{
          backgroundColor: getSquareColor(i, j),
          color: getContrastColor(getSquareColor(i, j)),
        }"
      >
        {{ getPercentage(number).toFixed(0) }}%
      </div>
    </div>
  </div>
</template>

<style>
.matrix {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
}

.square {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
