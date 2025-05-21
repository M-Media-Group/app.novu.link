<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";

const success = ref(false);

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const userStore = useUserStore();
// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!userStore.userEmail) {
    return;
  }
  await userStore.sendPasswordResetEmail(userStore.userEmail);
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    :submit-fn="submitForm"
    :disabled="success"
    :submit-text="$t('Send a new password')"
    @success="emit('success')"
  >
    <label for="email">{{ $t("Email") }}</label>
    <input
      id="email"
      v-model="userStore.userEmail"
      type="email"
      name="email"
      :placeholder="$t('Email')"
      :disabled="success"
      autofocus
      required
    >
    <small
      v-if="success"
      class="success"
    >{{
      $t("If the account exists an email has been sent!")
    }}</small>
  </base-form>
</template>
