<script lang="ts">
import i18n from "@/locales/i18n";

const t = i18n.global.t;
</script>
<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import { type PropType, computed, ref } from "vue";
import TabNav from "../TabNav.vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import type { Endpoint } from "@/types/redirect";
import RedirectSettings from "@/forms/RedirectSettings.vue";
import UnsubscribeRedirect from "@/forms/UnsubscribeRedirect.vue";
import QRCode from "@/components/QRCode.vue";
import QRAnalytics from "@/components/QR/QRAnalytics.vue";
import CardElement from "@/components/CardElement.vue";

import { getRedirectUrl } from "@/useRedirects";
import { defineAsyncComponent, watch } from "vue";

import ConfirmsSubscriptionStart from "@/components/modals/ConfirmsSubscriptionStart.vue";

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

  /** When the redirect subscription was started. */
  subscribed: {
    type: Boolean,
    required: false,
    default: false,
  },

  showTitle: {
    type: Boolean,
    default: true,
  },

  title: {
    type: String,
    default: t("Magic link"),
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

  /** The loading state */
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },

  /** IF the user is authenticated */
  authenticated: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const isLoading = ref(false);

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

const qrCodeDataURL = ref<string | null>(null);

const downloadQRCode = () => {
  if (!qrCodeDataURL.value) {
    return;
  }
  const link = document.createElement("a");
  link.href = qrCodeDataURL.value;
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
  if (!props.subscribed || !props.endpoints.length) {
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

const lightColor = ref("#ffffff");
const darkColor = ref("#000000");
const logoDataUrl = ref<string | null>(null);
const selectedShape = ref("square" as "square" | "rounded" | "circle");

const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) {
    return;
  }
  const file = target.files[0];
  // Set the local url to the logo
  logoDataUrl.value = file ? URL.createObjectURL(file) : null;
};

const scrollUp = (element: HTMLElement) => {
  // Scroll so that the element is at the top of the screen
  element.scrollIntoView({ behavior: "smooth", block: "start" });
};

watch([lightColor, darkColor, logoDataUrl, selectedShape], async () => {
  // Scroll up so we can see the QR code
  scrollUp(document.querySelector(".main-grid-display") as HTMLElement);
});

const magicLink = getRedirectUrl(props.redirectId);

const QRDestinations = defineAsyncComponent(
  () => import("@/components/QR/QRDestinations.vue")
);

const OtpLoginOrRegister = defineAsyncComponent(
  () => import("@/forms/OtpLoginOrRegister.vue")
);
</script>

<template>
  <div class="main-grid-display">
    <hgroup class="smaller-gap">
      <h2 v-if="showTitle">{{ title }}</h2>
      <p>{{ description }}</p>
    </hgroup>

    <div class="main-grid-display smaller-gap">
      <details class="dropdown">
        <summary>
          <q-r-code
            :redirectId="props.redirectId"
            :lightColor="lightColor"
            :darkColor="darkColor"
            :logoDataUrl="logoDataUrl"
            :selectedShape="selectedShape"
            @update="qrCodeDataURL = $event"
            :loading="isLoading || loading"
          />
        </summary>
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

    <div class="main-grid-display smaller-gap">
      <p v-if="!authenticated">
        {{
          $t(
            "To change where your magic link goes to, add more endpoints, and customise the design, confirm your contact now."
          )
        }}
      </p>
      <otp-login-or-register v-if="!authenticated" :inline="true" />
      <base-button
        v-else
        :to="{
          name: 'add-endpoint',
          params: { redirectId: props.redirectId },
        }"
        >{{
          subscribed
            ? $t("Add more free destinations")
            : $t("Add more destinations to same code")
        }}</base-button
      >
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
      <q-r-analytics
        :redirectId="redirectId"
        :clicksToday="clicksToday"
        :lineChartData="lineChartData"
        :clicksAllTime="clicksAllTime"
        :bestEndpoint="bestEndpoint"
        :isLoading="isLoading || loading"
        :subscribed="subscribed"
      />
    </div>

    <div class="main-grid-display smaller-gap" v-show="openTabs.includes('2')">
      <q-r-destinations
        :redirectId="redirectId"
        :endpoints="endpoints"
        :isLoading="isLoading || loading"
        :subscribed="subscribed"
      />
    </div>

    <div class="main-grid-display smaller-gap" v-show="openTabs.includes('4')">
      <card-element
        :loading="isLoading || loading"
        :title="$t('Code design')"
        :subtitle="$t('Customise the look of your magic link')"
      >
        <div :class="{ disabled: !subscribed }">
          <div class="two-column-grid mobile-grid">
            <div>
              <label for="darkColor">{{ $t("Color") }}</label>
              <input
                id="darkColor"
                type="color"
                v-model="darkColor"
                name="darkColor"
                :disabled="!subscribed"
              />
            </div>
            <div>
              <label for="lightColor">{{ $t("Background color") }}</label>
              <input
                id="lightColor"
                type="color"
                v-model="lightColor"
                name="lightColor"
                :disabled="!subscribed"
              />
            </div>
          </div>

          <label for="shape">{{ $t("Shape") }}</label>
          <select
            name="shape"
            id="shape"
            v-model="selectedShape"
            :disabled="!subscribed"
          >
            <option value="square">{{ $t("Square") }}</option>
            <option value="rounded">{{ $t("Rounded") }}</option>
            <option value="circle">{{ $t("Circle") }}</option>
          </select>
        </div>
        <confirms-subscription-start
          :redirectId="redirectId"
          :title="$t('Enable custom designs')"
          :submitText="$t('Enable custom designs')"
          v-if="!subscribed"
        >
          <base-button class="full-width no-margin">
            {{ $t("Enable custom designs") }}</base-button
          >
        </confirms-subscription-start>
      </card-element>
      <card-element :loading="isLoading || loading">
        <hgroup>
          <h3>{{ $t("Link settings") }}</h3>
        </hgroup>
        <redirect-settings
          :redirectId="props.redirectId"
          :redirectName="props.redirectName"
          :showLabel="true"
        />
      </card-element>
      <card-element :loading="isLoading || loading">
        <hgroup>
          <h3>
            {{
              subscribed
                ? $t("Unsubscribe Magic Link")
                : $t("Subscribe Magic Link")
            }}
          </h3>
          <p>
            {{
              subscribed
                ? $t(
                    "Remove advanced analytics, multiple destinations, and custom designs"
                  )
                : $t(
                    "Enable advanced analytics, multiple destinations, and custom designs"
                  )
            }}
          </p>
        </hgroup>
        <template v-if="subscribed !== true">
          <confirms-subscription-start
            :redirectId="redirectId"
            :title="$t('Subscribe')"
            :submitText="$t('Subscribe Magic Link')"
          >
            <base-button class="full-width no-margin">
              {{ $t("Subscribe") }}</base-button
            >
          </confirms-subscription-start>
        </template>
        <unsubscribe-redirect v-else :redirectId="props.redirectId" />
      </card-element>
      <!-- Delete card element -->
      <card-element :loading="isLoading || loading">
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

details.dropdown {
  padding: 0;
  width: fit-content;
  margin: 0 auto;
}
details.dropdown > summary {
  margin: 0;
  padding: 0;
  display: flex;
}

details.dropdown summary::after {
  position: absolute;
  bottom: calc(var(--pico-spacing) / 2);
  transform: scale(1.5);
  right: calc(var(--pico-spacing));
}
</style>
