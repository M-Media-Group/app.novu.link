<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import type { PropType } from "vue";
import type { Alert } from "@novulink/types";
import CreateAlert from "@/forms/CreateAlert.vue";
import BaseBadge from "@/components/BaseBadge.vue";
import { formatMinutes, relativeTime } from "@/helpers/relativeTime";

defineProps({
  redirectId: {
    type: String,
    required: true,
  },
  alerts: {
    type: Array as PropType<Alert[] | null>,
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
  <template v-else>
    <card-element
      :loading="isLoading"
      :title="$t('Your alerts')"
      :subtitle="$t('Get notified when key events happen on your QR code')"
      :badges="!subscribed ? [$t('Pro')] : []"
      v-if="alerts && alerts.length > 0"
    >
      <section
        v-for="alert in alerts"
        :key="alert.id"
        aria-labelledby="alert-{{ alert.id }}"
        :class="{ disabled: !subscribed }"
      >
        <details>
          <summary>
            {{
              $t(
                "If in the last {time} {more/less} {count} {type} scans occur, trigger the alert",
                [
                  formatMinutes(alert.time_window),
                  $t(alert.condition).toLowerCase(),
                  alert.target,
                  alert.type === "all" ? $t("total") : $t(alert.type),
                ]
              )
            }}
            <base-badge
              v-if="
                alert.logs &&
                alert.logs.length > 0 &&
                alert.logs[0].status === 'pending'
              "
              >{{ $t("Triggered") }}</base-badge
            >
          </summary>
          <ul v-if="alert.logs && alert.logs.length">
            <li v-for="log in alert.logs" :key="log.id">
              {{ $t("Triggered") }} {{ relativeTime(log.triggered_at) }}:
              {{ $t(log.status) }} {{ relativeTime(log.updated_at) }}
              <base-badge v-if="log.status === 'pending'">{{
                $t("New")
              }}</base-badge>
            </li>
          </ul>
          <p v-else>{{ $t("No events occured yet") }}</p>
        </details>
      </section>
    </card-element>
  </template>

  <card-element
    :loading="isLoading"
    :title="$t('Alerts')"
    :subtitle="$t('Get notified when key events happen on your QR code')"
    :badges="!subscribed ? [$t('Pro')] : []"
  >
    <create-alert :redirectId="redirectId" />
  </card-element>
</template>
