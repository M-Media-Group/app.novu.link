<script setup lang="ts">
import { type PropType, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import type { AnalyticsIntegration } from "@/types/analyticsIntegrations";
import { apiService } from "@/services/apiClient";
import { assertIsUnifiedError } from "@/services/apiServiceErrorHandler";

const props = defineProps({
  redirectId: {
    type: String,
    required: true,
  },
  integration: {
    type: Object as PropType<AnalyticsIntegration>,
    required: true,
    validator: (value: AnalyticsIntegration) => !!value.redirects,
  },
});

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const isLoading = ref(false);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  isLoading.value = true;

  const shouldDelete = !!props.integration.redirects?.find(
    (r) => r.uuid === props.redirectId
  );

  try {
    shouldDelete
      ? await apiService.delete(
          `/api/v1/redirects/${props.redirectId}/analytics/integrations/${props.integration.id}`
        )
      : await apiService.post(
          `/api/v1/redirects/${props.redirectId}/analytics/integrations`,
          {
            integration_id: props.integration.id,
          }
        );
    emit("success");
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
    :showSubmitButton="false"
    :isLoading="isLoading"
  >
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <input
      type="checkbox"
      role="switch"
      aria-label="switch"
      @click="submitForm"
      :checked="!!integration.redirects?.find((r) => r.uuid === redirectId)"
    />
    <!-- </TransitionGroup> -->
  </base-form>
</template>
