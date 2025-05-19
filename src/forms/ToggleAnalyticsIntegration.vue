<script setup lang="ts">
import { type PropType, useTemplateRef } from "vue";
import BaseForm from "./BaseForm.vue";
import type { AnalyticsIntegration } from "@/types/analyticsIntegrations";
import {
  createRedirectAnalyticsIntegration,
  deleteRedirectAnalyticsIntegration,
} from "@/repositories/analytics/analyticsRepository";

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

const baseFormRef = useTemplateRef("baseFormRef");

const emit = defineEmits(["success"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  const shouldDelete = !!props.integration.redirects?.find(
    (r) => r.uuid === props.redirectId
  );

  shouldDelete
    ? deleteRedirectAnalyticsIntegration({
        redirect_id: props.redirectId,
        integration_id: props.integration.id,
      })
    : createRedirectAnalyticsIntegration({
        redirect_id: props.redirectId,
        integration_id: props.integration.id,
      });
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @success="emit('success')"
    :submitFn="submitForm"
    :showSubmitButton="false"
  >
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <input
      type="checkbox"
      role="switch"
      aria-label="switch"
      @click="baseFormRef?.submit()"
      :checked="!!integration.redirects?.find((r) => r.uuid === redirectId)"
    />
    <!-- </TransitionGroup> -->
  </base-form>
</template>
