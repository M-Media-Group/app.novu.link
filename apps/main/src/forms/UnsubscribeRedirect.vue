<script setup lang="ts">
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { unsubscribe } from "@/repositories/redirect/redirectRepository";

const props = defineProps({
  redirectId: {
    type: String,
    required: true,
  },
});

const baseFormRef = ref();

const emit = defineEmits(["success"]);
</script>

<template>
  <base-form
    ref="baseFormRef"
    @success="emit('success')"
    :submitFn="async () => await unsubscribe({ id: props.redirectId })"
    :submitText="$t('Unsubscribe')"
    :submitButtonClasses="['delete']"
  >
  </base-form>
</template>
