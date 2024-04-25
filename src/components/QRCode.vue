<script setup lang="ts">
import { ref, watch } from "vue";
import LinkReady from "@/assets/linkReady.png";

import QRCodeStyling, { type FileExtension } from "qr-code-styling";
import type { PropType } from "vue";
import { getRedirectQrCodeDataUrl } from "@/useRedirects";

const props = defineProps({
  /** The UUID of the redirect */
  redirectId: {
    type: String,
    required: true,
  },
  lightColor: {
    type: String,
    default: "#ffffff",
  },
  darkColor: {
    type: String,
    default: "#000000",
  },
  logoDataUrl: {
    type: String as PropType<string | null>,
    default: null,
  },
  selectedShape: {
    type: String as PropType<"square" | "rounded" | "circle">,
    default: "square",
  },
  dimensions: {
    type: Number,
    default: 240,
  },
  /** If the card should render as a skeleton loader */
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits<{
  update: [string | null];
}>();

const isReady = ref(false);

const qrCodeDataURL = ref<string | null>(null);

const reader = new FileReader();

const qrCode = new QRCodeStyling();

const compute2 = async (
  urlToEncode = "",
  lighColor = "#ffffff",
  darkColor = "#000000",
  logoDataUrl: string | null = null,
  shape = "square" as "square" | "rounded" | "circle",
  dimensions = props.dimensions * 2,
  fileType = "png" as FileExtension
) => {
  qrCode.update({
    width: dimensions * 2,
    height: dimensions * 2,
    data: urlToEncode,
    image: logoDataUrl ?? undefined,
    margin: 2,
    dotsOptions: {
      color: darkColor,
      type: shape === "circle" ? "rounded" : shape,
    },
    backgroundOptions: {
      color: lighColor,
    },
    cornersSquareOptions: {
      color: darkColor,
      // type: shape === "rounded" ? "square" : shape,
    },
    cornersDotOptions: {
      color: darkColor,
      // type: shape === "rounded" ? "dot" : shape,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 2,
    },
    qrOptions: {
      errorCorrectionLevel: "L",
    },
  });

  const data = (await qrCode.getRawData(fileType)) as Blob;
  // The above is a blob, we need to convert it to a data URL
  reader.readAsDataURL(data);
  reader.onload = () => {
    qrCodeDataURL.value = reader.result as string;
    emit("update", qrCodeDataURL.value);

    // set isReady to true and make it non-reactive
    isReady.value = true;
  };
  return reader.result as string;
};

const imgSrc = ref<string | null>(null);

// Watch for all prop changes
watch(
  () => [
    props.lightColor,
    props.darkColor,
    props.logoDataUrl,
    props.selectedShape,
    props.redirectId,
  ],
  () => {
    compute2(
      getRedirectQrCodeDataUrl(props.redirectId),
      props.lightColor,
      props.darkColor,
      props.logoDataUrl,
      props.selectedShape
    );
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div
    v-if="!isReady || loading"
    class="gl-animate-skeleton-loader"
    :style="{ height: dimensions + 'px', width: dimensions + 'px' }"
  ></div>
  <img
    v-else
    :height="dimensions"
    :width="dimensions"
    :src="qrCodeDataURL ?? imgSrc ?? LinkReady"
    alt="QR code"
  />
</template>
<style scoped>
/* The image should be 100% to a maximum of 400px */
img,
.gl-animate-skeleton-loader {
  aspect-ratio: 1;
  margin: 0 auto;
  border-radius: var(--pico-border-radius);
}
</style>
