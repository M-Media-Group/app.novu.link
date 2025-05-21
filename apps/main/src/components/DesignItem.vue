<script setup lang="ts">
import type { PropType } from "vue";
import type { QRDesign } from "@novulink/types";
import { relativeTime } from "@novulink/helpers/relativeTime";
import BaseBadge from "./BaseBadge.vue";
import QRCode from "./QRCode.vue";

const emit = defineEmits([
  /** The page the user has navigated to, either by clicking directly on a page or by using the previous and next buttons */
  "update:checked",
]);

defineProps({
  /**
   * The redirect ID
   */
  redirectId: {
    type: String,
    required: false,
  },
  /**
   * The QRDesign object
   */
  design: {
    type: Object as PropType<QRDesign>,
    required: true,
  },
  /** Whether this is a currently selected design. */
  checked: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
<template>
  <li
    :key="design.id"
    class="design-preview input"
    role="button"
    tabindex="0"
    aria-label="Design preview for {{ design.name || $t('Untitled design') }}"
    @click="emit('update:checked', !checked)"
    @keydown.enter="emit('update:checked', !checked)"
    @keydown.space.prevent="emit('update:checked', !checked)"
  >
    <figure>
      <q-r-code
        class="design-preview__qr"
        :redirect-id="redirectId"
        :design-id="design.id"
        :size="100"
        :error-correction-level="design.error_correction_level"
        :block-shape="design.block_shape"
        :corner-dot-shape="design.corner_dot_shape"
        :corner-shape="design.corner_shape"
        :round-block-size-mode="design.round_block_size_mode"
        :logo-punchout="design.logo_punchout_background"
        :background-color="design.background_color"
        :color="design.color"
        :logo-data-url="design.logo"
      />
      <figcaption class="design-preview__text">
        <hgroup>
          <h4>
            {{ design.name || $t("Untitled design") }}
            <base-badge
              v-if="design.is_scannable === false"
              aria-label="Design is not scannable"
            >
              {{ $t("Not scannable") }}
            </base-badge>
            <base-badge
              v-if="design.pivot?.is_default"
              aria-label="Default design"
            >
              {{ $t("Default") }}
            </base-badge>
          </h4>
          <p>{{ design.color }}</p>
        </hgroup>
        <small>
          {{
            $t("Updated") +
              " " +
              (design.updated_at ? relativeTime(design.updated_at, $i18n.locale) : "")
          }}
          <template v-if="design.was_automatically_generated">
            · {{ $t("Automatically generated") }}
          </template>
          <!-- <template v-else>
            ·
            <a href="#" @click.prevent="deleteEndpoint" class="delete">
              {{ $t("Delete design") }}
            </a>
          </template> -->
        </small>
      </figcaption>
    </figure>
  </li>
</template>

<style scoped>
li {
  list-style-type: none;
  text-align: unset;
  margin-bottom: calc(var(--pico-typography-spacing-vertical) * 0.25);
}

.design-preview > figure {
  display: grid;
  grid-template-columns: 1fr 3fr; /* 1 part QR, 2 parts text */
  grid-template-rows: auto; /* Adjust height to fit content */
  gap: 1rem; /* Space between QR and text */
}

figure > figcaption {
  padding: 0;
}

.design-preview__qr {
  grid-column: 1 / 2; /* QR on the left */
  width: 100px;
  height: 100px; /* Square for QR */
  object-fit: contain;
}

.design-preview__qr img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.design-preview__text {
  grid-column: 2 / 3; /* Text on the right */
  display: flex;
  flex-direction: column;
}
</style>
