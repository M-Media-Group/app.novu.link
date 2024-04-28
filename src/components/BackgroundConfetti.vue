<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = defineProps({
  fireOnLoad: {
    type: Boolean,
    default: true,
  },
});

interface ConfettoType {
  randomModifier: number;
  color: { front: string; back: string };
  dimensions: { x: number; y: number };
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  velocity: { x: number; y: number };
  update: () => void;
}

/// Confetti stuff
// ammount to add on each button press
const confettiCount = 200;
const gravityConfetti = 0.2;
const dragConfetti = 0.075;
const terminalVelocity = 8;

const canvas = ref<HTMLCanvasElement | null>(null);
const confetti: ConfettoType[] = [];

const colors = [
  { front: "oklch(63.25% 0.28 24.75)", back: "oklch(56.91% 0.26 28.12)" }, // Purple
  { front: "oklch(53.23% 0.2 252.37)", back: "oklch(45.48% 0.17 252.22)" }, // Light Blue
  { front: "#fff", back: "#f3f3f3" }, // Light Blue
];

const randomRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const initConfettoVelocity = (xRange: number[], yRange: number[]) => {
  const x = randomRange(xRange[0], xRange[1]);
  const range = yRange[1] - yRange[0] + 1;
  let y =
    yRange[1] - Math.abs(randomRange(0, range) + randomRange(0, range) - range);
  if (y >= yRange[1] - 1) {
    y += Math.random() < 0.25 ? randomRange(1, 3) : 0;
  }
  return { x, y: -y };
};
interface Dimensions {
  x: number;
  y: number;
}

interface Position {
  x: number;
  y: number;
}

interface Scale {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

class Confetto {
  randomModifier: number;
  color: { front: string; back: string };
  dimensions: Dimensions;
  position: Position;
  rotation: number;
  scale: Scale;
  velocity: Velocity;

  constructor() {
    this.randomModifier = randomRange(0, 99);
    this.color = colors[Math.floor(randomRange(0, colors.length))];
    this.dimensions = { x: randomRange(5, 9), y: randomRange(8, 15) };
    this.position = {
      x: randomRange(
        canvas.value!.width / 2 - canvas.value!.offsetWidth / 4,
        canvas.value!.width / 2 + canvas.value!.offsetWidth / 4
      ),
      y: randomRange(canvas.value!.height, 0),
    };
    this.rotation = randomRange(0, 2 * Math.PI);
    this.scale = { x: 1, y: 1 };
    this.velocity = initConfettoVelocity([-9, 9], [6, 11]);
  }

  update(): void {
    this.velocity.x -= this.velocity.x * dragConfetti;
    this.velocity.y = Math.min(
      this.velocity.y + gravityConfetti,
      terminalVelocity
    );
    this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09);
  }
}

const initBurst = () => {
  for (let i = 0; i < confettiCount; i++) {
    confetti.push(new Confetto());
  }
};

const render = () => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  confetti.forEach((confetto, index) => {
    const width = confetto.dimensions.x * confetto.scale.x;
    const height = confetto.dimensions.y * confetto.scale.y;

    ctx.translate(confetto.position.x, confetto.position.y);
    ctx.rotate(confetto.rotation);

    confetto.update();

    ctx.fillStyle =
      confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;

    ctx.fillRect(-width / 2, -height / 2, width, height);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  });

  confetti.forEach((confetto, index) => {
    if (!canvas.value) return;
    if (confetto.position.y >= canvas.value.height) confetti.splice(index, 1);
  });

  window.requestAnimationFrame(render);
};

const resizeCanvas = () => {
  if (!canvas.value || !canvas.value.parentElement) return;
  canvas.value.width = canvas.value.parentElement.clientWidth;
  canvas.value.height = canvas.value.parentElement.clientHeight;
};

onMounted(() => {
  resizeCanvas();
  render();
  if (props.fireOnLoad) {
    initBurst();
  }
});

// Expose so they can be triggered
defineExpose({ initBurst });
</script>
<template>
  <canvas ref="canvas"></canvas>
</template>
<style scoped>
/* Canvas takes up whole screen background */
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  /* disable / passthrough mouse events */
  pointer-events: none;
  opacity: 0.8;
}
</style>
