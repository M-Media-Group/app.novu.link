<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";
import BaseForm from "./BaseForm.vue";
import DropdownSelect from "@/components/DropdownSelect.vue";
import type { SelectOption } from "@novulink/types";
import BaseButton from "@/components/BaseButton.vue";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import { useUrlFormatter } from "@novulink/vue-composables/useUrlFormatter";
import {
  createWebhook,
  getSupportedWebhookEvents,
} from "@novulink/api";

const props = defineProps({
  /** The redirect ID to add the endpoint for */
  redirectId: {
    type: String,
    required: true,
  },
});

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const options = ref<SelectOption[]>([]);

// On load, get the options
onMounted(async () => {
  options.value = await getSupportedWebhookEvents();
});

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  return await createWebhook({
    url: endpointUrl.value ?? undefined,
    event_types: events.value,
    redirect_uuid: props.redirectId,
  });
};

const events = ref([]);
const searchTerm = ref("");

const { endpointUrl, debounceAddProtocolIfMissing } = useUrlFormatter();

const subscriptionStartRef = useTemplateRef("subscriptionStartRef");

const startConfirming = async () => {
  subscriptionStartRef.value?.startConfirming();
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    :disabled="events.length === 0"
    :submit-fn="submitForm"
    @success="emit('success')"
    @submit="startConfirming"
  >
    <label for="webhook-url">{{ $t("Webhook URL") }}</label>
    <input
      id="url"
      v-model="endpointUrl"
      type="url"
      name="url"
      placeholder="https://example.com/webhook"
      required
      @input="
        debounceAddProtocolIfMissing(($event.target as HTMLInputElement).value)
      "
    >
    <label for="events">{{ $t("Events") }}</label>
    <dropdown-select
      v-model="events"
      v-model:search="searchTerm"
      :multiple="true"
      :select-all="true"
      :searchable="true"
      class="full-width"
      :options="options"
      :required="true"
      name="event_types"
    />
    <template #submit="{ disabled, isLoading, submitText, submit }">
      <confirms-gate
        ref="subscriptionStartRef"
        :title="$t('Enable custom designs')"
        :description="
          $t(
            'Additional destinations and design changes are free after you subscribe.'
          )
        "
        :allow-background-click-to-close="false"
        :gate="[
          'confirmedEmailOrPhone',
          {
            name: 'subscribedRedirect',
            options: {
              redirectId,
              title: $t('Enable integrations'),
              submitText: $t('Enable integrations'),
            },
          },
        ]"
        @confirmed="submit()"
      >
        <base-button
          class="full-width"
          :disabled="disabled"
          :aria-busy="isLoading"
          type="submit"
        >
          {{ $t(submitText) }}
        </base-button>
      </confirms-gate>
    </template>
  </base-form>
</template>
