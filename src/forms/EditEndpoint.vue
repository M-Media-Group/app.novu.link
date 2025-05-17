<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { deleteRedirectEndpoint, updateRedirectEndpoint } from "@/useRedirects";
import { assertIsUnifiedError } from "@/services/apiServiceErrorHandler";
import { useUrlFormatter } from "@/composables/useUrlFormatter";

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

const loadingDelete = ref(false);

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const { endpointUrl, debounceAddProtocolIfMissing } = useUrlFormatter();

onMounted(() => {
  if (props.currentUrl) {
    endpointUrl.value = props.currentUrl;
  }
});

const deleteEndpoint = async () => {
  loadingDelete.value = true;
  try {
    await deleteRedirectEndpoint(props.redirectId, `${props.endpointId}`);
  } catch (error) {
    assertIsUnifiedError(error);
    return error.originalError;
  } finally {
    loadingDelete.value = false;
  }
};
</script>

<template>
  <base-form
    v-if="endpointUrl"
    ref="baseFormRef"
    :isLoading="loadingDelete"
    @success="emit('success')"
    :submitFn="
      async () =>
        await updateRedirectEndpoint(props.redirectId, `${props.endpointId}`, {
          endpoint: endpointUrl as string,
        })
    "
  >
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
      v-model="endpointUrl"
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
