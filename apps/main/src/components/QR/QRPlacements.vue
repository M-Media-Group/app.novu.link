<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import { removeProtocol } from "@novulink/helpers/urlFormatter";
import type { PropType } from "vue";
import type { Placement } from "@novulink/types";
import { relativeTime } from "@novulink/helpers/relativeTime";

defineProps({
  redirectId: {
    type: String,
    required: false,
  },
  placements: {
    type: Array as PropType<Placement[] | null>,
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
  <template v-else-if="!placements || placements?.length === 0">
    <card-element
      :loading="isLoading"
      :title="$t('Remember where your QR codes are')"
      :subtitle="
        $t(
          'Track where you placed and shared your QR codes and magic links all in one place. As we find places where your link is shared, we\'ll show them here.'
        )
      "
    >
    </card-element>
  </template>
  <template v-else v-for="placement in placements" :key="placement.id">
    <card-element
      :loading="isLoading"
      :title="removeProtocol(placement.url)"
      :subtitle="
        $t('Last confirmed') + ' ' + relativeTime(placement.last_confirmed_at, $i18n.locale)
      "
      :badges="
        [
          placement.is_physical ? 'Physical placement' : undefined,
          !placement.can_scrape && !placement.is_physical
            ? 'Unable to confirm'
            : undefined,
        ].filter(Boolean) as string[]
      "
    >
      {{ placement.description }}
    </card-element>
  </template>
</template>
