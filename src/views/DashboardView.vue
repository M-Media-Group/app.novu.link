<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import CardElement from "@/components/CardElement.vue";
import type { Dashboard } from "@/types/dashboard";
import BaseButton from "@/components/BaseButton.vue";
import { useI18n } from "vue-i18n";
import { eventTypes, useEventsBus } from "@/eventBus/events";

const data = ref(null as Dashboard | null);

const userStore = useUserStore();

const $bus = useEventsBus();

const { t } = useI18n();

const isLoading = ref(true);

const getData = async () => {
  const response = await axios.get("/dashboard");
  data.value = response.data;
  isLoading.value = false;
};

onMounted(() => {
  getData();
});

$bus.$on(eventTypes.changed_team, getData);

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
      completed: !userStore.user?.email.endsWith("@novu.link"),
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
      text: "Test your magic link",
      href: `/redirects/${data.value?.bestRedirect?.uuid}`,
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
      text: "Create your first Smart Magic Link",
      href: `/redirects/${data.value?.bestRedirect?.uuid}`,
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
  $bus.$emit(eventTypes.confirmed_email);
}
</script>
<template>
  <section>
    <hgroup>
      <h1>{{ $t("Dashboard") }}</h1>
      <p>{{ userStore.user?.name }}</p>
    </hgroup>
    <template v-if="accountProgress < 100">
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
    <template v-else>
      <card-element
        :to="`/redirects/${data?.bestRedirect?.uuid}`"
        :loading="isLoading"
      >
        <hgroup v-show="data?.bestRedirect?.uuid">
          <h3>{{ data?.bestRedirect?.name }}</h3>
          <p>
            {{ $t("Best magic link") }} -
            {{ data?.bestRedirect?.clicks_count }}
            {{ $t("Scans all time").toLocaleLowerCase() }}
          </p>
        </hgroup>
      </card-element>
      <base-button class="full-width" to="/redirects/" :disabled="isLoading">{{
        $t("View all magic links")
      }}</base-button>
    </template>
  </section>
  <section>
    <h2>{{ $t("Stats") }}</h2>
    <div class="two-column-grid mobile-grid">
      <card-element :loading="isLoading">
        <hgroup v-if="data?.clicks?.today !== null">
          <h3>{{ data?.clicks.today }}</h3>
          <p>{{ $t("Scans today") }}</p>
        </hgroup>
      </card-element>

      <card-element :loading="isLoading">
        <hgroup v-if="data?.clicks?.total !== null">
          <h3>{{ data?.clicks.total }}</h3>
          <p>{{ $t("Scans all time") }}</p>
        </hgroup>
      </card-element>
    </div>
    <p v-if="!isLoading && data?.hasBillableRedirects !== true">
      {{
        $t(
          "You need to create a billable redirect to access advanced analytics including the language, device, and location of your visitors."
        )
      }}
    </p>
    <base-button
      class="full-width"
      to="/analytics"
      :disabled="data?.hasBillableRedirects !== true"
      >{{ $t("Go to advanced analytics") }}</base-button
    >
  </section>
</template>
