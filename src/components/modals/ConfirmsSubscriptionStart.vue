<script lang="ts">
import i18n from "@/locales/i18n";
const t = i18n.global.t;
</script>

<script setup lang="ts">
import { ref } from "vue";
import BaseModal from "@/components/modals/BaseModal.vue";
import subscribedRedirect from "@/router/gates/subscribedRedirect";
import SubscribeRedirect from "@/forms/SubscribeRedirect.vue";

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
      "Additional destinations and design changes are free after you subscribe."
    ),
  },
  submitText: {
    type: String,
    default: t("Subscribe and activate destination"),
  },
});

const modal = ref();

const isConfirming = ref(false);
const isLoading = ref(false);

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

    if (gateRun !== false && gateRun !== "SubscribeRedirect") {
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
      <p v-if="description">
        {{ description }}
      </p>
      <subscribe-redirect
        v-if="modal?.isModalOpen"
        :redirectId="redirectId"
        :submitText="submitText"
        @success="handleConfirmed"
      />
    </base-modal>
  </span>
</template>
