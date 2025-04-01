<script lang="ts">
import i18n from "@/locales/i18n";

const t = i18n.global.t;
</script>
<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import { type PropType, type Ref, computed, ref } from "vue";
import TabNav from "../TabNav.vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import type { Alert, Endpoint, Placement, Webhook } from "@/types/redirect";
import type { selectOption } from "@/types/listItem";
import RedirectSettings from "@/forms/RedirectSettings.vue";
import UnsubscribeRedirect from "@/forms/UnsubscribeRedirect.vue";
import QRCode from "@/components/QRCode.vue";
import QRAnalytics from "@/components/QR/QRAnalytics.vue";
import QRPlacements from "@/components/QR/QRPlacements.vue";
import QRDesigns from "@/components/QR/QRDesigns.vue";
import QRAlerts from "@/components/QR/QRAlerts.vue";
import CardElement from "@/components/CardElement.vue";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import BaseBadge from "@/components/BaseBadge.vue";

import BaseModal from "@/components/modals/BaseModal.vue";

import type { FileExtension } from "qr-code-styling";
import { isError } from "@/helpers/httpCodes";
import type { HexColor, QRDesign } from "@/types/qrDesign";

import BackgroundConfetti from "@/components/BackgroundConfetti.vue";

import { deleteRedirect, getRedirectUrl } from "@/useRedirects";
import { defineAsyncComponent, watch } from "vue";

import QRIntegrations from "../QR/QRIntegrations.vue";

const $bus = useEventsBus();

const props = defineProps({
  /** The UUID of the redirect */
  redirectId: {
    type: String,
    required: true,
  },
  /** The name of the redirect, used when downloading */
  redirectName: {
    type: String as PropType<string | null>,
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

  /** The clicks by same time yesterday */
  clicksSameTimeYesterday: {
    type: Number as PropType<number | null>,
    required: false,
    default: null,
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

  /** All the placements */
  placements: {
    type: Array as PropType<Placement[]>,
    required: false,
    default: () => [],
  },

  /** All endpoints */
  endpoints: {
    type: Array as PropType<Endpoint[]>,
    required: false,
    default: () => [],
  },

  webhooks: {
    type: Array as PropType<Webhook[]>,
    required: false,
    default: () => [],
  },

  alerts: {
    type: Array as PropType<Alert[]>,
    required: false,
    default: () => [],
  },

  /** All designs */
  designs: {
    type: Array as PropType<QRDesign[]>,
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

  /** The remaining clicks in the users subscription */
  remainingClicks: {
    type: Number,
    required: false,
  },

  /** The heatmap data (weekdays / hours) */
  heatmapData: {
    type: Array as PropType<number[][]>,
    required: false,
    default: null,
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
  link.download = `${props.redirectName}.${selectedFileType.value}`;
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
  // Each data item has a clicks_by_time_of_day[x].clicks_count array, we need to return it. We can flatten the array with flatMap
  const flatData = props.endpoints.flatMap(
    (endpoint) => endpoint.clicks_by_time_of_day
  );

  // Sum for each datetime, discard the redirect_uuid
  const groupedData = flatData.reduce((acc, item) => {
    if (!item) {
      return acc;
    }
    // format the key to just hh:mm, Set the minutes to 0 so that we group by hour.

    const date = new Date();
    // Set hour and minutes to the datetime
    date.setHours(
      parseInt(item.datetime.split(":")[0]),
      parseInt(item.datetime.split(":")[1])
    );
    const key = date.toLocaleTimeString(undefined, {
      hour: "numeric",
      hour12: false,
    });
    acc[key] = (acc[key] || 0) + item.click_count;
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

// The barChartData takes the "clicks_by_minute": [
// 	{
// 		"matched_endpoint_id": 1054,
// 		"datetime": "40",
// 		"click_count": 1
// 	}
// ],

// Note that the datetime represents a minute in the hour. We need to compute time-ago and plot 0-30 minutes ago.

const barChartData = computed(() => {
  if (!props.subscribed || !props.endpoints.length) {
    return [];
  }
  // Each data item has a clicks_by_time_of_day[x].clicks_count array, we need to return it. We can flatten the array with flatMap
  const flatData = props.endpoints.flatMap(
    (endpoint) => endpoint.clicks_by_minute
  );

  // Sum for each datetime, discard the redirect_uuid
  const groupedData = flatData.reduce((acc, item) => {
    if (!item) {
      return acc;
    }
    // Her we just have "mm" value. If for example the current time is 13:45, and the datetime is 40, then the click was 5 minutes ago.
    const date = new Date();
    // Get how many minutes ago the click was
    const minutesAgo = date.getMinutes() - parseInt(item.datetime);
    // The minutesAgo will be out key
    acc[minutesAgo] = (acc[minutesAgo] || 0) + item.click_count;
    return acc;
  }, {} as Record<string, number>);

  // Fill in the missing minutes
  const minutes = Array.from({ length: 30 }, (_, i) => i.toString());
  const filledData = minutes.map((minute) => {
    const found = groupedData[minute];
    if (found) {
      return {
        name: minute,
        count: found,
      };
    }
    return {
      name: minute,
      count: 0,
    };
  });

  return filledData.reverse();
});

const color = ref("#000000") as Ref<HexColor>;
const backgroundColor = ref("#ffffff") as Ref<HexColor>;
const logoDataUrl = ref<string | null>(null);
const logoPunchout = ref(true) as Ref<QRDesign["logo_punchout_background"]>;
const blockShape = ref("square") as Ref<QRDesign["block_shape"]>;
const cornerDotShape = ref("square") as Ref<QRDesign["corner_dot_shape"]>;
const cornerShape = ref("square") as Ref<QRDesign["corner_shape"]>;
const selectedFileType = ref("png" as FileExtension);
const errorCorrectionLevel = ref("medium") as Ref<
  QRDesign["error_correction_level"]
>;

// Watch for props.designs changes
watch(
  () => props.designs,
  (designs) => {
    if (designs.length) {
      const defaultDesign = designs.find((design) => design.pivot?.is_default);
      if (defaultDesign) {
        selectedDesignId.value = defaultDesign.id;
        color.value = defaultDesign.color;
        backgroundColor.value = defaultDesign.background_color;
        blockShape.value = defaultDesign.block_shape;
        cornerDotShape.value = defaultDesign.corner_dot_shape;
        cornerShape.value = defaultDesign.corner_shape;
        errorCorrectionLevel.value = defaultDesign.error_correction_level;
        logoDataUrl.value = defaultDesign.logo ?? null;
        logoPunchout.value = defaultDesign.logo_punchout_background;
      }
    }
  }
);

const scrollUp = (element: HTMLElement) => {
  // Scroll so that the element is at the top of the screen
  element.scrollIntoView({ behavior: "smooth", block: "start" });
};

watch(
  [
    color,
    backgroundColor,
    logoDataUrl,
    blockShape,
    cornerShape,
    cornerDotShape,
    errorCorrectionLevel,
    logoPunchout,
  ],
  async () => {
    // Scroll up so we can see the QR code
    scrollUp(document.querySelector(".main-grid-display") as HTMLElement);
  }
);

const magicLink = getRedirectUrl(props.redirectId);

const QRDestinations = defineAsyncComponent(
  () => import("@/components/QR/QRDestinations.vue")
);

const OtpLoginOrRegister = defineAsyncComponent(
  () => import("@/forms/OtpLoginOrRegister.vue")
);

const confetti = ref();

const triggerSuccess = () => {
  confetti.value.initBurst();
};

defineExpose({
  triggerSuccess,
});

const deleteCurrentRedirect = async () => {
  isLoading.value = true;
  const response = await deleteRedirect(props.redirectId).catch((error) => {
    alert(
      t("An error occurred. Please try again later.") +
        " " +
        error.response.data.message
    );
    return error.response;
  });
  isLoading.value = false;
  if (response.status === 200) {
    $bus.$emit(eventTypes.deleted_redirect);
  }
};

const toggleQRCodeDropdown = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const dropdown = target.closest("details");
  if (dropdown) {
    dropdown.toggleAttribute("open");
  }
};

const testClicks = ref(0);

const selectedDesignId = ref<number | undefined>(undefined);

const handleInputUpdated = (data: QRDesign) => {
  if (data.id !== undefined) {
    selectedDesignId.value = data.id;
  }

  if (data.color) {
    color.value = data.color;
  }

  if (data.background_color) {
    backgroundColor.value = data.background_color;
  }

  if (data.block_shape) {
    blockShape.value = data.block_shape;
  }

  if (data.corner_dot_shape) {
    cornerDotShape.value = data.corner_dot_shape;
  }

  if (data.corner_shape) {
    cornerShape.value = data.corner_shape;
  }

  if (data.error_correction_level) {
    errorCorrectionLevel.value = data.error_correction_level;
  }

  if (data.logo !== undefined) {
    logoDataUrl.value = data.logo;
  }

  if (data.logo_punchout_background !== undefined) {
    logoPunchout.value = data.logo_punchout_background;
  }
};

const testLink = () => {
  testClicks.value++;
  $bus.$emit(eventTypes.tested_redirect);
};
</script>

<template>
  <background-confetti ref="confetti" :fireOnLoad="false" />
  <div class="two-column-grid four-two-grid flex-start reverse">
    <div class="main-grid-display sticky-on-desktop">
      <hgroup class="smaller-gap">
        <h2 v-if="showTitle">{{ title }}</h2>
        <p>{{ description }}</p>
      </hgroup>

      <div class="main-grid-display smaller-gap">
        <details
          class="dropdown qr-dropdown"
          @contextmenu.prevent="toggleQRCodeDropdown"
        >
          <summary>
            <q-r-code
              :redirectId="props.redirectId"
              :designId="selectedDesignId"
              :color="color"
              :backgroundColor="backgroundColor"
              :logoDataUrl="logoDataUrl"
              :logoPunchout="logoPunchout"
              :blockShape="blockShape"
              :cornerShape="cornerShape"
              :cornerDotShape="cornerDotShape"
              :errorCorrectionLevel="errorCorrectionLevel"
              @update="qrCodeDataURL = $event"
              :loading="(isLoading || loading) && !props.redirectId"
              :fileType="selectedFileType"
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
            <li v-if="magicLink">
              <a :href="magicLink" target="_blank" @click="testLink">{{
                $t("Test link")
              }}</a>
            </li>
            <li>
              <!-- Print button -->
              <router-link to="/products"
                >{{ $t("Order and print on cups, t-shirts, and more") }}
                <base-badge>{{ $t("New") }}</base-badge>
              </router-link>
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
              "Claim your link now to edit designs, manage destinations, and see analytics."
            )
          }}
        </p>
        <card-element v-if="!authenticated">
          <otp-login-or-register
            :inline="true"
            :autofocus="false"
            :submitText="$t('Claim link')"
          />
        </card-element>

        <!-- Add a test button if the link has never been clicked -->
        <template
          v-else-if="!loading && !clicksAllTime && !clicksToday && !testClicks"
        >
          <base-button
            :href="magicLink"
            target="_blank"
            class="full-width"
            @click="testLink"
            >{{ $t("Test link") }}</base-button
          >
        </template>

        <template
          v-else-if="
            !loading && remainingClicks !== undefined && remainingClicks <= 0
          "
        >
          <p>
            {{
              $t(
                "You have reached your limit of clicks and scans. Subscribe to re-enable your QR code."
              )
            }}
          </p>
          <confirms-gate
            :title="$t('Add redirect credits')"
            :description="
              $t(
                'Additional destinations and design changes are free after you subscribe.'
              )
            "
            :allowBackgroundClickToClose="false"
            :gate="[
              'confirmedEmailOrPhone',
              {
                name: 'subscribedRedirect',
                options: {
                  redirectId,
                  title: $t('Add redirect credits'),
                  submitText: $t('Add redirect credits'),
                },
              },
            ]"
          >
            <base-button class="full-width contrast">
              {{ $t("Re-enable magic link") }}</base-button
            >
          </confirms-gate>
        </template>

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
    </div>
    <div class="main-grid-display">
      <tab-nav
        :options="
          [
            { render: $t('Analytics'), id: '1' },
            {
              render: $t('Destinations'),
              id: '2',
              badge:
                props.endpoints.filter(
                  (endpoint) =>
                    endpoint.last_http_code &&
                    isError(endpoint.last_http_code)
                ).length > 0
                  ? true
                  : undefined,
            },
            { render: $t('Designs'), id: '4' },
            { render: $t('Alerts'), id: '7' },
            placements.length > 1
              ? { render: $t('Placements'), id: '3' }
              : undefined,
            { render: $t('Integrations'), id: '6' },
            { render: $t('Settings'), id: '5' },
          ].filter(Boolean) as selectOption[]
        "
        v-model="openTabs"
        @click="scrollUp($event.target)"
      >
      </tab-nav>
      <div
        class="main-grid-display smaller-gap"
        v-show="openTabs.includes('1')"
      >
        <q-r-analytics
          :redirectId="redirectId"
          :clicksToday="!authenticated ? undefined : clicksToday"
          :clicksSameTimeYesterday="
            !authenticated ? undefined : clicksSameTimeYesterday ?? undefined
          "
          :lineChartData="!authenticated ? undefined : lineChartData"
          :barChartData="!authenticated ? undefined : barChartData"
          :clicksAllTime="!authenticated ? undefined : clicksAllTime"
          :bestEndpoint="!authenticated ? undefined : bestEndpoint"
          :isLoading="isLoading || loading"
          :subscribed="subscribed"
          :heatmapData="!authenticated ? undefined : heatmapData"
        />
      </div>

      <div
        class="main-grid-display smaller-gap"
        v-show="openTabs.includes('2')"
      >
        <q-r-destinations
          :redirectId="redirectId"
          :endpoints="endpoints"
          :isLoading="isLoading || loading"
          :subscribed="subscribed"
        />
      </div>

      <div
        class="main-grid-display smaller-gap"
        v-show="openTabs.includes('3')"
      >
        <q-r-placements
          :redirectId="redirectId"
          :placements="placements"
          :isLoading="isLoading || loading"
          :subscribed="subscribed"
        />
      </div>

      <div
        class="main-grid-display smaller-gap"
        v-show="openTabs.includes('4')"
      >
        <q-r-designs
          :redirectId="redirectId"
          :designs="designs"
          :isLoading="isLoading || loading"
          :subscribed="subscribed"
          @input_updated="handleInputUpdated"
        />
      </div>

      <div
        class="main-grid-display smaller-gap"
        v-show="openTabs.includes('6')"
      >
        <q-r-integrations
          :redirectId="redirectId"
          :isLoading="isLoading || loading"
          :subscribed="subscribed"
          :webhooks="webhooks"
        />
      </div>

      <div
        class="main-grid-display smaller-gap"
        v-show="openTabs.includes('5')"
      >
        <card-element :loading="isLoading || loading">
          <hgroup>
            <h3>{{ $t("Link settings") }}</h3>
          </hgroup>
          <redirect-settings
            :redirectId="props.redirectId"
            :redirectName="props.redirectName ?? undefined"
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
            <confirms-gate
              :title="$t('Subscribe')"
              :description="
                $t(
                  'Additional destinations and design changes are free after you subscribe.'
                )
              "
              :allowBackgroundClickToClose="false"
              :gate="[
                'confirmedEmailOrPhone',
                {
                  name: 'subscribedRedirect',
                  options: {
                    redirectId,
                    title: $t('Subscribe'),
                    submitText: $t('Subscribe Magic Link'),
                  },
                },
              ]"
            >
              <base-button class="full-width">
                {{ $t("Subscribe") }}</base-button
              >
            </confirms-gate>
          </template>
          <unsubscribe-redirect v-else :redirectId="props.redirectId" />
        </card-element>
        <!-- Delete card element -->
        <card-element :loading="isLoading || loading">
          <hgroup>
            <h3>{{ $t("Delete Magic Link") }}</h3>
            <p>{{ $t("Delete this magic link and all its destinations") }}</p>
          </hgroup>
          <p v-if="!authenticated">
            {{
              $t(
                "If you don't claim your link it will be deleted in 3 minutes."
              )
            }}
          </p>
          <base-modal
            v-else
            :triggerText="$t('Delete Magic Link')"
            :title="$t('Are you sure you want to delete this magic link?')"
            :triggerClasses="['delete']"
          >
            <p>{{ $t("This action cannot be undone.") }}</p>
            <template #footer="{ closeModal }">
              <base-button @click="closeModal">{{ $t("Cancel") }}</base-button>
              <base-button class="delete" @click="deleteCurrentRedirect">{{
                $t("Delete forever")
              }}</base-button>
            </template>
          </base-modal>
        </card-element>
      </div>

      <div
        class="main-grid-display smaller-gap"
        v-show="openTabs.includes('7')"
      >
        <q-r-alerts
          :alerts="alerts"
          :redirectId="redirectId"
          :isLoading="isLoading || loading"
          :subscribed="subscribed"
        />
      </div>
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

.main-grid-display {
  position: relative;
}
.qr-dropdown {
  animation: none;
  transition: box-shadow 0.2s;
  z-index: 1;
}

.qr-dropdown[open]::before {
  transition: all 0.2s;
  content: "";
  pointer-events: none;
}

/* Add a before that covers the entire screen and blurs the background except the QR */
.qr-dropdown[open]::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
  pointer-events: none;
}

.qr-dropdown[open] {
  z-index: 2;
}

.qr-dropdown:hover {
  box-shadow: var(--pico-box-shadow);
  animation: bounce 0.2s;
}

/* When the hover starts, show a micro animation to show the user the element is interactable */
.qr-dropdown summary:hover::after {
  animation: bounce 0.2s;
}

@keyframes bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}
</style>
