<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import type { selectOptionObject } from "@/types/listItem";
import DropdownSelect from "@/components/DropdownSelect.vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import type {
  AnalyticsIntegration,
  SupportedIntegration,
} from "@/types/analyticsIntegrations";
import { apiService } from "@/services/apiClient";
import { assertIsUnifiedError } from "@/services/apiServiceErrorHandler";

const id = ref("" as AnalyticsIntegration["external_id"]);
const secret = ref("" as string);
const isOpenAnalyticsServiceDropdown = ref(false);
const debug = ref(false as AnalyticsIntegration["debug"]);
const name = ref("" as AnalyticsIntegration["name"]);
const debugCode = ref("" as string);

const baseFormRef = ref();

const emit = defineEmits(["success"]);
const $bus = useEventsBus();

const allOptions = ref([] as selectOptionObject[]);

const getOptions = async (): Promise<selectOptionObject[]> => {
  try {
    const response = await apiService.get<SupportedIntegration[]>(
      "/api/v1/analytics/integrations/supported"
    );
    return response.map((option) => ({
      id: option.name,
      render: option.pretty_name,
      raw: option,
    }));
  } catch (error) {
    assertIsUnifiedError(error);
    baseFormRef.value.setInputErrors(error.details);
    return [];
  }
};

onMounted(async () => {
  allOptions.value = await getOptions();
});

const selectedOption = ref(null as selectOptionObject["id"] | null);

// idLabel computed from first selectedOption
const idLabel = computed(() => {
  if (!selectedOption.value) {
    return "Select an integration";
  }
  return allOptions.value.find((option) => option.id === selectedOption.value)
    ?.raw?.fields?.id;
});

const secretLabel = computed(() => {
  if (!selectedOption.value) {
    return "Select an integration";
  }
  return allOptions.value.find((option) => option.id === selectedOption.value)
    ?.raw?.fields?.secret;
});

const helpLink = computed(() => {
  if (!selectedOption.value) {
    return "";
  }
  return allOptions.value.find((option) => option.id === selectedOption.value)
    ?.raw?.url;
});

const debugCodeLabel = computed(() => {
  if (!selectedOption.value) {
    return "Select an integration";
  }
  return allOptions.value.find((option) => option.id === selectedOption.value)
    ?.raw?.fields?.debug_code;
});

const debugCodeHelpLink = computed(() => {
  if (!selectedOption.value) {
    return "";
  }
  return allOptions.value.find((option) => option.id === selectedOption.value)
    ?.raw?.debug_url;
});

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!selectedOption.value || !id.value || !secret.value) {
    return;
  }

  await apiService.post("/api/v1/analytics/integrations", {
    type: selectedOption.value,
    external_id: id.value,
    external_secret: secret.value,
    debug: debug.value,
    name: name.value,
    debug_code: debug.value ? debugCode.value : null,
  });

  $bus.$emit(eventTypes.created_analytics_integration);
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @succeess="emit('success')"
    :submitFn="submitForm"
    submitText="Save"
    :disabled="!selectedOption || !id || !secret"
  >
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <label for="service-summary">{{ $t("Service") }}</label>
    <dropdown-select
      :modelValue="selectedOption ? [`${selectedOption}`] : []"
      @update:modelValue="
        selectedOption = $event[0];
        isOpenAnalyticsServiceDropdown = false;
      "
      :options="allOptions"
      v-model:isOpen="isOpenAnalyticsServiceDropdown"
      id="service"
      label="service"
      required
    ></dropdown-select>

    <small>
      {{ $t("Need help? Read the analytics service docs") }}
      <a
        v-if="helpLink"
        :href="helpLink"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ helpLink }}
      </a>
    </small>

    <template v-if="selectedOption">
      <label for="id">{{ $t(idLabel) }}</label>
      <input
        type="text"
        id="id"
        name="id"
        v-model="id"
        minlength="5"
        pattern=".{5,}"
        required
      />

      <label for="secret">{{ $t(secretLabel) }}</label>
      <input
        type="text"
        id="secret"
        name="secret"
        v-model="secret"
        minlength="5"
        pattern=".{5,}"
        required
      />

      <label
        ><input type="checkbox" id="debug" name="debug" v-model="debug" />
        {{ $t("Enable debug mode in the analytics service") }} -
        <a
          href="https://blog.novu.link/track-links-with-external-analytics-services/"
          target="_blank"
          >{{ $t("Learn more") }}</a
        ></label
      >

      <template v-if="debug && debugCodeLabel">
        <label for="debugCode">{{ $t(debugCodeLabel) }}</label>
        <input
          type="text"
          id="debugCode"
          name="debugCode"
          v-model="debugCode"
          minlength="5"
          pattern=".{5,}"
          required
        />
        <small>
          {{ $t("Need help? Read the analytics service docs") }}
          <a
            v-if="debugCodeHelpLink"
            :href="debugCodeHelpLink"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ debugCodeHelpLink }}
          </a>
        </small>
      </template>

      <label for="name">{{ $t("Name") }}</label>
      <input type="text" id="name" name="name" v-model="name" />
      <small>{{
        $t(
          "Optional name to help you identify this integration. E.g. 'My BusinessName Facebook Pixel'"
        )
      }}</small>
    </template>

    <!-- </TransitionGroup> -->
  </base-form>
</template>
