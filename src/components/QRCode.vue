<script setup lang="ts">
import { ref, watch } from "vue";
import LinkReady from "@/assets/linkReady.png";

import QRCodeStyling, { type FileExtension } from "qr-code-styling";
import type { PropType } from "vue";
import { getRedirectQrCodeDataUrl } from "@/useRedirects";
import type { QRDesign } from "@/types/qrDesign";

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

const isReady = ref(false);

const qrCodeDataURL = ref<string | null>(null);

const qrCode = new QRCodeStyling();

const updateQrCode = async (
  urlToEncode = "",
  color = "#000000",
  backgroundColor = "#ffffff",
  logoDataUrl: string | null = null,
  blockShape = "square" as QRDesign["block_shape"],
  cornerShape = "square" as QRDesign["corner_shape"],
  cornerDotShape = "square" as QRDesign["corner_dot_shape"],
  dimensions = props.dimensions ? props.dimensions * 2 : 240,
  fileType = props.fileType,
  errorCorrectionLevel = "medium" as QRDesign["error_correction_level"],
  logoPunchout = props.logoPunchout,
  isLogoUpdate = false // flag to check if this is a logo update
) => {
  qrCode.update({
    width: dimensions * 2,
    height: dimensions * 2,
    data: urlToEncode,
    image: isLogoUpdate ? logoDataUrl ?? undefined : undefined, // Render logo only on update
    margin: 2,
    dotsOptions: {
      color: color,
      type: blockShape === "circle" ? "dots" : blockShape,
    },
    backgroundOptions: {
      color: backgroundColor,
    },
    cornersSquareOptions: {
      color: color,
      type:
        cornerShape === "circle"
          ? "dot"
          : cornerShape === "rounded"
          ? "extra-rounded"
          : cornerShape,
    },
    cornersDotOptions: {
      color: color,
      type: cornerDotShape === "circle" ? "dot" : cornerDotShape,
    },
    imageOptions: {
      hideBackgroundDots: logoPunchout,
      crossOrigin: "anonymous",
      margin: 2,
    },
    qrOptions: {
      errorCorrectionLevel: errorCorrectionLevel.charAt(0).toUpperCase() as
        | "L"
        | "M"
        | "Q"
        | "H",
    },
  });

  const data = (await qrCode.getRawData(fileType)) as Blob;
  const reader = new FileReader();
  reader.readAsDataURL(data);
  reader.onload = () => {
    qrCodeDataURL.value = reader.result as string;
    emit("update", qrCodeDataURL.value);

    // Set isReady to true and make it non-reactive
    isReady.value = true;
  };
  return reader.result as string;
};

const compute2 = async (
  urlToEncode = "",
  color = "#ffffff",
  backgroundColor = "#000000",
  logoDataUrl: string | null = null,
  blockShape = "square" as QRDesign["block_shape"],
  cornerShape = "square" as QRDesign["corner_shape"],
  cornerDotShape = "square" as QRDesign["corner_dot_shape"],
  dimensions = props.dimensions ? props.dimensions * 2 : 240,
  fileType = props.fileType,
  errorCorrectionLevel = "medium" as QRDesign["error_correction_level"],
  logoPunchout = props.logoPunchout
) => {
  // Render the QR code first without the logo
  await updateQrCode(
    urlToEncode,
    color,
    backgroundColor,
    null, // No logo initially
    blockShape,
    cornerShape,
    cornerDotShape,
    dimensions,
    fileType,
    errorCorrectionLevel,
    false // punchout needs to be false initially - some weird rendering bug otherwise
  );

  if (logoDataUrl) {
    // Re-render with the fetched logo
    await updateQrCode(
      urlToEncode,
      color,
      backgroundColor,
      logoDataUrl, // Fetched logo
      blockShape,
      cornerShape,
      cornerDotShape,
      dimensions,
      fileType,
      errorCorrectionLevel,
      logoPunchout,
      true // Logo update flag
    );
  }
};

const imgSrc = ref<string | null>(null);

const appUrl = window.location.href;

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
    compute2(
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
