<script setup lang="ts">
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { debounce } from "@/helpers/debounce";
import { formatUrl } from "@/helpers/urlFormatter";
import { deleteRedirectEndpoint, updateRedirectEndpoint } from "@/useRedirects";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  redirectId: {
    type: String,
    required: true,
  },
  endpointId: {
    type: Number,
    required: true,
  },
  currentUrl: {
    type: String,
    required: false,
  },
  /**
   * Wether to show the delete button or not
   */
  showDelete: {
    type: Boolean,
    default: true,
  },
});

const url = ref(props.currentUrl);
const loading = ref(false);

const baseFormRef = ref();

const emit = defineEmits(["success"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!url.value) {
    return;
  }

  loading.value = true;
  const response = await updateRedirectEndpoint(
    props.redirectId,
    `${props.endpointId}`,
    { endpoint: url.value }
  ).catch((error) => {
    console.error(error);
    return error.response;
  });
  loading.value = false;

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

const deleteEndpoint = async () => {
  loading.value = true;

  const response = await deleteRedirectEndpoint(
    props.redirectId,
    `${props.endpointId}`
  ).catch((error) => {
    console.error(error);
    return error.response;
  });

  if (response.status === 200) {
    emit("success");
  } else {
    alert(t("An error occurred. Please try again later."));
  }

  loading.value = false;
};
</script>

<template>
  <base-form ref="baseFormRef" @submit="submitForm" :isLoading="loading">
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
      pattern="(https?://)?([a-z0-9\-]+\.)+[a-z]{2,}(:[0-9]+)?(/.*)?(\?.*)?(#.*)?"
      @input="
        debounceAddProtocolIfMissing(($event.target as HTMLInputElement).value)
      "
    />
    <!-- </TransitionGroup> -->
    <template #after-submit v-if="showDelete">
      <!-- Delete endpoint a tag -->
      <a href="#" @click.prevent="deleteEndpoint" class="delete">
        {{ $t("Delete destination") }}
      </a>
    </template>
  </base-form>
</template>
