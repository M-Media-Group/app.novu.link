<script setup lang="ts">
import BaseForm from "@/forms/BaseForm.vue";
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import { useI18n } from "vue-i18n";
import { formatUrl } from "@/helpers/urlFormatter";
import { debounce } from "@/helpers/debounce";

const $bus = useEventsBus();

const name = ref("");
const defaultEndpoint = ref("");

const { t } = useI18n();

const isLoading = ref(false);

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
});

if (props.prefillName) {
  name.value = t("Untitled Magic Link");
}

const debounceAddProtocolIfMissing = debounce(
  (data: string) =>
    defaultEndpoint.value
      ? (defaultEndpoint.value = formatUrl(data))
      : undefined,
  500,
  true
);

const submitForm = async () => {
  isLoading.value = true;
  //   If the URL does not start with http, auto append https://
  if (!defaultEndpoint.value.startsWith("http")) {
    defaultEndpoint.value = `https://${defaultEndpoint.value}`;
  }

  const response = await axios
    .post("/redirects", {
      name: name.value,
      default_endpoint: defaultEndpoint.value,
    })
    .catch((error) => {
      isLoading.value = false;
      // If the error is not a validation error, show a generic error message
      if (!error.response || error.response.status !== 422)
        alert(t("An error occurred. Please try again later."));

      return error.response;
    });

  if (response.status === 201) {
    baseFormRef.value.setSuccessOnInputs();
    $bus.$emit(eventTypes.created_redirect);

    router.push(`/redirects/${response.data.uuid}`);
  } else {
    baseFormRef.value.setInputErrors(response.data.errors);
  }

  isLoading.value = false;
};
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
    @submit="submitForm"
    ref="baseFormRef"
    :isLoading="isLoading"
    :inline="inline"
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
      placeholder=" "
      data-hj-allow=""
      pattern="(https?://)?([a-z0-9\-]+\.)+[a-z]{2,}(:[0-9]+)?(/.*)?"
      required
      v-model="defaultEndpoint"
      @input="
        debounceAddProtocolIfMissing(($event.target as HTMLInputElement).value)
      "
    />
    <small v-show="!inline">
      {{ $t("This is where your magic link will redirect to by default.") }}
    </small>
    <template #after-submit>
      <small v-show="inline">
        {{ $t("This is where your magic link will redirect to by default.") }}
      </small>
    </template>
  </base-form>
</template>
