<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import AddPaymentMethod from "@/forms/AddPaymentMethod.vue";
import TeamSettings from "@/forms/TeamSettings.vue";
import { useTeamStore } from "@/stores/team";
import { useUserStore } from "@/stores/user";
import type { PersonalAccessToken } from "@/types/user";
import { onMounted, onUnmounted, ref } from "vue";
import CreateAnalyticsIntegration from "@/forms/CreateAnalyticsIntegration.vue";
import type { AnalyticsIntegration } from "@/types/analyticsIntegrations";
import BaseButton from "@/components/BaseButton.vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import {
  deleteAnalyticsIntegration,
  getAnalyticsIntegrations,
} from "@/repositories/analytics/analyticsRepository";

const userStore = useUserStore();
const teamStore = useTeamStore();

teamStore.getUserTeams();

const addingNewPaymentMethod = ref(false);

const accessTokens = ref<PersonalAccessToken[]>([]);

userStore
  .getPersonalAccessTokens()
  .then((tokens) => (accessTokens.value = tokens || []));

const analyticsIntegrations = ref<AnalyticsIntegration[]>([]);

const getCurrentIntegration = async () => {
  analyticsIntegrations.value = await getAnalyticsIntegrations();
};

const handleDelete = async (integration: AnalyticsIntegration) => {
  await deleteAnalyticsIntegration(integration);

  getCurrentIntegration();
};

const $bus = useEventsBus();

onMounted(() => {
  getCurrentIntegration();

  $bus.$on(eventTypes.created_analytics_integration, getCurrentIntegration);
});

onUnmounted(() => {
  $bus.$off(eventTypes.created_analytics_integration, getCurrentIntegration);
});
</script>
<template>
  <h1>{{ $t("My Team") }}</h1>
  <card-element :titleHeadingLevel="2" :title="$t('Settings')">
    <team-settings></team-settings>
  </card-element>
  <card-element :titleHeadingLevel="2" :title="$t('Payment methods')">
    <div v-if="teamStore.activeTeam?.pm_type">
      <p>
        {{ $t("Default payment method") }}:
        {{ teamStore.activeTeam?.pm_type.toUpperCase() }} ****
        {{ teamStore.activeTeam?.pm_last_four }}
      </p>
    </div>
    <div v-else>
      <p>{{ $t("You do not have a default payment method set") }}</p>
    </div>
    <add-payment-method
      v-if="addingNewPaymentMethod"
      @success="
        addingNewPaymentMethod = false;
        userStore.getUser();
      "
    />
    <button
      data-cy="add-payment-button"
      v-else
      @click="addingNewPaymentMethod = true"
      type="button"
    >
      {{ $t("Add a payment method") }}
    </button>
  </card-element>
  <card-element
    :titleHeadingLevel="2"
    :title="$t('Analytics Integrations')"
    :subtitle="$t('Integrations with analytics services')"
  >
    <div class="overflow-auto">
      <table v-if="analyticsIntegrations.length">
        <thead>
          <tr>
            <th>{{ $t("Name") }}</th>
            <th>{{ $t("Service") }}</th>
            <th>{{ $t("ID") }}</th>
            <th>{{ $t("Debug") }}</th>
            <th>{{ $t("Actions") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="integration in analyticsIntegrations"
            :key="integration.id"
          >
            <td>{{ integration.name ?? "-" }}</td>
            <td>{{ integration.type }}</td>
            <td>{{ integration.external_id }}</td>

            <td>
              <input
                type="checkbox"
                role="switch"
                aria-label="switch"
                :checked="integration.debug"
              />
            </td>

            <td>
              <base-button
                class="delete"
                type="button"
                @click="handleDelete(integration)"
              >
                {{ $t("Delete") }}
              </base-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <h3 v-if="analyticsIntegrations.length">
      {{ $t("Add a new integration") }}
    </h3>
    <create-analytics-integration></create-analytics-integration>
  </card-element>
</template>
