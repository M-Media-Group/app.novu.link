<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import { type PropType } from "vue";
import type { QRDesign } from "@novulink/types";
import CreateQRDesign from "@/forms/CreateQRDesign.vue";
import DesignItem from "../DesignItem.vue";

defineProps({
  redirectId: {
    type: String,
    required: false,
  },
  designs: {
    type: Array as PropType<QRDesign[] | null>,
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

const emit = defineEmits<{ input_updated: [QRDesign] }>();

const emitInputUpdated = (data: QRDesign) => {
  emit("input_updated", data);
};

const defaultDesign = {
  id: 0,
  name: "Standard",
  color: "#000000",
  background_color: "#ffffff",
  logo: null,
  block_shape: "square",
  error_correction_level: "medium",
  corner_dot_shape: "square",
  corner_shape: "square",
  round_block_size_mode: "none",
  was_automatically_generated: true,
} as QRDesign;
</script>
<template>
  <template v-if="designs && designs.length > 0">
    <card-element
      :loading="isLoading"
      :title="$t('Your designs')"
    >
      <ul>
        <design-item
          :redirect-id="redirectId"
          :design="defaultDesign"
          @update:checked="emitInputUpdated(defaultDesign)"
        />
        <design-item
          v-for="design in designs"
          :key="design.id"
          :design="design"
          :redirect-id="redirectId"
          @update:checked="emitInputUpdated(design)"
        />
      </ul>
    </card-element>
  </template>
  <card-element
    :loading="isLoading"
    :title="$t('Code design')"
    :subtitle="$t('Customise the look of your magic link')"
    class="design-card"
  >
    <create-q-r-design
      :redirect-id="redirectId"
      :include-pages="['color', 'shape', 'advanced']"
      @input_updated="emit('input_updated', $event)"
    />
  </card-element>
  <template v-if="isLoading">
    <card-element :loading="isLoading">
      <hgroup>
        <h3 />
      </hgroup>
    </card-element>
  </template>
  <template v-else-if="!designs || designs?.length === 0">
    <card-element
      :loading="isLoading"
      :title="$t('Save designs for reuse across all your magic links')"
      :subtitle="
        $t(
          'Create and save designs for your magic links. You can use them across all your magic links in your team.'
        )
      "
    />
  </template>
</template>
<style scoped>
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>
