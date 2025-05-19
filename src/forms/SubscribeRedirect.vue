<script lang="ts">
import i18n from "@/locales/i18n";
import { assertIsUnifiedError } from "@/services/api/apiServiceErrorHandler";
import { startSubscription } from "@/repositories/redirect/redirectRepository";
const t = i18n.global.t;
</script>
<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { useTeamStore } from "@/stores/team";

const props = defineProps({
  redirectId: {
    type: String,
    required: true,
  },
  submitText: {
    type: String,
    default: t("Subscribe"),
  },
});

const teamStore = useTeamStore();

const emit = defineEmits<{
  success: [];
}>();

const success = ref(false);

const showAddForm = ref(typeof teamStore.activeTeam?.pm_type !== "string");

const baseFormRef = ref();

const AddPaymentMethod = defineAsyncComponent(
  () => import("@/forms/AddPaymentMethod.vue")
);

const submitForm = async () => {
  if (!props.redirectId) {
    alert("No Magic Link ID provided");
    return;
  }
  try {
    await startSubscription({
      id: props.redirectId,
    });
  } catch (error) {
    assertIsUnifiedError(error);
    if (error?.message?.includes("invalid payment method")) {
      alert(
        t("There is a problem with your payment method. Please add a new one.")
      );
      showAddForm.value = true;
    }
  }
};

const handleConfirmedWithPaymentMethod = () => {
  showAddForm.value = false;
  baseFormRef.value.submit();
};

const handleSuccess = () => {
  success.value = true;
  emit("success");
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @success="handleSuccess"
    :submitFn="submitForm"
    :disabled="success"
    :showTrigger="false"
    :showFooter="false"
    :allowBackgroundClickToClose="false"
    :showSubmitButton="!showAddForm"
    :submitText="submitText"
  >
    <add-payment-method
      v-if="showAddForm"
      @success="handleConfirmedWithPaymentMethod"
      :showLabel="false"
      :submitText="submitText"
    />
    <template v-else>
      <!-- Show current payment method, and a link to turn on the form to add-payment method -->
      <p>
        {{ $t("Default payment method") }}:
        {{ teamStore.activeTeam?.pm_type?.toUpperCase() }} ****
        {{ teamStore.activeTeam?.pm_last_four }}
        -
        <a @click="showAddForm = true">{{ $t("Add a new card") }}</a>
      </p>

      <!-- Button to confirm subscription -->
    </template>

    <template #after-submit>
      <small>
        {{
          $t(
            "You’ll be billed anually at €3 / month, starting now. You can cancel anytime."
          )
        }}
      </small>
    </template>
  </base-form>
</template>
