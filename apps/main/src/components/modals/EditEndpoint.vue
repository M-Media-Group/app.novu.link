<script setup lang="ts">
import { ref } from "vue";
import BaseModal from "@/components/modals/BaseModal.vue";
import EditEndpoint from "@/forms/EditEndpoint.vue";

const emits = defineEmits(["confirmed"]);

defineProps({
  redirectId: {
    type: String,
    required: true,
  },
  endpointId: {
    type: Number,
    required: true,
  },
  currentUrl: {
    type: String,
    required: false,
  },
  showDelete: {
    type: Boolean,
    default: true,
  },
});

const modal = ref();

const isConfirming = ref(false);

const startConfirming = async () => {
  isConfirming.value = true;
  modal.value.openModal();
};

const handleConfirmed = () => {
  emits("confirmed");
  modal.value.closeModal();
};
</script>
<template>
  <span>
    <span @click.prevent="startConfirming">
      <slot :is-confirming="isConfirming" />
    </span>

    <base-modal
      ref="modal"
      :title="$t('Edit destination')"
      :show-trigger="false"
      :show-footer="false"
      @closed="isConfirming = false"
    >
      <edit-endpoint
        :redirect-id="redirectId"
        :endpoint-id="endpointId"
        :current-url="currentUrl"
        :show-delete="showDelete"
        @success="handleConfirmed"
      />
    </base-modal>
  </span>
</template>
