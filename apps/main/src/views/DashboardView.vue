<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import { computed, onMounted, onUnmounted, ref } from "vue";
import CardElement from "@/components/CardElement.vue";
import type { Dashboard } from "@novulink/types";
import BaseButton from "@/components/BaseButton.vue";
import { useI18n } from "vue-i18n";
import { useEventsBus } from "@/eventBus/events";
import LineChart from "@/components/charts/LineChart.vue";
import { getDashboard } from "../../../../packages/api/src/repositories/misc/miscRepository";

const data = ref<Dashboard | null>(null);

const userStore = useUserStore();

const $bus = useEventsBus();

const { t } = useI18n();

const isLoading = ref(true);

const getData = async () => {
  data.value = await getDashboard();
  isLoading.value = false;
};

onMounted(async () => {
  getData();
  $bus.$on("changed_team", getData);
});

onUnmounted(() => {
  $bus.$off("changed_team", getData);
});

const itemData = computed(() => ({
  items: [
    {
      text: t("Create your account and team"),
      href: "",
      target: "",
      completed: true,
    },
    {
      text: t("Add your email address"),
      href: "/settings",
      target: "",
      // If the email ends with @novu.link, we consider it incomplete
      completed: !userStore.user?.email?.endsWith("@novu.link"),
    },
    {
      text: t("Confirm your email"),
      href: "/confirm-email",
      target: "",
      completed: userStore.user?.email_verified_at !== null,
    },
    {
      text: t("Create a free permanent magic link"),
      href: "/redirects/create",
      target: "",
      completed: data.value?.bestRedirect?.uuid,
    },
    {
      text: t("Test your magic link"),
      href: !data.value?.bestRedirect?.uuid
        ? "/redirects/create"
        : `/redirects/${data.value?.bestRedirect?.uuid}`,
      target: "",
      completed: data.value?.clicks?.total
        ? data.value?.clicks?.total > 0
        : false,
    },
    {
      text: t("Add a payment method"),
      href: "/team/settings",
      target: "",
      completed: data.value?.hasPaymentMethodSet,
    },
    {
      text: t("Create your first Smart Magic Link"),
      href: !data.value?.bestRedirect?.uuid
        ? "/redirects/create"
        : `/redirects/${data.value?.bestRedirect?.uuid}`,
      target: "",
      completed: data.value?.hasBillableRedirects,
    },
  ],
}));

const accountProgress = computed(() => {
  const completed = itemData.value.items.filter(
    (item) => item.completed
  ).length;
  return Math.round((completed / itemData.value.items.length) * 100);
});

const nextItemToComplete = computed(() => {
  return itemData.value.items.find((item) => !item.completed);
});

// If the URL has the ?verified=1 query parameter, show a success message
if (window.location.search.includes("verified=1")) {
  $bus.$emit("confirmed_email");
}

const barChartData = computed(() => {
  if (!data.value?.hasBillableRedirects) {
    return null;
  }
  const mappedData = data.value?.clicksByMinuteLast30?.map((item) => ({
    name: item.datetime,
    count: item.click_count,
  }));

  // Sum for each datetime, discard the redirect_uuid
  const groupedData = mappedData?.reduce((acc, item) => {
    if (!item || !item.name || !item.count) {
      return acc;
    }
    // Her we just have "mm" value. If for example the current time is 13:45, and the datetime is 40, then the click was 5 minutes ago.
    const date = new Date();
    // Get how many minutes ago the click was
    const minutesAgo = date.getMinutes() - parseInt(item.name);
    // The minutesAgo will be out key
    acc[minutesAgo] = (acc[minutesAgo] || 0) + item.count;
    return acc;
  }, {} as Record<string, number>);

  // Fill in the missing minutes
  const minutes = Array.from({ length: 30 }, (_, i) => i.toString());
  const filledData = minutes.map((minute) => {
    const found = groupedData && groupedData[minute];
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
</script>
<template>
  <hgroup>
    <h1>{{ $t("Dashboard") }}</h1>
    <p>{{ userStore.user?.name ?? "-" }}</p>
  </hgroup>

  <template v-if="accountProgress < 100 && !isLoading">
    <card-element :loading="isLoading">
      <h2>{{ $t("Account progress") }}</h2>
      <div>{{ $t("percent complete", [accountProgress]) }}</div>
      <progress :value="accountProgress" max="100"></progress>
      <ol>
        <li :key="index" v-for="(item, index) in itemData.items">
          <component
            :is="item.completed ? 's' : 'router-link'"
            :to="item.href"
            :target="item.target"
          >
            {{ $t(item.text) }}
          </component>
        </li>
      </ol>
    </card-element>
    <base-button
      class="full-width"
      :disabled="isLoading"
      :to="nextItemToComplete?.href"
      >{{ $t(nextItemToComplete?.text ?? "Loading...") }}</base-button
    ></template
  >

  <div class="two-column-grid">
    <div class="two-column-grid mobile-grid">
      <card-element
        :loading="isLoading"
        :badges="data?.hasBillableRedirects !== true ? [$t('Pro')] : []"
        :title="
          data?.hasBillableRedirects
            ? data?.clicks?.today?.toString() ?? '-'
            : '-'
        "
        :subtitle="$t('Scans today')"
      />

      <card-element
        :loading="isLoading"
        :badges="data?.hasBillableRedirects !== true ? [$t('Pro')] : []"
        :title="
          data?.hasBillableRedirects
            ? data?.clicks?.total?.toString() ?? '-'
            : '-'
        "
        :subtitle="$t('Scans all time')"
      />
    </div>
    <card-element
      :to="`/redirects/${data?.bestRedirect?.uuid}`"
      :loading="isLoading"
      :subtitle="
        $t('Best magic link') +
        ' - ' +
        (data?.bestRedirect?.clicks_count ?? '') +
        ' ' +
        $t('Scans all time').toLocaleLowerCase()
      "
      :title="data?.bestRedirect?.name ?? '-'"
    />
  </div>

  <div class="two-column-grid three-two-grid">
    <card-element
      :loadingOn="['title']"
      :badges="data?.hasBillableRedirects !== true ? [$t('Pro')] : []"
      :title="
        barChartData !== null && data?.hasBillableRedirects
          ? `${barChartData.reduce((sum, item) => sum + item.count, 0)}`
          : '--'
      "
      :subtitle="$t('Scans in the last x minutes', [30])"
    >
      <div
        v-if="isLoading"
        class="placeholder-chart gl-animate-skeleton-loader"
        style="height: 240px"
      ></div>
      <div
        v-else-if="!data?.hasBillableRedirects"
        class="placeholder-chart"
        style="height: 240px"
      >
        <p>
          {{
            $t(
              "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
            )
          }}
        </p>
      </div>
      <line-chart
        v-else-if="barChartData && barChartData.length > 0"
        :clickData="barChartData"
        height="240px"
      />
      <div v-else class="placeholder-chart" style="height: 240px">
        {{ $t("No data available") }}
      </div>
    </card-element>

    <card-element
      title="--"
      :badges="[$t('Beta')]"
      :subtitle="$t('Active Countries', [30])"
    >
      <div class="placeholder-chart" style="height: 240px">
        <p>
          {{
            $t(
              "We are rolling currently testing this feature with a select group of users."
            )
          }}
        </p>
      </div>
    </card-element>
  </div>

  <base-button
    class="full-width"
    to="/analytics"
    :disabled="data?.hasBillableRedirects !== true"
    >{{ $t("Go to advanced analytics") }}</base-button
  >
</template>
