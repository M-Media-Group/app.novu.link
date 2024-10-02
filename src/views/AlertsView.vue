<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import CardElement from "@/components/CardElement.vue";
import type { Alert } from "@/types/redirect";
import { formatMinutes } from "@/helpers/relativeTime";
import BaseButton from "@/components/BaseButton.vue";

const results = ref([] as Alert[]);
const isLoading = ref(true);

const getAlerts = async () => {
  isLoading.value = true;
  results.value =
    (await axios
      .get("/api/v1/alerts")
      .then((response) => {
        return response.data as Alert[];
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        isLoading.value = false;
      })) || [];
};

getAlerts();
</script>
<template>
  <div class="two-column-grid">
    <hgroup>
      <h1>{{ $t("Alerts") }}</h1>
    </hgroup>
    <base-button to="/alerts/create" class="full-width">{{
      $t("Create a new alert")
    }}</base-button>
  </div>
  <div>
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
  </div>
</template>
