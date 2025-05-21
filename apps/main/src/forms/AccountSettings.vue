<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";

const userStore = useUserStore();

// Email, password, and remember me
const email = ref(userStore.user?.email);
const phone = ref(userStore.user?.phone_number);

// Name, Surname
const name = ref(userStore.user?.name);

const baseFormRef = ref();

const emit = defineEmits(["updated"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!email.value || !name.value) {
    return;
  }

  // Create an object containing only the changed values
  const changedValues = {} as Record<string, string>;
  if (userStore.user?.name !== name.value) {
    changedValues.name = name.value;
  }
  if (userStore.user?.email !== email.value) {
    changedValues.email = email.value;
  }
  if (phone.value && userStore.user?.phone_number !== phone.value) {
    changedValues.phone = phone.value;
  }

  // If there are no changed values, return
  if (Object.keys(changedValues).length === 0) {
    baseFormRef.value.setSuccessOnInputs();
    return;
  }

  await userStore.update(name.value, email.value, phone.value ?? undefined);

  emit("updated", changedValues);
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    :is-loading="userStore.isLoading"
    submit-text="Save"
    :submit-fn="submitForm"
  >
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <label for="name">{{ $t("Name") }}</label>
    <input
      id="name"
      v-model="name"
      type="text"
      name="name"
      :placeholder="$t('Name')"
      minlength="2"
      pattern="\p{Alpha}{2,}"
      autofocus
      required
    >

    <label for="phone_number">{{ $t("Phone number (starting with +)") }}</label>
    <input
      id="phone_number"
      v-model="phone"
      type="tel"
      inputmode="tel"
      autocomplete="tel"
      pattern="^\+[0-9]{1,15}$"
      minlength="7"
      maxlength="16"
      :placeholder="$t('+339123456789')"
    >

    <label for="email">{{ $t("Email") }}</label>
    <input
      id="email"
      v-model="email"
      type="email"
      name="email"
      :placeholder="$t('Email')"
      pattern="[^@]+@[^@]+\.[^@]+"
      autofocus
      required
    >

    <small v-if="!userStore.user?.email_verified_at">
      {{ $t("Your email address is not verified.") }}
      <router-link to="/confirm-email">
        {{ $t("Confirm your email") }}
      </router-link>
    </small>
    <small v-else>{{
      $t("If you change your email address you will have to confirm it again.")
    }}</small>
    <!-- </TransitionGroup> -->
  </base-form>
</template>
