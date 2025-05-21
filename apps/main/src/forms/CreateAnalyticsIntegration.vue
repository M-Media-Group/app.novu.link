<script setup lang="ts" generic="T extends PossibleRecord">
import { computed, onMounted, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import type { PossibleRecord, SelectOptionObject } from "@novulink/types";
import DropdownSelect from "@/components/DropdownSelect.vue";
import type { AnalyticsIntegration } from "@novulink/types";
import { assertIsUnifiedError } from "@novulink/api";
import {
  createAnalyticsIntegration,
  getSupportedAnalyticsIntegrations,
} from "@novulink/api";

const id = ref("" as AnalyticsIntegration["external_id"]);
const secret = ref("" as string);
const isOpenAnalyticsServiceDropdown = ref(false);
const debug = ref(false as AnalyticsIntegration["debug"]);
const name = ref("" as AnalyticsIntegration["name"]);
const debugCode = ref("" as string);

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const allOptions = ref<Awaited<ReturnType<typeof getOptions>> | null>(null);

const getOptions = async () => {
  try {
    const response = await getSupportedAnalyticsIntegrations();

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

const selectedOption = ref<SelectOptionObject["id"] | null>(null);

// idLabel computed from first selectedOption
const idLabel = computed(() => {
  if (!selectedOption.value) {
    return "Select an integration";
  }
  return allOptions.value?.find((option) => option.id === selectedOption.value)
    ?.raw?.fields?.id;
});

const secretLabel = computed(() => {
  if (!selectedOption.value) {
    return "Select an integration";
  }
  return allOptions.value?.find((option) => option.id === selectedOption.value)
    ?.raw?.fields?.secret;
});

const helpLink = computed(() => {
  if (!selectedOption.value) {
    return "";
  }
  return allOptions.value?.find((option) => option.id === selectedOption.value)
    ?.raw?.url;
});

const debugCodeLabel = computed(() => {
  if (!selectedOption.value) {
    return "Select an integration";
  }
  return allOptions.value?.find((option) => option.id === selectedOption.value)
    ?.raw?.fields?.debug_code;
});

const debugCodeHelpLink = computed(() => {
  if (!selectedOption.value) {
    return "";
  }
  return allOptions.value?.find((option) => option.id === selectedOption.value)
    ?.raw?.debug_url;
});

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  await createAnalyticsIntegration({
    type: selectedOption.value ?? undefined,
    external_id: id.value,
    external_secret: secret.value,
    debug: debug.value,
    name: name.value ?? undefined,
    debug_code: debug.value ? debugCode.value : null,
  });
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    :submit-fn="submitForm"
    submit-text="Save"
    :disabled="!selectedOption || !id || !secret"
    @succeess="emit('success')"
  >
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <label for="service-summary">{{ $t("Service") }}</label>
    <dropdown-select
      v-if="allOptions && allOptions?.length > 0"
      id="service"
      v-model:is-open="isOpenAnalyticsServiceDropdown"
      :model-value="selectedOption ? [`${selectedOption}`] : []"
      :options="allOptions"
      label="service"
      required
      @update:model-value="
        selectedOption = $event[0];
        isOpenAnalyticsServiceDropdown = false;
      "
    />

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
      <label
        v-if="idLabel"
        for="id"
      >{{ $t(idLabel) }}</label>
      <input
        id="id"
        v-model="id"
        type="text"
        name="id"
        minlength="5"
        pattern=".{5,}"
        required
      >

      <label
        v-if="secretLabel"
        for="secret"
      >{{ $t(secretLabel) }}</label>
      <input
        id="secret"
        v-model="secret"
        type="text"
        name="secret"
        minlength="5"
        pattern=".{5,}"
        required
      >

      <label><input
               id="debug"
               v-model="debug"
               type="checkbox"
               name="debug"
             >
        {{ $t("Enable debug mode in the analytics service") }} -
        <a
          href="https://blog.novu.link/track-links-with-external-analytics-services/"
          target="_blank"
        >{{ $t("Learn more") }}</a></label>

      <template v-if="debug && debugCodeLabel">
        <label for="debugCode">{{ $t(debugCodeLabel) }}</label>
        <input
          id="debugCode"
          v-model="debugCode"
          type="text"
          name="debugCode"
          minlength="5"
          pattern=".{5,}"
          required
        >
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
      <input
        id="name"
        v-model="name"
        type="text"
        name="name"
      >
      <small>{{
        $t(
          "Optional name to help you identify this integration. E.g. 'My BusinessName Facebook Pixel'"
        )
      }}</small>
    </template>

    <!-- </TransitionGroup> -->
  </base-form>
</template>
