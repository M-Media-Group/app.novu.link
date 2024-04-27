<script setup lang="ts">
import EditEndpoint from "@/components/modals/EditEndpoint.vue";
import CardElement from "@/components/CardElement.vue";
import { removeProtocol } from "@/helpers/urlFormatter";
import BaseButton from "@/components/BaseButton.vue";
import type { PropType } from "vue";
import type { Endpoint } from "@/types/redirect";
import { parseRuleGroup } from "@/useRules";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";

defineProps({
  redirectId: {
    type: String,
    required: false,
  },
  endpoints: {
    type: Array as PropType<Endpoint[]>,
    required: false,
    default: () => [],
  },
  subscribed: {
    type: Boolean,
    required: false,
    default: false,
  },
  isLoading: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
<template>
  <template v-if="isLoading">
    <card-element :loading="isLoading">
      <hgroup>
        <h3></h3>
      </hgroup>
    </card-element>
  </template>
  <template v-else-if="endpoints.length === 0">
    <card-element :loading="isLoading">
      <hgroup>
        <h3>{{ $t("No destinations yet") }}</h3>
        <p>
          {{
            subscribed
              ? $t("Add free destinations")
              : $t("Add more destinations to same code")
          }}
        </p>
      </hgroup>
    </card-element>
  </template>
  <template v-else v-for="(endpoint, index) in endpoints" :key="endpoint.id">
    <edit-endpoint
      v-if="endpoint.id && endpoint.redirect_uuid"
      :redirectId="endpoint.redirect_uuid"
      :endpointId="endpoint.id"
      :currentUrl="endpoint.endpoint"
    >
      <card-element
        :loading="isLoading"
        :class="{
          disabled: !subscribed && index > 0,
        }"
      >
        <hgroup>
          <h3>{{ removeProtocol(endpoint.endpoint) }}</h3>
          <p v-if="endpoint.rule_groups?.[0]">
            {{ $t("If") }} {{ parseRuleGroup(endpoint.rule_groups[0])[0] }}
          </p>
          <p v-else>
            {{ $t("If no rules match") }}
          </p>
        </hgroup>
      </card-element>
    </edit-endpoint>

    <!-- IF we have more than 1 endpoint, and the others are locked due to unsub, show subsctibe button -->
    <confirms-gate
      v-if="redirectId && !subscribed && index === 0 && endpoints.length > 1"
      :title="$t('Activate other destinations')"
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
            title: $t('Activate other destinations'),
            submitText: $t('Activate other destinations'),
          },
        },
      ]"
    >
      <base-button class="full-width">{{
        $t("Activate other destinations")
      }}</base-button>
    </confirms-gate>
  </template>
  <base-button
    v-if="redirectId"
    :to="{
      name: 'add-endpoint',
      params: { redirectId: redirectId },
    }"
    :loading="isLoading"
    >{{
      subscribed
        ? $t("Add more free destinations")
        : $t("Add more destinations to same code")
    }}</base-button
  >
</template>
