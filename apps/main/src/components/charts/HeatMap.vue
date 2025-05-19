<script lang="ts" setup>
import { computed } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  matrix: {
    type: Array as PropType<number[][]>,
    required: true,
  },
  xLabels: {
    type: Array as PropType<string[]>,
    required: false,
    default: () => [],
  },
  yLabels: {
    type: Array as PropType<string[]>,
    required: false,
    default: () => [],
  },
  flipXY: {
    type: Boolean,
    required: false,
    default: false,
  },
});

// Return either the original or flipped matrix based on the flipXY prop
const matrix = computed(() =>
  props.flipXY
    ? props.matrix[0].map((_, i) => props.matrix.map((row) => row[i]))
    : props.matrix
);

const xLabels = computed(() =>
  props.flipXY
    ? props.yLabels
    : props.xLabels.length > 0
    ? props.xLabels
    : Array.from({ length: matrix.value.length }, (_, i) => i + 1)
);

const yLabels = computed(() =>
  props.flipXY
    ? props.xLabels.length > 0
      ? props.xLabels
      : Array.from({ length: matrix.value[0].length }, (_, i) => i + 1)
    : props.yLabels
);

const totalSum = computed(() =>
  matrix.value.reduce(
    (acc, row) => acc + row.reduce((acc, num) => acc + num, 0),
    0
  )
);

const percentageMatrix = computed(() =>
  matrix.value.map((row) => row.map((num) => (num / totalSum.value) * 100))
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

  // If the percentage is 0, return masked (gray) color
  if (percentage === 0) {
    return "transparent";
  }

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
  <div class="overflow-auto">
    <table>
      <tbody>
        <!-- Table Rows with Label Column -->
        <tr v-for="(row, i) in matrix" :key="i">
          <!-- Label Column (Row Number) -->
          <td class="label-column">{{ xLabels[i] ?? i + 1 }}</td>

          <!-- Heatmap Cells -->
          <td
            v-for="(number, j) in row"
            :key="j"
            :style="{
              backgroundColor: getSquareColor(i, j),
              color: getContrastColor(getSquareColor(i, j)),
            }"
          >
            {{ getPercentage(number).toFixed(0) }}%
          </td>
        </tr>

        <!-- Label Row at the Bottom -->
        <tr>
          <td></td>
          <!-- Empty cell for alignment -->
          <td
            class="label-row"
            v-for="(col, j) in matrix[0]"
            :key="'label-' + j"
          >
            {{ yLabels[j] ?? j + 1 }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.overflow-auto {
  height: 47vh;
}
.label-column {
  position: sticky;
  left: 0px;
  top: 0px;
}

.label-row {
  position: sticky;
  left: 0px;
  bottom: 0px;
}
</style>
