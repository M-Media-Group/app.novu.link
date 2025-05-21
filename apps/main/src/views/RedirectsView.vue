<script lang="ts" setup>
import { ref } from "vue";
import type { Redirect } from "@novulink/types";
import CardElement from "@/components/CardElement.vue";
import { removeProtocol } from "@novulink/helpers/urlFormatter";
import BaseButton from "@/components/BaseButton.vue";
import { useI18n } from "vue-i18n";
import QRCode from "@/components/QRCode.vue";
import { getRedirects } from "@novulink/api";

const redirects = ref([] as Redirect[]);
const isLoading = ref(true);

const { t } = useI18n();

getRedirects().then((response) => {
  redirects.value = response;
  // Sort by total clicks
  redirects.value.sort(
    (a, b) => (b.todays_clicks_count ?? 0) - (a.todays_clicks_count ?? 0)
  );
  isLoading.value = false;
});

const defaultEndpoint = (redirect: Redirect) => {
  if (redirect.endpoints?.length === 0) {
    return "";
  }
  const defaultEndpoint = redirect.endpoints?.find(
    (endpoint) => endpoint.is_default
  )?.endpoint;
  if (!defaultEndpoint) {
    // just grab the first endpoint if there is no default
    return removeProtocol(redirect.endpoints?.[0].endpoint ?? "");
  }
  return removeProtocol(defaultEndpoint);
};

const redirectBadges = (redirect: Redirect) => {
  const badges = [];
  if (redirect.remaining_clicks < 5) {
    badges.push(t("x clicks remaining", [redirect.remaining_clicks]));
  }
  if (redirect.subscribed_at) {
    badges.push(t("Smart Magic Link"));
  }
  return badges;
};
</script>
<template>
  <nav aria-label="breadcrumb">
    <ul>
      <li>
        <router-link to="/dashboard">
          {{ $t("Dashboard") }}
        </router-link>
      </li>
      <li>
        {{ $t("Magic links") }}
      </li>
    </ul>
  </nav>
  <hgroup>
    <h1>{{ $t("Magic links") }}</h1>
    <p>{{ $t("All links") }}</p>
  </hgroup>

  <template v-if="isLoading">
    <card-element
      v-for="index in 5"
      :key="index"
      :title="$t('Magic links')"
      :subtitle="$t('Magic links')"
      :loading="true"
    />
  </template>
  <card-element
    v-for="redirect in redirects"
    :key="redirect.uuid"
    :title="redirect.name"
    :subtitle="
      redirect.todays_clicks_count +
        ' ' +
        $t('Scans today').toLocaleLowerCase() +
        ' - ' +
        // Defaults to
        defaultEndpoint(redirect) +
        (redirect.endpoints && redirect.endpoints?.length > 1
          ? ' + ' + (redirect.endpoints.length - 1) + ' ' + $t('more')
          : '')
    "
    :badges="redirectBadges(redirect)"
    @click="$router.push(`/redirects/${redirect.uuid}`)"
  >
    <template #headerActions>
      <q-r-code
        class="design-preview__qr"
        :redirect-id="redirect.uuid"
        :design-id="redirect.default_qr_design?.id"
        :dimensions="64"
        :error-correction-level="
          redirect.default_qr_design?.error_correction_level
        "
        :block-shape="redirect.default_qr_design?.block_shape"
        :corner-dot-shape="redirect.default_qr_design?.corner_dot_shape"
        :corner-shape="redirect.default_qr_design?.corner_shape"
        :round-block-size-mode="redirect.default_qr_design?.round_block_size_mode"
        :logo-punchout="redirect.default_qr_design?.logo_punchout_background"
        :background-color="redirect.default_qr_design?.background_color"
        :color="redirect.default_qr_design?.color"
        :logo-data-url="redirect.default_qr_design?.logo"
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
</template>
