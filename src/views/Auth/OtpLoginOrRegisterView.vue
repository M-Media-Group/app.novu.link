<script setup lang="ts">
import OtpLoginOrRegister from "@/forms/OtpLoginOrRegister.vue";
import router from "@/router";
import { ref } from "vue";
import CardElement from "@/components/CardElement.vue";
import LinkReady from "@/assets/linkReady.png";

const redirect = () => {
  // Redirect to the home page
  router.push(
    (router.currentRoute.value.query.redirect as string) ?? "/dashboard"
  );
};

const timerLength = 60 * 3;

/**
 * A timer that shows a countdown (mm:ss)
 */
const timer = ref(timerLength);

const startTimer = () => {
  const interval = setInterval(() => {
    timer.value -= 1;
    if (timer.value <= 0) {
      clearInterval(interval);
    }
  }, 1000);
};

startTimer();

const convertSecondsToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
</script>
<template>
  <div class="main-grid-display">
    <img height="240" width="240" :src="LinkReady" alt="Link Ready" />
    <h1>
      {{
        $t("Link ready to use. time left to claim it.", {
          time: convertSecondsToMinutes(timer),
        })
      }}
    </h1>
    <progress :value="timer" :max="timerLength" />

    <p>
      To change where your magic link goes to, add more endpoints, and customise
      the design, confirm your email now.
    </p>
    <card-element :titleHeadingLevel="2">
      <otp-login-or-register @success="redirect" />
    </card-element>
  </div>
</template>

<style scoped>
/* The image should be 100% to a maximum of 400px */
img {
  min-height: 240px;
  max-height: 40dvh;
  aspect-ratio: 1;

  margin: 0 auto;

  border-radius: var(--pico-border-radius);
}
</style>
