<script lang="ts">
import i18n from "@/locales/i18n";
const t = i18n.global.t;
</script>
<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { startSubscription, unsubscribe } from "@/useRedirects";
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

const showAddForm = ref(teamStore.activeTeam?.pm_type === null);

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

const AddPaymentMethod = defineAsyncComponent(
  () => import("@/forms/AddPaymentMethod.vue")
);

const startSubscriptionForRedirect = async () => {
  if (!props.redirectId) {
    return;
  }
  isLoading.value = true;

  startSubscription(props.redirectId)
    .then(() => {
      success.value = true;
      emit("success");
    })
    .catch(() => {
      console.log("Error starting subscription");
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const handleConfirmedWithPaymentMethod = () => {
  showAddForm.value = false;
  startSubscriptionForRedirect();
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @submit="submitForm"
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
      :submitText="$t('Subscribe')"
    />
    <template v-else>
      <!-- Show current payment method, and a link to turn on the form to add-payment method -->
      <p>
        {{ $t("Default payment method") }}:
        {{ teamStore.activeTeam?.pm_type?.toUpperCase() }} ****
        {{ teamStore.activeTeam?.pm_last_four }}
      </p>
      <a @click="showAddForm = true">{{ $t("Add a new payment method") }}</a>

      <!-- Button to confirm subscription -->
    </template>

    <template #submit v-if="!showAddForm">
      <br />
      <br />
      <base-button
        @click="startSubscriptionForRedirect"
        type="submit"
        ref="confirmSubButton"
        :disabled="isLoading"
        :aria-busy="isLoading"
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
