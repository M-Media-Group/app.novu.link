<script setup lang="ts">
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { updateRedirect } from "@/useRedirects";
import { assertIsUnifiedError } from "@/services/apiServiceErrorHandler";

const props = defineProps({
  /** The redirect ID to add the endpoint for */
  redirectId: {
    type: String,
    required: true,
  },

  /** The redirect name */
  redirectName: {
    type: String,
    required: false,
  },

  /** If we should show the label */
  showLabel: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const name = ref(props.redirectName);

const baseFormRef = ref();

const isLoading = ref(false);

const emit = defineEmits(["updated"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!name.value || !props.redirectId) {
    return;
  }

  isLoading.value = true;

  // Create an object containing only the changed values
  const changedValues = {} as Record<string, string>;
  if (props.redirectName !== name.value) {
    changedValues.name = name.value;
  }

  // If there are no changed values, return
  if (Object.keys(changedValues).length === 0) {
    baseFormRef.value.setSuccessOnInputs();
    return;
  }

  try {
    await updateRedirect(props.redirectId, {
      name: name.value,
    });
    // Emit the updated event with the changed fields
    emit("updated", changedValues);
    baseFormRef.value.setSuccessOnInputs();
  } catch (error) {
    assertIsUnifiedError(error);
    baseFormRef.value.setInputErrors(error.details);
    return error.originalError;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @submit="submitForm"
    submitText="Save"
    :isLoading="isLoading"
  >
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <label for="name" v-show="showLabel">{{ $t("Magic link name") }}</label>
    <input
      type="text"
      name="name"
      :placeholder="$t('Magic link name')"
      v-model="name"
      minlength="2"
      pattern=".{2,}"
      autofocus
      required
    />
    <!-- </TransitionGroup> -->
  </base-form>
</template>
