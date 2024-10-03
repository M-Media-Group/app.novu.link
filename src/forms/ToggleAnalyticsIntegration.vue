<script setup lang="ts">
import { type PropType, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import axios from "axios";
import type { AnalyticsIntegration } from "@/types/analyticsIntegrations";

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

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  const shouldDelete = !!props.integration.redirects?.find(
    (r) => r.uuid === props.redirectId
  );

  const response = shouldDelete
    ? await axios.delete(
        `/api/v1/redirects/${props.redirectId}/analytics/integrations/${props.integration.id}`
      )
    : await axios.post(
        `/api/v1/redirects/${props.redirectId}/analytics/integrations`,
        {
          integration_id: props.integration.id,
        }
      );

  if (
    response.status === 200 ||
    response.status === 201 ||
    response.status === 204
  ) {
    // Emit the updated event with the changed fields
    emit("success");
    baseFormRef.value.setSuccessOnInputs();
  } else if (typeof response === "object") {
    // Show the fields with errors
    baseFormRef.value.setInputErrors(response.data.errors);
  }
};
</script>

<template>
  <base-form ref="baseFormRef" @submit="submitForm" :showSubmitButton="false">
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
