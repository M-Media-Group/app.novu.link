<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { useI18n } from "vue-i18n";
import DropdownSelect from "@/components/DropdownSelect.vue";
import axios from "axios";
import type { selectOption } from "@/types/listItem";
import type { Ref } from "vue";
import { debounce } from "@/helpers/debounce";
import { formatUrl } from "@/helpers/urlFormatter";
import { eventTypes, useEventsBus } from "@/eventBus/events";

const props = defineProps({
  /** The redirect ID to add the endpoint for */
  redirectId: {
    type: String,
    required: true,
  },

  /** If we should show the submit button */
  showSubmitButton: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const url = ref("");

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const { t } = useI18n();

const getOptions = async (): Promise<selectOption[]> => {
  const response = await axios.get("/api/v1/webhooks/events");

  if (response.status === 200) {
    return response.data;
  }

  return [];
};

const options = ref([]) as Ref<selectOption[]>;

// On load, get the options
onMounted(async () => {
  options.value = await getOptions();
});

const $bus = useEventsBus();

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!url.value) {
    return;
  }

  if (!url.value.startsWith("http")) {
    url.value = `https://${url.value}`;
  }

  const response = await axios
    .post(`/api/v1/redirects/${props.redirectId}/webhooks`, {
      url: url.value,
      event_types: events.value,
    })
    .catch((error) => {
      if (!error.response || error.response.status !== 422) {
        alert(t("An error occurred. Please try again later."));
      }

      return error.response;
    });

  if (response.status === 201) {
    // Emit the updated event with the changed fields
    emit("success");
    baseFormRef.value.setSuccessOnInputs();
    $bus.$emit(eventTypes.created_webhook);
  } else if (typeof response === "object") {
    // Show the fields with errors
    baseFormRef.value.setInputErrors(response.data.errors);
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
  <base-form
    ref="baseFormRef"
    @submit="submitForm"
    :showSubmitButton="showSubmitButton"
  >
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
  </base-form>
</template>
