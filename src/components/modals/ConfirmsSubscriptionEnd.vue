<script lang="ts">
import i18n from "@/locales/i18n";
const t = i18n.global.t;
</script>

<script setup lang="ts">
import { ref } from "vue";
import BaseModal from "@/components/modals/BaseModal.vue";
import notSubscribedRedirect from "@/router/gates/subscribedRedirect";
import UnsubscribeRedirect from "@/forms/UnsubscribeRedirect.vue";
import BaseButton from "@/components/BaseButton.vue";

const emits = defineEmits(["confirmed", "failed"]);

const props = defineProps({
  redirectId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: t("Unsubscribe Magic Link"),
  },
  description: {
    type: String,
    default: t(
      "Remove advanced analytics, multiple destinations, and custom designs"
    ),
  },
  submitText: {
    type: String,
    default: t("Unsubscribe"),
  },
});

const modal = ref();

const isConfirming = ref(false);
const isLoading = ref(false);

const startConfirming = async () => {
  isConfirming.value = true;
  isLoading.value = true;
  try {
    const gateRun = await new notSubscribedRedirect()
      .setOptions({
        gateOptions: {
          redirectId: props.redirectId,
        },
      })
      .handle();

    if (gateRun && gateRun !== "UnsubscribeRedirect") {
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
  isLoading.value = false;
  isConfirming.value = false;
};

const handleFailed = () => {
  emits("failed");
  isLoading.value = false;
  modal.value.closeModal();
  isConfirming.value = false;
  console.log("Something went wrong");
};

// expose startConfirming so we can call it from the parent component
defineExpose<{ startConfirming: () => void }>({ startConfirming });
</script>
<template>
  <base-modal
    ref="modal"
    :title="title"
    @closed="isConfirming = false"
    :triggerClasses="['delete']"
    :triggerText="submitText"
  >
    <p v-if="description">
      {{ description }}
    </p>
    <template #footer="{ closeModal }">
      <base-button @click="closeModal">{{ $t("Cancel") }}</base-button>

      <unsubscribe-redirect
        v-if="modal?.isModalOpen"
        :redirectId="redirectId"
        :submitText="submitText"
        @success="handleConfirmed"
        style="
          display: inline-block;
          margin-left: calc(var(--pico-spacing) * 0.5);
        "
      />
    </template>
  </base-modal>
</template>
