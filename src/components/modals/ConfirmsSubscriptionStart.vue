<script lang="ts">
import i18n from "@/locales/i18n";
const t = i18n.global.t;
</script>

<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import BaseModal from "@/components/modals/BaseModal.vue";
import { useTeamStore } from "@/stores/team";
import BaseButton from "@/components/BaseButton.vue";
import subscribedRedirect from "@/router/gates/subscribedRedirect";
import { startSubscription } from "@/useRedirects";

const emits = defineEmits(["confirmed", "failed"]);

const props = defineProps({
  redirectId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: t("Activate destination"),
  },
  description: {
    type: String,
    default: t(
      t(
        "Additional destinations and design changes are free after you subscribe."
      )
    ),
  },
  submitText: {
    type: String,
    default: t("Subscribe and activate destination"),
  },
});

const teamStore = useTeamStore();

const modal = ref();

const isConfirming = ref(false);
const isLoading = ref(false);

const showAddForm = ref(teamStore.activeTeam?.pm_type === null);

const confirmSubButton = ref();

const startSubscriptionForRedirect = async () => {
  if (!props.redirectId) {
    return;
  }
  isLoading.value = true;

  startSubscription(props.redirectId)
    .then(() => {
      handleConfirmed();
    })
    .catch(() => {
      handleFailed();
    });
};

const startConfirming = async () => {
  isConfirming.value = true;
  isLoading.value = true;
  try {
    const gateRun = await new subscribedRedirect()
      .setOptions({
        gateOptions: {
          redirectId: props.redirectId,
        },
      })
      .handle();

    if (gateRun !== false) {
      return handleConfirmed();
    }

    modal.value.openModal();
    isLoading.value = false;
  } catch (error) {
    handleFailed();
  }
};

const handleConfirmed = () => {
  emits("confirmed");
  modal.value.closeModal();
  showAddForm.value = false;
  isLoading.value = false;
  isConfirming.value = false;
};

const handleFailed = () => {
  emits("failed");
  isLoading.value = false;
  modal.value.closeModal();
  isConfirming.value = false;
};

const AddPaymentMethod = defineAsyncComponent(
  () => import("@/forms/AddPaymentMethod.vue")
);

const handleConfirmedWithPaymentMethod = () => {
  showAddForm.value = false;
  startSubscriptionForRedirect();
};

// expose startConfirming so we can call it from the parent component
defineExpose<{ startConfirming: () => void }>({ startConfirming });
</script>
<template>
  <span>
    <span @click.prevent="startConfirming">
      <slot :isConfirming="isConfirming" />
    </span>

    <base-modal
      ref="modal"
      :title="title"
      :showTrigger="false"
      :showFooter="false"
      @closed="isConfirming = false"
      :allowBackgroundClickToClose="false"
    >
      <p>
        {{ description }}
      </p>
      <add-payment-method
        v-if="modal?.isModalOpen && showAddForm"
        @success="handleConfirmedWithPaymentMethod"
        :showLabel="false"
        :submitText="$t('Subscribe and activate destination')"
      />
      <template v-else>
        <!-- Show current payment method, and a link to turn on the form to add-payment method -->
        <p>
          {{ $t("Default payment method") }}:
          {{ teamStore.activeTeam?.pm_type?.toUpperCase() }} ****
          {{ teamStore.activeTeam?.pm_last_four }}
        </p>
        <a @click="showAddForm = true">{{ $t("Add a new payment method") }}</a>
        <br />
        <br />
        <!-- Button to confirm subscription -->
        <base-button
          @click="startSubscriptionForRedirect"
          type="submit"
          ref="confirmSubButton"
          :disabled="isLoading"
          :aria-busy="isLoading"
        >
          {{ submitText }}
        </base-button>
        <br />
      </template>

      <small>
        {{
          $t(
            "You’ll be billed anually at €3 / month, starting now. You can cancel anytime."
          )
        }}
      </small>
    </base-modal>
  </span>
</template>
