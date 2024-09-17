<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import { type PropType } from "vue";
import type { QRDesign } from "@/types/qrDesign";
import CreateQRDesign from "@/forms/CreateQRDesign.vue";
import BaseButton from "@/components/BaseButton.vue";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
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

const emit = defineEmits(["input_updated"]);

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
    <card-element :loading="isLoading" :title="$t('Your designs')">
      <ul>
        <design-item
          :redirectId="redirectId"
          :design="defaultDesign"
          @update:checked="emitInputUpdated(defaultDesign)"
        ></design-item>
        <design-item
          v-for="design in designs"
          :key="design.id"
          :design="design"
          :redirectId="redirectId"
          @update:checked="emitInputUpdated(design)"
        ></design-item>
      </ul>
    </card-element>
  </template>
  <card-element
    :loading="isLoading"
    :title="$t('Code design')"
    :subtitle="$t('Customise the look of your magic link')"
    :badges="!subscribed ? [$t('Pro')] : []"
    class="design-card"
  >
    <create-q-r-design
      :redirectId="redirectId"
      :includePages="['color', 'shape', 'advanced']"
      @input_updated="emit('input_updated', $event)"
      :showSubmitButton="subscribed"
      :class="{
        disabled: !subscribed,
      }"
    ></create-q-r-design>
    <confirms-gate
      :title="$t('Enable custom designs')"
      v-if="!subscribed"
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
            title: $t('Enable custom designs'),
            submitText: $t('Enable custom designs'),
          },
        },
      ]"
    >
      <base-button class="full-width">
        {{ $t("Enable custom designs") }}</base-button
      >
    </confirms-gate>
  </card-element>
  <template v-if="isLoading">
    <card-element :loading="isLoading">
      <hgroup>
        <h3></h3>
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
      :badges="!subscribed ? [$t('Pro')] : []"
    >
    </card-element>
  </template>
</template>
<style scoped>
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>
