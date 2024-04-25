<script setup lang="ts">
import EditEndpoint from "@/components/modals/EditEndpoint.vue";
import CardElement from "@/components/CardElement.vue";
import { removeProtocol } from "@/helpers/urlFormatter";
import BaseButton from "@/components/BaseButton.vue";
import type { PropType } from "vue";
import type { Endpoint } from "@/types/redirect";
import { parseRuleGroup } from "@/useRules";

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
  hasBillableRedirects: {
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
            hasBillableRedirects
              ? $t("Add free destinations")
              : $t("Add more destinations to same code")
          }}
        </p>
      </hgroup>
    </card-element>
  </template>
  <template v-else v-for="endpoint in endpoints" :key="endpoint.id">
    <edit-endpoint
      v-if="endpoint.id && endpoint.redirect_uuid"
      :redirectId="endpoint.redirect_uuid"
      :endpointId="endpoint.id"
      :currentUrl="endpoint.endpoint"
    >
      <card-element :loading="isLoading">
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
  </template>
  <base-button
    v-if="redirectId"
    :to="{
      name: 'add-endpoint',
      params: { redirectId: redirectId },
    }"
    :loading="isLoading"
    >{{
      hasBillableRedirects
        ? $t("Add more free destinations")
        : $t("Add more destinations to same code")
    }}</base-button
  >
</template>
