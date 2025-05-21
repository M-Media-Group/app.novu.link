<script setup lang="ts">
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { unsubscribe } from "@novulink/api";

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
    :submit-fn="async () => await unsubscribe({ id: props.redirectId })"
    :submit-text="$t('Unsubscribe')"
    :submit-button-classes="['delete']"
    @success="emit('success')"
  />
</template>
