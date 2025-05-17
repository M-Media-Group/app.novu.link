<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { useI18n } from "vue-i18n";
import DropdownSelect from "@/components/DropdownSelect.vue";
import type { selectOption } from "@/types/listItem";
import type { Ref } from "vue";
import { debounce } from "@/helpers/debounce";
import { formatUrl } from "@/helpers/urlFormatter";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import BaseButton from "@/components/BaseButton.vue";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import { apiService } from "@/services/apiClient";
import { assertIsUnifiedError } from "@/services/apiServiceErrorHandler";

const props = defineProps({
  /** The redirect ID to add the endpoint for */
  redirectId: {
    type: String,
    required: true,
  },
});

const url = ref("");

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const { t } = useI18n();

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
  console.log("submitForm");
  if (!url.value) {
    return;
  }

  if (!url.value.startsWith("http")) {
    url.value = `https://${url.value}`;
  }
  try {
    await apiService.post(`/api/v1/redirects/${props.redirectId}/webhooks`, {
      url: url.value,
      event_types: events.value,
    });
    emit("success");
    baseFormRef.value.setSuccessOnInputs();
    $bus.$emit(eventTypes.created_webhook);
  } catch (error) {
    assertIsUnifiedError(error);
    baseFormRef.value.setInputErrors(error.details);
    return error.originalError;
  }
};

const events = ref([]);
const searchTerm = ref("");

const debounceAddProtocolIfMissing = debounce(
  (data: string) => (url.value ? (url.value = formatUrl(data)) : undefined),
  500,
  true
);
</script>

<template>
  <base-form ref="baseFormRef" :disabled="events.length === 0">
    <label for="webhook-url">{{ $t("Webhook URL") }}</label>
    <input
      type="url"
      id="url"
      name="url"
      placeholder="https://example.com/webhook"
      required
      v-model="url"
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
    <template #submit="{ disabled, isLoading, submitText }">
      <confirms-gate
        :title="$t('Enable custom designs')"
        @confirmed="submitForm"
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
