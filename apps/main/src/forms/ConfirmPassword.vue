<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";

// Password, password, and remember me
const password = ref("");

const success = ref(false);

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const userStore = useUserStore();
</script>

<template>
  <base-form
    v-if="userStore.isAuthenticated"
    ref="baseFormRef"
    :disabled="success"
    :submit-fn="
      async () => {
        await userStore.confirmPassword({ password });
      }
    "
    @success="emit('success')"
  >
    <label for="password">{{ $t("Password") }}</label>
    <input
      v-model="password"
      type="password"
      name="password"
      :placeholder="$t('Password')"
      :disabled="success"
      autofocus
      auto-complete="current-password"
      required
    >
    <small
      v-if="success"
      class="success"
    >{{
      $t("You can now log in with your new password!")
    }}</small>
  </base-form>
  <div v-else>
    {{ $t("Login or sign up to continue") }}
  </div>
</template>
