<script lang="ts">
import i18n from "@/locales/i18n";
import {
  getRedirectQrCodeDataUrl,
  getRedirectQrCodeUrl,
  getRedirectUrl,
} from "@/useRedirects";

const t = i18n.global.t;
</script>
<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import { type PropType, computed, onMounted, ref, watch } from "vue";
import CardElement from "@/components/CardElement.vue";
import { removeProtocol } from "@/helpers/urlFormatter";
import TabNav from "../TabNav.vue";
import LineChart from "@/components/charts/LineChart.vue";
import { parseRuleGroup } from "@/useRules";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import type { Endpoint } from "@/types/redirect";
import LinkReady from "@/assets/linkReady.png";
import RedirectSettings from "@/forms/RedirectSettings.vue";

import ConfirmsSubscriptionStart from "@/components/modals/ConfirmsSubscriptionStart.vue";

import QRCodeStyling from "qr-code-styling";

const $bus = useEventsBus();

const props = defineProps({
  /** The UUID of the redirect */
  redirectId: {
    type: String,
    required: true,
  },
  /** The name of the redirect, used when downloading */
  redirectName: {
    type: String,
    required: false,
    default: "Magic link",
  },

  /** When the redirect subscription was started */
  subscribedAt: {
    type: String as PropType<string | null>,
    required: false,
    default: null,
  },

  showTitle: {
    type: Boolean,
    default: true,
  },

  title: {
    type: String,
    default: t("Ready to go"),
  },

  description: {
    type: String,
    default: t(
      "Print, share, and distribute. Your magic link is ready and here to stay."
    ),
  },

  /** The clicks today */
  clicksToday: {
    type: Number,
    required: false,
    default: 0,
  },

  /** The clicks all time */
  clicksAllTime: {
    type: Number,
    required: false,
    default: 0,
  },

  /** Best performing endpoint */
  bestEndpoint: {
    type: String,
    required: false,
    default: "",
  },

  /** All endpoints */
  endpoints: {
    type: Array as PropType<Endpoint[]>,
    required: false,
    default: () => [],
  },
});

const isLoading = ref(false);

const hasBillableRedirects = computed(() => {
  return !!(props.subscribedAt || props.endpoints.length > 1);
});

const copiedTimeout = ref<NodeJS.Timeout | null>(null);

const copyToClipboard = (text: string) => {
  if (!navigator.clipboard) {
    alert("Your browser does not support copying to clipboard");
    return;
  }

  navigator.clipboard.writeText(text);
  $bus.$emit(eventTypes.copied_redirect);

  if (copiedTimeout.value) {
    clearTimeout(copiedTimeout.value);
  }
  copiedTimeout.value = setTimeout(() => {
    copiedTimeout.value = null;
  }, 3000);
};

const downloadQRCode = () => {
  const link = document.createElement("a");
  link.href = qrCodeDataURL.value ?? imgSrc.value ?? LinkReady;
  link.download = `${props.redirectName}.png`;
  link.target = "_blank";
  link.click();
  $bus.$emit(eventTypes.downloaded_redirect_qr_code);
};

const printMagicLink = () => {
  window.print();
};

const openTabs = ref(["1"]);

const lineChartData = computed(() => {
  if (!hasBillableRedirects.value || !props.endpoints.length) {
    return [];
  }
  // Each data item has a clicks_by_time_of_day array, we need to return it. We can flatten the array with flatMap
  const flatData = props.endpoints.flatMap((item) => item.clicks);
  // Sum for each datetime, discard the redirect_uuid
  const groupedData = flatData.reduce((acc, item) => {
    if (!item) {
      return acc;
    }
    // format the key to just hh:mm, Set the minutes to 0 so that we group by hour
    const key = new Date(item.created_at).toLocaleTimeString(undefined, {
      hour: "numeric",
      hour12: false,
    });
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += 1;
    return acc;
  }, {} as Record<string, number>);
  const newData = Object.entries(groupedData)
    .map(([datetime, clickCount]) => ({
      // The name is the datetime, but we need to convert it to local hour by adding or subtracting the timezone offset from GMT. The datetime current format is hh:mm
      name: new Date(`2023-03-03T${datetime}:00Z`).toLocaleTimeString(
        undefined,
        {
          hour: "numeric",
          hour12: false,
        }
      ),
      count: clickCount,
    }))
    // Since the data is hourly, sort and fill in the missing hours with 0
    // First, sort by the hour
    .sort((a, b) => {
      const aHour = parseInt(a.name.split(":")[0]);
      const bHour = parseInt(b.name.split(":")[0]);
      return aHour - bHour;
    });

  // Fill in the missing hours
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const filledData = hours.map((hour) => {
    const found = newData.find((item) => item.name.startsWith(hour));
    if (found) {
      return found;
    }
    return {
      name: hour,
      count: 0,
    };
  });

  return filledData;
});

const scrollUp = (element: HTMLElement) => {
  // Scroll so that the element is at the top of the screen
  element.scrollIntoView({ behavior: "smooth", block: "start" });
};

const qrCodeDataURL = ref<string | null>(null);

const compute2 = async (
  lighColor = "#ffffff",
  darkColor = "#000000",
  logoDataUrl: string | null = null,
  shape = "square" as "square" | "rounded" | "circle"
) => {
  if (!basicUrl.value) {
    return;
  }

  const qrCode = new QRCodeStyling({
    width: 480,
    height: 480,
    type: "svg",
    data: basicUrl.value,
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

  const data = (await qrCode.getRawData()) as Blob;
  // The above is a blob, we need to convert it to a data URL
  const reader = new FileReader();
  reader.readAsDataURL(data);
  reader.onload = () => {
    qrCodeDataURL.value = reader.result as string;
  };
  return reader.result as string;
};

const lightColor = ref("#ffffff");
const darkColor = ref("#000000");
const logoDataUrl = ref<string | null>(null);
const selectedShape = ref("square" as "square" | "rounded" | "circle");

watch(
  [lightColor, darkColor, logoDataUrl, selectedShape],
  async () => {
    await compute2(
      lightColor.value,
      darkColor.value,
      logoDataUrl.value,
      selectedShape.value
    );

    // Scroll up so we can see the QR code
    scrollUp(document.querySelector(".main-grid-display") as HTMLElement);
  },
  { immediate: false }
);

const imgSrc = ref<string | null>(null);
const magicLink = ref<string | null>(null);
const basicUrl = ref<string | null>(null);

onMounted(async () => {
  imgSrc.value = await getRedirectQrCodeUrl(props.redirectId);
  magicLink.value = await getRedirectUrl(props.redirectId);
  basicUrl.value = await getRedirectQrCodeDataUrl(props.redirectId);
  compute2();
});

const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) {
    return;
  }
  const file = target.files[0];
  // Set the local url to the logo
  logoDataUrl.value = file ? URL.createObjectURL(file) : null;
};
</script>

<template>
  <div class="main-grid-display">
    <hgroup class="smaller-gap">
      <h2 v-if="showTitle">{{ title }}</h2>
      <p>{{ description }}</p>
    </hgroup>

    <div class="main-grid-display smaller-gap">
      <img
        height="240"
        width="240"
        :src="qrCodeDataURL ?? imgSrc ?? LinkReady"
        alt="QR code"
      />
    </div>

    <div class="main-grid-display smaller-gap">
      <base-button
        :to="{
          name: 'add-endpoint',
          params: { redirectId: props.redirectId },
        }"
        >{{
          hasBillableRedirects
            ? $t("Add more free destinations")
            : $t("Add more destinations to same code")
        }}</base-button
      >
      <!-- <base-button class="outline">Customise design</base-button> -->
      <details class="dropdown">
        <summary role="button" class="outline">{{ $t("Share") }}</summary>
        <ul>
          <li>
            <a href="#" @click.prevent="downloadQRCode">{{
              $t("Download QR code")
            }}</a>
          </li>
          <li v-if="magicLink">
            <a
              href="#"
              @click.prevent="copyToClipboard(magicLink)"
              v-if="!copiedTimeout"
              >{{ $t("Copy magic link") }}</a
            >
            <a href="#" v-else>{{ $t("Copied!") }}</a>
          </li>
          <li>
            <!-- Print button -->
            <a href="#" @click.prevent="printMagicLink">{{ $t("Print") }}</a>
          </li>
        </ul>
      </details>
    </div>

    <tab-nav
      :options="[
        { render: $t('Analytics'), id: '1' },
        { render: $t('Destinations'), id: '2' },
        // { render: 'Design', id: '3' },
        { render: $t('Settings'), id: '4' },
      ]"
      v-model="openTabs"
      @click="scrollUp($event.target)"
    >
    </tab-nav>
    <div class="main-grid-display smaller-gap" v-show="openTabs.includes('1')">
      <div class="two-column-grid mobile-grid">
        <card-element :loading="isLoading">
          <hgroup v-if="clicksToday !== null">
            <h3>{{ clicksToday }}</h3>
            <p>{{ $t("Scans today") }}</p>
          </hgroup>
        </card-element>

        <card-element :loading="isLoading">
          <hgroup v-if="clicksAllTime !== null">
            <h3>{{ clicksAllTime }}</h3>
            <p>{{ $t("Scans all time") }}</p>
          </hgroup>
        </card-element>
      </div>
      <template v-if="hasBillableRedirects === true">
        <card-element v-if="bestEndpoint">
          <hgroup>
            <h3>{{ removeProtocol(bestEndpoint) }}</h3>
            <p>{{ $t("Best performing destination") }}</p>
          </hgroup>
        </card-element>

        <card-element>
          <hgroup>
            <h2>{{ $t("Scans by time of day") }}</h2>
            <p>{{ $t("By scans") }}</p>
          </hgroup>
          <line-chart v-if="lineChartData" :clickData="lineChartData" />
        </card-element>
      </template>
      <template v-if="hasBillableRedirects !== true">
        <confirms-subscription-start
          :redirectId="props.redirectId"
          :title="$t('Enable advanced analytics')"
          :submitText="$t('Enable advanced analytics')"
        >
          <base-button class="full-width no-margin">
            {{ $t("Enable advanced analytics") }}</base-button
          >
        </confirms-subscription-start>
      </template>

      <base-button class="full-width" to="/analytics" v-else>{{
        $t("Go to advanced analytics")
      }}</base-button>
      <card-element v-if="hasBillableRedirects !== true">
        <hgroup>
          <h2>{{ $t("Scans by time of day") }}</h2>
          <p>{{ $t("By scans") }}</p>
        </hgroup>
        <p>
          {{
            $t(
              "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
            )
          }}
        </p>
      </card-element>
      <card-element v-if="hasBillableRedirects !== true">
        <hgroup>
          <h3>--</h3>
          <p>{{ $t("Best performing destination") }}</p>
        </hgroup>
        <p>
          {{
            $t(
              "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
            )
          }}
        </p>
      </card-element>
    </div>

    <div class="main-grid-display smaller-gap" v-show="openTabs.includes('2')">
      <card-element
        :loading="isLoading"
        v-for="endpoint in endpoints"
        :key="endpoint.id"
      >
        <hgroup>
          <h3>{{ removeProtocol(endpoint.endpoint) }}</h3>
          <p v-if="endpoint.rule_groups[0]">
            {{ $t("If") }} {{ parseRuleGroup(endpoint.rule_groups[0])[0] }}
          </p>
          <p v-else>
            {{ $t("If no rules match") }}
          </p>
        </hgroup>
      </card-element>

      <base-button
        :to="{
          name: 'add-endpoint',
          params: { redirectId: props.redirectId },
        }"
        >{{
          hasBillableRedirects
            ? $t("Add more free destinations")
            : $t("Add more destinations to same code")
        }}</base-button
      >
    </div>

    <div class="main-grid-display smaller-gap" v-show="openTabs.includes('4')">
      <card-element
        :loading="isLoading"
        :title="$t('Code design')"
        :subtitle="$t('Customise the look of your magic link')"
      >
        <div :class="{ disabled: !hasBillableRedirects }">
          <div class="two-column-grid mobile-grid">
            <div>
              <label for="darkColor">{{ $t("Color") }}</label>
              <input
                type="color"
                v-model="darkColor"
                name="darkColor"
                :disabled="!hasBillableRedirects"
              />
            </div>
            <div>
              <label for="lightColor">{{ $t("Background color") }}</label>
              <input
                type="color"
                v-model="lightColor"
                name="lightColor"
                :disabled="!hasBillableRedirects"
              />
            </div>
          </div>

          <label for="shape">{{ $t("Shape") }}</label>
          <select
            name="shape"
            id="shape"
            v-model="selectedShape"
            :disabled="!hasBillableRedirects"
          >
            <option value="square">{{ $t("Square") }}</option>
            <option value="rounded">{{ $t("Rounded") }}</option>
            <option value="circle">{{ $t("Circle") }}</option>
          </select>
        </div>
        <confirms-subscription-start
          :redirectId="props.redirectId"
          :title="$t('Enable custom designs')"
          :submitText="$t('Enable custom designs')"
          v-if="!hasBillableRedirects"
        >
          <base-button class="full-width no-margin">
            {{ $t("Enable custom designs") }}</base-button
          >
        </confirms-subscription-start>
      </card-element>
      <card-element :loading="isLoading">
        <hgroup>
          <h3>{{ $t("Link settings") }}</h3>
        </hgroup>
        <redirect-settings
          :redirectId="props.redirectId"
          :redirectName="props.redirectName"
          :showLabel="true"
        />
      </card-element>
      <card-element :loading="isLoading">
        <hgroup>
          <h3>
            {{
              hasBillableRedirects
                ? $t("Unsubscribe Magic Link")
                : $t("Subscribe Magic Link")
            }}
          </h3>
          <p>
            {{
              hasBillableRedirects
                ? $t(
                    "Remove advanced analytics, multiple destinations, and custom designs"
                  )
                : $t(
                    "Enable advanced analytics, multiple destinations, and custom designs"
                  )
            }}
          </p>
        </hgroup>
        <template v-if="hasBillableRedirects !== true">
          <confirms-subscription-start
            :redirectId="props.redirectId"
            :title="$t('Subscribe')"
            :submitText="$t('Subscribe Magic Link')"
          >
            <base-button class="full-width no-margin">
              {{ $t("Subscribe") }}</base-button
            >
          </confirms-subscription-start>
        </template>
        <base-button v-else class="outline">{{
          $t("Unsubscribe")
        }}</base-button>
      </card-element>
      <!-- Delete card element -->
      <card-element :loading="isLoading">
        <hgroup>
          <h3>{{ $t("Delete Magic Link") }}</h3>
          <p>{{ $t("Delete this magic link and all its destinations") }}</p>
        </hgroup>
        <base-button class="outline">{{ $t("Delete forever") }}</base-button>
      </card-element>
    </div>
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
details > summary {
  text-align: center;
}
.tab-nav {
  margin-top: calc(var(--pico-nav-element-spacing-vertical) * -1);

  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--pico-background-color);
}
</style>
