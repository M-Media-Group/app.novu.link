<script setup lang="ts">
import { watch } from "vue";
import LinkReady from "@/assets/linkReady.png";

import { type FileExtension } from "qr-code-styling";
import type { PropType } from "vue";
import type { QRDesign } from "@novulink/types";
import { getRedirectQrCodeDataUrl } from "@novulink/api";
import { useQRCode } from "@/composables/useQRCode";

const props = defineProps({
  /** The UUID of the redirect. If not passed, the rendered data will be to the SPA URL */
  redirectId: {
    type: String,
    required: false,
  },
  designId: {
    type: Number as PropType<QRDesign["id"]>,
    required: false,
  },
  color: {
    type: String as PropType<QRDesign["color"]>,
    default: "#000000",
  },
  backgroundColor: {
    type: String as PropType<QRDesign["background_color"]>,
    default: "#ffffff",
  },
  logoDataUrl: {
    type: String as PropType<QRDesign["logo"]>,
    default: null,
  },
  blockShape: {
    type: String as PropType<QRDesign["block_shape"]>,
    default: "square",
  },
  cornerDotShape: {
    type: String as PropType<QRDesign["corner_dot_shape"]>,
    default: "square",
  },
  cornerShape: {
    type: String as PropType<QRDesign["corner_shape"]>,
    default: "square",
  },
  errorCorrectionLevel: {
    type: String as PropType<QRDesign["error_correction_level"]>,
    default: "medium",
  },
  logoPunchout: {
    type: Boolean as PropType<QRDesign["logo_punchout_background"]>,
    default: true,
  },
  dimensions: {
    type: Number as PropType<QRDesign["size"]>,
    default: 240,
  },
  /** If the card should render as a skeleton loader */
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** The file type, PNG or SVG */
  fileType: {
    type: String as PropType<FileExtension>,
    default: "png",
  },
});

const emit = defineEmits<{
  update: [string | null];
}>();

const appUrl = window.location.href;

const {qrCodeDataURL, isReady, updateQrCode} = useQRCode();

watch(
  () => isReady.value,
  (loading) => {
    if (loading) {
      emit("update", qrCodeDataURL.value);
    }
  },
  { immediate: true }
);

// Watch for all prop changes
watch(
  () => [
    props.color,
    props.backgroundColor,
    props.logoDataUrl,
    props.blockShape,
    props.cornerShape,
    props.cornerDotShape,
    props.redirectId,
    props.dimensions,
    props.fileType,
    props.errorCorrectionLevel,
    props.logoPunchout,
  ],
  () => {
    updateQrCode(
      props.redirectId
        ? getRedirectQrCodeDataUrl(props.redirectId, props.designId)
        : appUrl,
      props.color,
      props.backgroundColor,
      props.logoDataUrl,
      props.blockShape,
      props.cornerShape,
      props.cornerDotShape,
      props.dimensions ? props.dimensions * 2 : 240,
      props.fileType,
      props.errorCorrectionLevel,
      props.logoPunchout
    );
    emit("update", null);
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
  />
  <img
    v-else
    :height="dimensions"
    :width="dimensions"
    :src="qrCodeDataURL ?? LinkReady"
    alt="QR code"
  >
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
