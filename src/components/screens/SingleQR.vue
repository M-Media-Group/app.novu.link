<script lang="ts">
import i18n from "@/locales/i18n";
const t = i18n.global.t;
</script>
<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import { computed, ref } from "vue";

const props = defineProps({
  /** The UUID of the redirect */
  redirectId: {
    type: String,
    required: true,
  },
  /** The name of the redirect, used when downloading */
  redirectName: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    default: t("Ready to go"),
  },

  description: {
    type: String,
    default: t(
      "Print, share, and distribute. Your QR code is ready and here to stay."
    ),
  },
});

const baseUrl = import.meta.env.VITE_BASE_URL;

const imgSrc = computed(() => {
  return `${baseUrl}api/v1/redirects/${props.redirectId}/qr`;
});

const magicLink = computed(() => {
  return `${baseUrl}r/${props.redirectId}`;
});

const copiedTimeout = ref<NodeJS.Timeout | null>(null);

const copyToClipboard = (text: string) => {
  if (!navigator.clipboard) {
    return;
  }

  navigator.clipboard.writeText(text);

  if (copiedTimeout.value) {
    clearTimeout(copiedTimeout.value);
  }
  copiedTimeout.value = setTimeout(() => {
    copiedTimeout.value = null;
  }, 3000);
};
</script>
<template>
  <div class="main-grid-display">
    <hgroup class="smaller-gap">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </hgroup>

    <img height="310" width="310" :src="imgSrc" alt="QR code" />

    <div class="main-grid-display smaller-gap">
      <base-button :to="`/redirects/${props.redirectId}/endpoints/add`"
        >Add more destinations to same code</base-button
      >
      <!-- <base-button class="outline">Customise design</base-button> -->
      <a
        :download="`${props.redirectName}.png`"
        :href="imgSrc"
        target="_blank"
        rel="noopener noreferrer"
        >Download QR code</a
      >
      <a
        href="#"
        @click.prevent="copyToClipboard(magicLink)"
        v-if="!copiedTimeout"
        >Copy magic link</a
      >
      <a href="#" v-else>Copied!</a>
    </div>
  </div>
</template>
<style scoped>
/* The image should be 100% to a maximum of 400px */
img {
  max-width: 400px;
  max-height: 400px;
  width: 100%;
}
</style>
