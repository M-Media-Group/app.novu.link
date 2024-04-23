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

  const response = await userStore.update(name.value, email.value, phone.value);

  if (response === true) {
    // Emit the updated event with the changed fields
    emit("updated", changedValues);
    baseFormRef.value.setSuccessOnInputs();
  } else if (typeof response === "object") {
    // We want to show the user the correct fields to the user so they feel better
    baseFormRef.value.setSuccessOnInputs();

    // Show the fields with errors
    baseFormRef.value.setInputErrors(response.data.errors);
  }
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @submit="submitForm"
    :isLoading="userStore.isLoading"
    submitText="Save"
  >
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <label for="name">{{ $t("Name") }}</label>
    <input
      type="text"
      id="name"
      name="name"
      :placeholder="$t('Name')"
      v-model="name"
      minlength="2"
      pattern=".{2,}"
      autofocus
      required
    />

    <label for="phone_number">{{ $t("Phone number") }}</label>
    <input
      type="tel"
      id="phone_number"
      inputmode="tel"
      v-model="phone"
      autocomplete="tel"
      pattern="^\+[0-9]{1,15}$"
      minlength="7"
      maxlength="16"
    />

    <label for="email">{{ $t("Email") }}</label>
    <input
      type="email"
      id="email"
      name="email"
      :placeholder="$t('Email')"
      v-model="email"
      pattern="[^@]+@[^@]+\.[^@]+"
      autofocus
      required
    />

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
