<script setup lang="ts">
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { unsubscribe } from "@/useRedirects";

const props = defineProps({
  redirectId: {
    type: String,
    required: true,
  },
});

const success = ref(false);
const isLoading = ref(false);

const baseFormRef = ref();

const emit = defineEmits(["success"]);
</script>

<template>
  <base-form
    ref="baseFormRef"
    @success="emit('success')"
    :submitFn="async () => await unsubscribe(props.redirectId)"
    :disabled="isLoading || success"
    :isLoading="isLoading"
    :submitText="$t('Unsubscribe')"
    :submitButtonClasses="['delete']"
  >
  </base-form>
</template>
