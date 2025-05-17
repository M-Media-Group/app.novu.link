<script lang="ts">
import i18n from "@/locales/i18n";
const t = i18n.global.t;
</script>
<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { startSubscription } from "@/useRedirects";
import { useTeamStore } from "@/stores/team";
import BaseButton from "@/components/BaseButton.vue";

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
const isLoading = ref(false);

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

  isLoading.value = true;

  startSubscription(props.redirectId)
    .then(() => {
      success.value = true;
      emit("success");
    })
    .catch((error: null | Record<string, any>) => {
      console.log("Error starting subscription");

      // if the error message contains "invalid payment method", show the add payment method form
      if (error?.response?.data?.message?.includes("invalid payment method")) {
        alert(
          t(
            "There is a problem with your payment method. Please add a new one."
          )
        );
        showAddForm.value = true;
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const handleConfirmedWithPaymentMethod = () => {
  showAddForm.value = false;
  baseFormRef.value.submit();
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @success="emit('success')"
    :submitFn="submitForm"
    :disabled="isLoading || success"
    :isLoading="isLoading"
    :showTrigger="false"
    :showFooter="false"
    :allowBackgroundClickToClose="false"
    :showSubmitButton="false"
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

    <template #submit="{ submit }" v-if="!showAddForm">
      <base-button
        type="submit"
        ref="confirmSubButton"
        :disabled="isLoading"
        :aria-busy="isLoading"
        @click="submit()"
      >
        {{ submitText }}
      </base-button>
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
