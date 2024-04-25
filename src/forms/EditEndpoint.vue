<script setup lang="ts">
import { type PropType, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { debounce } from "@/helpers/debounce";
import { formatUrl } from "@/helpers/urlFormatter";
import { updateRedirectEndpoint } from "@/useRedirects";

const props = defineProps({
  redirectId: {
    type: String,
    required: true,
  },
  endpointId: {
    type: String as PropType<string | number>,
    required: true,
  },
  currentUrl: {
    type: String,
    required: false,
  },
});

const url = ref(props.currentUrl);

const baseFormRef = ref();

const emit = defineEmits(["success"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!url.value) {
    return;
  }

  const response = await updateRedirectEndpoint(
    props.redirectId,
    `${props.endpointId}`,
    { endpoint: url.value }
  ).catch((error) => {
    console.error(error);
    return error.response;
  });

  if (response.status === 200) {
    // Emit the updated event with the changed fields
    emit("success");
    baseFormRef.value.setSuccessOnInputs();
  } else if (typeof response === "object") {
    // Show the fields with errors
    baseFormRef.value.setInputErrors(response.data.errors);
  }
};

const debounceAddProtocolIfMissing = debounce(
  (data: string) => (url.value ? (url.value = formatUrl(data)) : undefined),
  500,
  true
);
</script>

<template>
  <base-form ref="baseFormRef" @submit="submitForm">
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <label for="url">{{ $t("Go to") }}</label>
    <input
      ref="urlInput"
      type="url"
      inputmode="url"
      minlength="3"
      autocapitalize="none"
      name="endpoint"
      placeholder="https://test.com"
      data-hj-allow=""
      v-model="url"
      required
      pattern="(https?://)?([a-z0-9\-]+\.)+[a-z]{2,}(:[0-9]+)?(/.*)?"
      @input="
        debounceAddProtocolIfMissing(($event.target as HTMLInputElement).value)
      "
    />
    <!-- </TransitionGroup> -->
  </base-form>
</template>
