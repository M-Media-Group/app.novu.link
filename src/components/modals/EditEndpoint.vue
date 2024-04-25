<script setup lang="ts">
import { type PropType, defineAsyncComponent, ref } from "vue";
import BaseModal from "@/components/modals/BaseModal.vue";

const emits = defineEmits(["confirmed"]);

defineProps({
  redirectId: {
    type: String,
    required: true,
  },
  endpointId: {
    type: String as PropType<string | number>,
    required: true,
  },
  currentUrl: {
    type: String,
    required: false,
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

const EditEndpoint = defineAsyncComponent(
  () => import("@/forms/EditEndpoint.vue")
);
</script>
<template>
  <span>
    <span @click.prevent="startConfirming">
      <slot :isConfirming="isConfirming" />
    </span>

    <base-modal
      ref="modal"
      :title="$t('Edit destination')"
      :showTrigger="false"
      :showFooter="false"
      @closed="isConfirming = false"
    >
      <edit-endpoint
        :redirectId="redirectId"
        :endpointId="endpointId"
        :currentUrl="currentUrl"
        v-if="modal?.isModalOpen"
        @success="handleConfirmed"
      />
    </base-modal>
  </span>
</template>
