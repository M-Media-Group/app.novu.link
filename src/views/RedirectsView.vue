<script lang="ts" setup>
import { ref } from "vue";
import type { Redirect } from "@/types/redirect";
import CardElement from "@/components/CardElement.vue";
import { getRedirectQrCodeUrl, getRedirects } from "@/useRedirects";
import { removeProtocol } from "@/helpers/urlFormatter";
import BaseButton from "@/components/BaseButton.vue";

const redirects = ref([] as Redirect[]);
const isLoading = ref(true);

getRedirects().then((response) => {
  redirects.value = response.data;
  // Sort by total clicks
  redirects.value.sort((a, b) => b.todays_clicks_count - a.todays_clicks_count);
  isLoading.value = false;
});

const defaultEndpoint = (redirect: Redirect) => {
  const defaultEndpoint = redirect.endpoints.find(
    (endpoint) => endpoint.is_default
  )?.endpoint;
  if (!defaultEndpoint) {
    return null;
  }
  return removeProtocol(defaultEndpoint);
};
</script>
<template>
  <hgroup>
    <h1>{{ $t("Magic links") }}</h1>
    <p>All links</p>
  </hgroup>
  <div>
    <card-element
      v-for="redirect in redirects"
      :key="redirect.uuid"
      @click="$router.push(`/redirects/${redirect.uuid}`)"
      :title="redirect.name"
      :subtitle="
        redirect.todays_clicks_count +
        ' ' +
        $t('Scans today').toLocaleLowerCase() +
        ' - ' +
        // Defaults to
        defaultEndpoint(redirect) +
        (redirect.endpoints.length > 1
          ? ' + ' + (redirect.endpoints.length - 1) + ' ' + $t('more')
          : '')
      "
    >
      <template #headerActions>
        <img
          height="64"
          width="64"
          :src="getRedirectQrCodeUrl(redirect.uuid)"
          alt="QR code"
        />
      </template>
    </card-element>

    <card-element
      v-if="redirects.length === 0 && !isLoading"
      :title="$t('Create a free permanent magic link')"
    >
      <base-button to="/redirects/create">
        {{ $t("Create a free permanent magic link") }}
      </base-button>
    </card-element>
  </div>
</template>
