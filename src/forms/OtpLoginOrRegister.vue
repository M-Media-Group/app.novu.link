<script lang="ts" setup>
import BaseForm from "@/forms/BaseForm.vue";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const userStore = useUserStore();
const isOnOtpPage = ref(false);

const otpCode = ref("");
const isLoading = ref(false);
const usePhone = ref(true);

/** The number of seconds to wait before the user can request a new OTP */
const secondsBetweenOtpRequests = 35;
const lastRequestTime = ref(0);

const emit = defineEmits(["success"]);

const { t } = useI18n();

const makeOtpRequest = async () => {
  if (!userStore.userEmail && !userStore.userPhone) {
    return;
  }

  const timeRemaining =
    secondsBetweenOtpRequests -
    Math.floor((Date.now() - lastRequestTime.value) / 1000);

  if (timeRemaining > 0) {
    alert(t("Please wait x seconds before trying again.", [timeRemaining]));
    return;
  }

  isLoading.value = true;

  const dataToSend = `${
    !usePhone.value ? userStore.userEmail : userStore.userPhone
  }`;

  await userStore.requestOtp(
    dataToSend,
    usePhone.value ? "phone_number" : "email"
  );

  isLoading.value = false;
  isOnOtpPage.value = true;
  lastRequestTime.value = Date.now();
};

const validateOtp = async () => {
  if (
    !otpCode.value ||
    otpCode.value.length !== 6 ||
    !(userStore.userEmail || userStore.userPhone) ||
    isNaN(Number(otpCode.value))
  ) {
    return;
  }

  isLoading.value = true;

  const response = await userStore.confirmOtp(otpCode.value);

  isLoading.value = false;

  if (response === true) {
    emit("success");
  } else {
    alert("Invalid OTP");
  }
};
</script>
<template>
  <base-form
    v-if="isOnOtpPage"
    @submit="validateOtp"
    :isLoading="isLoading"
    :disabled="isLoading"
    ><p>
      Enter the code you got in your inbox. Check spam if you don’t see it.
    </p>
    <label for="otp">OTP</label>
    <input
      type="text"
      name="otp"
      required
      v-model="otpCode"
      inputmode="numeric"
      pattern="[0-9]*"
      minlength="6"
      maxlength="6"
      @input="validateOtp"
    />

    <template #after-submit v-if="userStore.userEmail || userStore.userPhone">
      <!-- Resend code link -->
      <a href="#" @click.prevent="makeOtpRequest">{{
        $t("Resend code to", [
          !usePhone ? userStore.userEmail : userStore.userPhone,
        ])
      }}</a>
      <br />
      <!-- Go back -->
      <a href="#" @click.prevent="isOnOtpPage = false"> {{ $t("Go back") }} </a>
    </template>
  </base-form>
  <base-form
    v-else
    @submit="makeOtpRequest"
    :isLoading="isLoading"
    :disabled="isLoading"
  >
    <template v-if="!usePhone">
      <label for="email">{{ $t("Email") }}</label>
      <input
        id="email"
        type="email"
        name="email"
        required
        autofocus
        v-model="userStore.userEmail"
      />
    </template>
    <template v-else>
      <label for="phone">{{ $t("Phone number (starting with +)") }}</label>
      <input
        id="phone"
        type="tel"
        name="phone"
        inputmode="tel"
        required
        autofocus
        v-model="userStore.userPhone"
        autocomplete="tel"
        pattern="^\+[0-9]{1,15}$"
        minlength="7"
        maxlength="16"
        :placeholder="$t('+339123456789')"
      />
    </template>
    <p>
      <a v-if="!usePhone" href="#" @click.prevent="usePhone = true">{{
        $t("Use phone instead")
      }}</a>
      <a v-else href="#" @click.prevent="usePhone = false">{{
        $t("Use email instead")
      }}</a>
    </p>
  </base-form>
</template>
