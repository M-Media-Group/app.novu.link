<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";

// Password, password, and remember me
const password = ref("");

const success = ref(false);

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const token = router.currentRoute.value.query.token as string;
const email = router.currentRoute.value.query.email as string;

const userStore = useUserStore();
</script>

<template>
  <base-form
    ref="baseFormRef"
    :disabled="success"
    @success="emit('success')"
    :submitFn="
      async () => {
        await userStore.sendPasswordReset({
          email,
          token,
          password,
          password_confirmation: password,
        });
      }
    "
  >
    <label for="password">{{ $t("New password") }}</label>
    <input
      type="password"
      name="password"
      :placeholder="$t('New password')"
      v-model="password"
      :disabled="success"
      autofocus
      autocomplete="new-password"
      required
    />
    <small v-if="success" class="success">{{
      $t("You can now log in with your new password!")
    }}</small>
  </base-form>
</template>
