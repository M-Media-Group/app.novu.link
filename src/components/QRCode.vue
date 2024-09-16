<script setup lang="ts">
import { ref, watch } from "vue";
import LinkReady from "@/assets/linkReady.png";

import QRCodeStyling, { type FileExtension } from "qr-code-styling";
import type { PropType } from "vue";
import { getRedirectQrCodeDataUrl } from "@/useRedirects";
import type { QRDesign } from "@/types/qrDesign";

const props = defineProps({
  /** The UUID of the redirect */
  redirectId: {
    type: String,
    required: true,
  },
  lightColor: {
    type: String as PropType<QRDesign["color"]>,
    default: "#ffffff",
  },
  darkColor: {
    type: String as PropType<QRDesign["background_color"]>,
    default: "#000000",
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

const reader = new FileReader();

const qrCode = new QRCodeStyling();

/**
 * This function fetches the logo (if its a resource path) and converts it to a data URL
 *
 * @param logoDataUrl The logo data URL or resource path
 * @returns The logo data URL
 * @todo - rethink when/how this is called as it causes delays in rendering. It should ideally render the QR code first and then fetch the logo, then re-render
 */
const fetchLogo = async (logoDataUrl: string | null) => {
  if (!logoDataUrl) return null;

  if (logoDataUrl.startsWith("data:")) return logoDataUrl;

  const response = await fetch(logoDataUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .catch(() => null);
  if (!response) return null;
  const blob = await response.blob();
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise<string>((resolve) => {
    reader.onload = () => {
      resolve(reader.result as string);
    };
  });
};

const compute2 = async (
  urlToEncode = "",
  lighColor = "#ffffff",
  darkColor = "#000000",
  logoDataUrl: string | null = null,
  blockShape = "square" as QRDesign["block_shape"],
  cornerShape = "square" as QRDesign["corner_shape"],
  cornerDotShape = "square" as QRDesign["corner_dot_shape"],
  dimensions = props.dimensions ? props.dimensions * 2 : 240,
  fileType = props.fileType,
  errorCorrectionLevel = "medium" as QRDesign["error_correction_level"],
  logoPunchout = props.logoPunchout
) => {
  if (logoDataUrl) {
    logoDataUrl = await fetchLogo(logoDataUrl).catch(() => null);
  }
  qrCode.update({
    width: dimensions * 2,
    height: dimensions * 2,
    data: urlToEncode,
    image: logoDataUrl ?? undefined,
    margin: 2,
    dotsOptions: {
      color: darkColor,
      type: blockShape === "circle" ? "dots" : blockShape,
    },
    backgroundOptions: {
      color: lighColor,
    },
    cornersSquareOptions: {
      color: darkColor,
      type:
        cornerShape === "circle"
          ? "dot"
          : cornerShape === "rounded"
          ? "extra-rounded"
          : cornerShape,
    },
    cornersDotOptions: {
      color: darkColor,
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
      getRedirectQrCodeDataUrl(props.redirectId),
      props.lightColor,
      props.darkColor,
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
