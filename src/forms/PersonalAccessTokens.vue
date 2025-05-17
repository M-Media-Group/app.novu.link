<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseForm from "./BaseForm.vue";

const userStore = useUserStore();

const { t } = useI18n();

// Email, password, and remember me
const tokenName = ref("");

const baseFormRef = ref();

const emit = defineEmits(["created"]);

defineProps({
  /** If the form should autofocus */
  autofocus: {
    type: Boolean,
    default: true,
  },
});

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!tokenName.value) {
    return;
  }

  const response = await userStore.createPersonalAccessToken(tokenName.value);
  // emit("success");
  emit("created", response);

  const text = t(
    "Your personal access token has been created. This is the only time you can see it."
  );

  alert(text + "\n\n" + response.token);
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    :submitFn="submitForm"
    submitText="Create a new API token"
    :autofocus="autofocus"
    :isLoading="userStore.isLoading"
  >
    <label for="name">{{ $t("New token name") }}</label>
    <input
      type="text"
      name="name"
      :placeholder="$t('Token name')"
      required
      v-model="tokenName"
    />
  </base-form>
</template>
