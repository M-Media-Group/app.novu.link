<script setup lang="ts">
import BaseForm from "@/forms/BaseForm.vue";
import { type PropType, ref } from "vue";
import { useRouter } from "vue-router";
import { useEventsBus } from "@/eventBus/events";
import { useI18n } from "vue-i18n";
import { useTeamStore } from "@/stores/team";
import type { Redirect } from "@novulink/types";
import { useUrlFormatter } from "@/composables/useUrlFormatter";
import { createRedirect } from "@/repositories/redirect/redirectRepository";

const $bus = useEventsBus();

const emit = defineEmits<{
  success: [Redirect["uuid"]];
}>();

const name = ref("");

const { t } = useI18n();

const baseFormRef = ref();

const router = useRouter();

const randomName = () => {
  const wordList = [
    "apple",
    "banana",
    "cherry",
    "date",
    "elderberry",
    "fig",
    "grape",
    "honeydew",
    "kiwi",
    "lemon",
    "mango",
    "nectarine",
    "orange",
    "pear",
    "quince",
    "raspberry",
    "strawberry",
    "tangerine",
    "watermelon",
  ];

  name.value = wordList[Math.floor(Math.random() * wordList.length)];
};

randomName();

const teamStore = useTeamStore();

const isAuthenticated = !!teamStore.activeTeam;

const props = defineProps({
  /** If the form should autofocus */
  autofocus: {
    type: Boolean,
    default: true,
  },
  showNameInput: {
    type: Boolean,
    default: true,
  },
  prefillName: {
    type: Boolean,
    default: true,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  /** @todo rethink, maybe should just be "label-text" or something. Currently this isn't too a11y friendly if we disable label here and add a label in the parent */
  showLabel: {
    type: Boolean,
    default: true,
  },

  // The below needs testing via unit tests

  /** An optional value to fill the defaultEndpoint with */
  defaultEndpointValue: {
    type: String,
    default: "",
    required: false,
  },
  /** If the form should auto-submit. Only works if defaultEndpointValue is also passed */
  autoSubmit: {
    type: Boolean,
    default: false,
  },

  /** Any additional classes to apply to the button */
  buttonClasses: {
    type: Array as PropType<string[] | null>,
    default: null,
  },
});

if (props.prefillName) {
  name.value = t("Untitled Magic Link");
}

const { endpointUrl, debounceAddProtocolIfMissing } = useUrlFormatter();

const submitForm = async () => {
  return await createRedirect({
    name: name.value,
    default_endpoint: endpointUrl.value ?? undefined,
  });
};

const handleSuccess = async (response: Redirect) => {
  // If the redirect was created when we were not logged in - set a 5 minute cookie
  if (!isAuthenticated) {
    document.cookie = `created_when_not_logged_in=${response.uuid}; max-age=300`;
  }
  emit("success", response.uuid);
  return router.push(`/redirects/${response.uuid}`);
};

// If we have a default endpoint value, set it and trigger the debounce
if (props.defaultEndpointValue !== "") {
  endpointUrl.value = props.defaultEndpointValue;
  debounceAddProtocolIfMissing(endpointUrl.value);
  if (props.autoSubmit) {
    baseFormRef.value.submit();
  }
}
</script>
<template>
  <label for="default_endpoint" v-show="inline && showLabel">
    {{ $t("Go to") }}
  </label>
  <base-form
    :autofocus="autofocus"
    :submitText="
      inline ? $t('New magic link') : $t('Create a free permanent magic link')
    "
    ref="baseFormRef"
    :inline="inline"
    :submitButtonClasses="buttonClasses"
    @success="handleSuccess"
    :submitFn="submitForm"
    :enableValidateFocusedElement="!inline"
  >
    <template v-if="showNameInput">
      <label for="name" v-show="!inline">{{ $t("Magic link name") }}</label
      ><input id="name" type="text" required v-model="name" />
    </template>
    <label for="default_endpoint" v-show="!inline"> {{ $t("Go to") }} </label
    ><input
      name="default_endpoint"
      type="url"
      inputmode="url"
      minlength="10"
      autocapitalize="none"
      :placeholder="`${$t('E.g.')} https://example.com`"
      data-hj-allow=""
      pattern="(https?://)?([a-z0-9\-]+\.)+[a-z]{2,}(:[0-9]+)?(/.*)?(\?.*)?(#.*)?"
      required
      v-model="endpointUrl"
      @input="
        debounceAddProtocolIfMissing(($event.target as HTMLInputElement).value)
      "
    />
    <small v-show="!inline">
      {{ $t("This is where your magic link will redirect to by default.") }}
      {{ $t("Example") }}: <code>https://example.com</code>.
    </small>
    <template #after-submit>
      <small v-show="inline">
        {{ $t("This is where your magic link will redirect to by default.") }}
        {{ $t("Example") }}: <code>https://example.com</code>.
      </small>
    </template>
  </base-form>
</template>
