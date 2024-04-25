<script setup lang="ts">
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { unsubscribe } from "@/useRedirects";

const props = defineProps({
  redirectId: {
    type: String,
    required: true,
  },
});

const success = ref(false);
const isLoading = ref(false);

const baseFormRef = ref();

// The submit function. If there is just the password, check if the password is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  isLoading.value = true;
  try {
    const response = await unsubscribe(props.redirectId);
    isLoading.value = false;

    if (response === true) {
      success.value = response;
    } else if (typeof response === "object") {
      return false;
    }
    return success.value;
  } catch (error) {
    console.error(error);
    isLoading.value = false;
    return false;
  }
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @submit="submitForm"
    :disabled="isLoading || success"
    :isLoading="isLoading"
    :submitText="$t('Unsubscribe')"
    :submitButtonClasses="['outline']"
  >
  </base-form>
</template>
