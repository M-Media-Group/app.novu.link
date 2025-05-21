<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";

const props = defineProps({
  fireOnLoad: {
    type: Boolean,
    default: true,
  },
});

const canvas = useTemplateRef('canvas');

const resizeCanvas = () => {
  if (!canvas.value) return;
  if (!canvas.value || !canvas.value.parentElement) return;
  canvas.value.width = canvas.value.parentElement.clientWidth;
  canvas.value.height = canvas.value.parentElement.clientHeight;
};

import {initBurst} from "@novulink/helpers/confetti";

onMounted(() => {
  if (!canvas.value) return;
  resizeCanvas();
  if (props.fireOnLoad) {
    initBurst(canvas.value);
  }
});

// Expose so they can be triggered
defineExpose({ initBurst: () => canvas.value ? initBurst(canvas.value) : null });
</script>
<template>
  <canvas ref="canvas" />
</template>
<style scoped>
/* Canvas takes up whole screen background */
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;

  /* disable / passthrough mouse events */
  pointer-events: none;
  opacity: 0.8;
}
</style>
