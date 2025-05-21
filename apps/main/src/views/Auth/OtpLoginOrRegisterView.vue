<script setup lang="ts">
import OtpLoginOrRegister from "@/forms/OtpLoginOrRegister.vue";
import router from "@/router";
import { ref } from "vue";
import CardElement from "@/components/CardElement.vue";
import LinkReady from "@/assets/linkReady.png";
import { loadData } from "@novulink/helpers/dataLoader";
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/user";
import { useTimer } from "@novulink/vue-composables/useTimer";

const timerLength = 60 * 3;

const {timer} = useTimer(timerLength);

const convertSecondsToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const { locale } = useI18n();

const featureData = ref<Awaited<ReturnType<typeof loadData>> | []>([]);

watch(
  locale,
  async (newLocale) => {
    featureData.value = await loadData("features", newLocale);
  },
  {
    immediate: true,
  }
);

const userStore = useUserStore();

watch(
  () => userStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      router.push(
        (router.currentRoute.value.query.redirect as string) ?? "/dashboard"
      );
    }
  }
);
</script>
<template>
  <section class="main-grid-display smaller-gap">
    <img
      height="200"
      width="200"
      :src="LinkReady"
      alt="Link Ready"
    >
    <hgroup>
      <h1>
        {{
          $t("Link ready to use. Sign up free in time to claim it.", {
            time: convertSecondsToMinutes(timer),
          })
        }}
      </h1>
      <p>
        {{
          $t(
            "To change where your magic link goes to, add more endpoints, and customise the design, confirm your contact now."
          )
        }}
      </p>
    </hgroup>
    <progress
      :value="timer"
      :max="timerLength"
    />

    <card-element :title-heading-level="2">
      <otp-login-or-register />
    </card-element>
  </section>
  <section>
    <hgroup>
      <h2>{{ $t("Jam packed with features") }}</h2>
      <p>
        {{
          $t(
            "Across industries, our truly dynamic and automated QR codes are the best way to connect with your audience."
          )
        }}
      </p>
    </hgroup>
    <div class="three-column-grid">
      <card-element
        v-for="feature in featureData"
        :key="feature.id as string"
        :title="`${feature.name}`"
        :subtitle="`${feature.description}`"
        :badges="feature.min_subscription === 0 ? [$t('Free')] : []"
        class="height-100"
      />
    </div>
  </section>
</template>

<style scoped>
/* The image should be 100% to a maximum of 400px */
img {
  min-height: 200px;
  max-height: 40dvh;
  aspect-ratio: 1;

  margin: 0 auto;

  border-radius: var(--pico-border-radius);
}
</style>
