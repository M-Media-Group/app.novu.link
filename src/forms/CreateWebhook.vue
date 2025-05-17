<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";
import BaseForm from "./BaseForm.vue";
import DropdownSelect from "@/components/DropdownSelect.vue";
import type { selectOption } from "@/types/listItem";
import type { Ref } from "vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import BaseButton from "@/components/BaseButton.vue";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import { apiService } from "@/services/apiClient";
import { useUrlFormatter } from "@/composables/useUrlFormatter";

const props = defineProps({
  /** The redirect ID to add the endpoint for */
  redirectId: {
    type: String,
    required: true,
  },
});

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const getOptions = async (): Promise<selectOption[]> => {
  try {
    return await apiService.get<selectOption[]>("/api/v1/webhooks/events");
  } catch (error) {
    console.error(error);
    return [];
  }
};

const options = ref([]) as Ref<selectOption[]>;

// On load, get the options
onMounted(async () => {
  options.value = await getOptions();
});

const $bus = useEventsBus();

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!endpointUrl.value) {
    return;
  }

  const response = await apiService.post(
    `/api/v1/redirects/${props.redirectId}/webhooks`,
    {
      url: endpointUrl.value,
      event_types: events.value,
    }
  );
  $bus.$emit(eventTypes.created_webhook);
  return response;
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
    @success="emit('success')"
    @submit="startConfirming"
    :submitFn="submitForm"
  >
    <label for="webhook-url">{{ $t("Webhook URL") }}</label>
    <input
      type="url"
      id="url"
      name="url"
      placeholder="https://example.com/webhook"
      required
      v-model="endpointUrl"
      @input="
        debounceAddProtocolIfMissing(($event.target as HTMLInputElement).value)
      "
    />
    <label for="events">{{ $t("Events") }}</label>
    <dropdown-select
      :multiple="true"
      :selectAll="true"
      :searchable="true"
      class="full-width"
      v-model="events"
      v-model:search="searchTerm"
      :options="options"
      :required="true"
      name="event_types"
    >
    </dropdown-select>
    <template #submit="{ disabled, isLoading, submitText, submit }">
      <confirms-gate
        ref="subscriptionStartRef"
        :title="$t('Enable custom designs')"
        @confirmed="submit()"
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
              title: $t('Enable integrations'),
              submitText: $t('Enable integrations'),
            },
          },
        ]"
      >
        <base-button
          class="full-width"
          :disabled="disabled"
          :aria-busy="isLoading"
          type="submit"
        >
          {{ $t(submitText) }}</base-button
        >
      </confirms-gate>
    </template>
  </base-form>
</template>
