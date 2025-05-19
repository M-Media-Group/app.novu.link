<script setup lang="ts">
import { onMounted, ref } from "vue";
import CardElement from "@/components/CardElement.vue";
import type { Alert } from "@novulink/types";
import { formatMinutes } from "@/helpers/relativeTime";
import BaseButton from "@/components/BaseButton.vue";
import { getAlerts } from "@/repositories/alert/alertRepository";

const isLoading = ref(true);

const results = ref<Alert[]>([]);

onMounted(async () => {
  results.value = await getAlerts();
  isLoading.value = false;
});
</script>
<template>
  <div class="two-column-grid">
    <div>
      <nav aria-label="breadcrumb">
        <ul>
          <li>
            <router-link to="/dashboard">{{ $t("Dashboard") }}</router-link>
          </li>
          <li>
            {{ $t("Alerts") }}
          </li>
        </ul>
      </nav>
      <hgroup>
        <h1>{{ $t("Alerts") }}</h1>
      </hgroup>
    </div>
    <base-button to="/alerts/create" class="full-width">{{
      $t("Create a new alert")
    }}</base-button>
  </div>

  <template v-if="isLoading">
    <card-element
      v-for="index in 5"
      :title="$t('Alerts links')"
      :subtitle="$t('Alerts links')"
      :loading="true"
      :key="index"
    />
  </template>
  <template v-else>
    <card-element
      v-for="alert in results"
      :title="alert.redirect?.name"
      :subtitle="
        $t(
          'If in the last {time} {more/less} {count} {type} scans occur, trigger the alert',
          [
            formatMinutes(alert.time_window),
            $t(alert.condition).toLowerCase(),
            alert.target,
            alert.type === 'all' ? $t('total') : $t(alert.type),
          ]
        )
      "
      :to="`/redirects/${alert.redirect_uuid}`"
      :key="alert.id"
      :class="{ disabled: !alert.redirect?.subscribed_at }"
    >
    </card-element>
  </template>
</template>
