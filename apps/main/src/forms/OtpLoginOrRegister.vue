<script lang="ts" setup>
import BaseForm from "@/forms/BaseForm.vue";
import { useUserStore } from "@/stores/user";
import { nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";

const userStore = useUserStore();
const isOnOtpPage = ref(false);

const otpCode = ref("");
const usePhone = ref(false);

/** The number of seconds to wait before the user can request a new OTP */
const secondsBetweenOtpRequests = 35;
const lastRequestTime = ref(0);

const emit = defineEmits<{
  success: [];
}>();

defineProps({
  /** If the form should be displayed in a single line */
  inline: {
    type: Boolean,
    default: false,
  },
  autofocus: {
    type: Boolean,
    default: true,
  },
  submitText: {
    type: String,
    default: "Submit",
  },
});

const { t } = useI18n();

const baseFormRef = ref();

const makeOtpRequest = async () => {
  const timeRemaining =
    secondsBetweenOtpRequests -
    Math.floor((Date.now() - lastRequestTime.value) / 1000);

  if (timeRemaining > 0) {
    alert(t("Please wait x seconds before trying again.", [timeRemaining]));
    throw new Error("Please wait before trying again");
  }

  const dataToSend = `${
    !usePhone.value ? userStore.userEmail : userStore.userPhone
  }`;

  try {
    await userStore.requestOtp(
      usePhone.value ? { phone_number: dataToSend } : { email: dataToSend }
    );
    isOnOtpPage.value = true;
    lastRequestTime.value = Date.now();
  } catch (error) {
    // Reset the timer so the user can try again
    lastRequestTime.value = 0;
    throw error;
  }
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

  await userStore.confirmOtp(otpCode.value);
};

const phoneInput = ref<HTMLInputElement | null>(null);

const toggleUsePhone = async () => {
  usePhone.value = !usePhone.value;
  await nextTick();
  isOnOtpPage.value = false;
  otpCode.value = "";
  // Focus the input
  phoneInput.value?.focus();
};
</script>
<template>
  <label
    v-if="inline && !isOnOtpPage"
    :for="usePhone ? 'phone' : 'email'"
  >
    {{ usePhone ? $t("Phone number (starting with +)") : $t("Email") }}
  </label>
  <label v-else-if="inline">
    {{ $t("One-time password") }}
  </label>
  <base-form
    v-if="isOnOtpPage"
    ref="baseFormRef"
    :submit-fn="validateOtp"
    :inline="inline"
    @success="emit('success')"
  >
    <p v-show="!inline">
      {{ $t("Enter the code you received.") }}
      {{
        !usePhone
          ? $t("Check your email inbox or spam.")
          : $t("Check your phone.")
      }}
    </p>
    <label
      v-show="!inline"
      for="otp"
    >OTP</label>
    <input
      v-model="otpCode"
      type="text"
      name="otp"
      required
      inputmode="numeric"
      pattern="[0-9]*"
      minlength="6"
      maxlength="6"
      :placeholder="$t('One-time password')"
      :autofocus="autofocus"
      @input="baseFormRef?.submit()"
    >

    <template
      v-if="userStore.userEmail || userStore.userPhone"
      #after-submit
    >
      <!-- Resend code link -->
      <a
        href="#"
        @click.prevent="makeOtpRequest"
      >{{
        $t("Resend code to", [
          !usePhone ? userStore.userEmail : userStore.userPhone,
        ])
      }}</a>
      <br>
      <!-- Go back -->
      <a
        href="#"
        @click.prevent="isOnOtpPage = false"
      > {{ $t("Go back") }} </a>
    </template>
  </base-form>
  <base-form
    v-else
    ref="baseFormRef"
    :submit-fn="makeOtpRequest"
    :inline="inline"
    :autofocus="autofocus"
    :submit-text="submitText"
  >
    <template v-if="!usePhone">
      <label
        v-show="!inline"
        for="email"
      >{{ $t("Email") }}</label>
      <input
        id="email"
        ref="phoneInput"
        v-model="userStore.userEmail"
        type="email"
        name="email"
        required
        :autofocus="autofocus"
        autocomplete="email"
        :placeholder="$t('Email')"
        data-hj-allow
      >
    </template>
    <template v-else>
      <label
        v-show="!inline"
        for="phone"
      >{{
        $t("Phone number (starting with +)")
      }}</label>
      <input
        id="phone"
        ref="phoneInput"
        v-model="userStore.userPhone"
        type="tel"
        name="phone_number"
        inputmode="tel"
        required
        :autofocus="autofocus"
        autocomplete="tel"
        pattern="^\+[0-9]{1,15}$"
        minlength="7"
        maxlength="16"
        :placeholder="$t('Phone number')"
        data-hj-allow
      >
    </template>
    <template #after-submit>
      <a
        v-if="!usePhone"
        href="#"
        @click.prevent="toggleUsePhone"
      >{{
        $t("Use phone instead")
      }}</a>
      <a
        v-else
        href="#"
        @click.prevent="toggleUsePhone"
      >{{
        $t("Use email instead")
      }}</a>
    </template>
  </base-form>
</template>
