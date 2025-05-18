<script setup lang="ts">
import EditEndpoint from "@/components/modals/EditEndpoint.vue";
import CardElement from "@/components/CardElement.vue";
import { removeProtocol } from "@/helpers/urlFormatter";
import BaseButton from "@/components/BaseButton.vue";
import type { PropType } from "vue";
import type { Endpoint } from "@/types/redirect";
import { parseRuleGroup } from "@/useRules";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import { isError } from "@/helpers/httpCodes";
import { useI18n } from "vue-i18n";

const props = defineProps({
  redirectId: {
    type: String,
    required: false,
  },
  endpoints: {
    type: Array as PropType<Endpoint[] | null>,
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

const computeTotalClicksForEndpoint = (endpoint: Endpoint) => {
  //   We get clicks_by_time_of_day array from the endpoint object
  if (!endpoint.clicks_by_time_of_day) return 0;
  return endpoint.clicks_by_time_of_day.reduce(
    (acc, curr) => acc + curr.click_count,
    0
  );
};

const computeTotalClicks = (endpoints: Endpoint[]) => {
  return endpoints.reduce(
    (acc, curr) => acc + computeTotalClicksForEndpoint(curr),
    0
  );
};

const getClickPercentage = (endpoint: Endpoint) => {
  if (!props.endpoints) return 0;
  const totalClicks = computeTotalClicksForEndpoint(endpoint);
  const totalClicksForAllEndpoints = computeTotalClicks(props.endpoints);
  return totalClicksForAllEndpoints === 0
    ? 0
    : Math.round((totalClicks / totalClicksForAllEndpoints) * 100);
};

const isDefaultEndpoint = (endpoint: Endpoint) => {
  return (
    !endpoint.rule_groups ||
    endpoint.rule_groups.length === 0 ||
    !endpoint.rule_groups[0]
  );
};

const { t } = useI18n();

const formatSubtitle = (endpoint: Endpoint) => {
  const group = endpoint.rule_groups?.[0];
  if (!group) {
    return t("Default destination") + " (" + t("If no rules match") + ")";
  }
  const rules = group?.rules;
  if (!rules || rules.length === 0) {
    return t("Default destination") + " (" + t("No rules") + ")";
  }
  return group
    ? t("If") + " " + parseRuleGroup(rules)[0]
    : t("Default destination") +
        (props.endpoints && props.endpoints?.length <= 1
          ? ""
          : " (" + t("If no rules match") + ")");
};
</script>
<template>
  <template v-if="isLoading">
    <card-element :loading="isLoading">
      <hgroup>
        <h3></h3>
      </hgroup>
    </card-element>
  </template>
  <template v-else-if="!endpoints || endpoints?.length === 0">
    <card-element
      :loading="isLoading"
      :title="$t('Add multiple destinations')"
      :subtitle="
        subscribed
          ? $t('Add free destinations')
          : $t(
              'Your single QR code can take customers to multiple destinations based on rules you choose, like time of day or location.'
            )
      "
      :to="{
        name: 'add-endpoint',
        params: { redirectId: redirectId },
      }"
      :badges="subscribed ? undefined : [$t('Pro')]"
    >
    </card-element>
  </template>
  <template v-else v-for="(endpoint, index) in endpoints" :key="endpoint.id">
    <edit-endpoint
      v-if="endpoint.id && endpoint.redirect_uuid"
      :redirectId="endpoint.redirect_uuid"
      :endpointId="endpoint.id"
      :currentUrl="endpoint.endpoint"
      :showDelete="!isDefaultEndpoint(endpoint)"
    >
      <card-element
        :loading="isLoading"
        :class="{
          disabled: !subscribed && index > 0,
        }"
        :title="removeProtocol(endpoint.endpoint)"
        :subtitle="formatSubtitle(endpoint)"
        :badges="
          endpoint.last_http_code && isError(endpoint.last_http_code)
            ? [$t('Error') + ' ' + endpoint.last_http_code]
            : []
        "
      >
        <template
          v-if="endpoint.last_http_code && isError(endpoint.last_http_code)"
          #headerActions
        >
          <a
            href="https://blog.novu.link/fix-now-qr-code-destination/"
            style="margin-bottom: 0"
            target="_blank"
            @click.stop
          >
            {{ $t("Learn more") }}
          </a>
          <base-button class="contrast" style="margin-bottom: 0">
            {{ $t("Edit URL") }}
          </base-button>
        </template>
        <template
          v-else-if="computeTotalClicksForEndpoint(endpoint) > 0"
          #headerActions
        >
          <span
            :data-tooltip="$t('Percent of your customers that end up here')"
            class="no-wrap"
            >{{ getClickPercentage(endpoint) }}%</span
          >
        </template>
      </card-element>
    </edit-endpoint>

    <!-- IF we have more than 1 endpoint, and the others are locked due to unsub, show subsctibe button -->
    <confirms-gate
      v-if="
        redirectId &&
        !subscribed &&
        index === 0 &&
        endpoints &&
        endpoints.length > 1
      "
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
