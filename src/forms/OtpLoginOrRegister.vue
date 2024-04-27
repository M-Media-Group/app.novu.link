<script lang="ts" setup>
import BaseForm from "@/forms/BaseForm.vue";
import { useUserStore } from "@/stores/user";
import { nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";

const userStore = useUserStore();
const isOnOtpPage = ref(false);

const otpCode = ref("");
const isLoading = ref(false);
const usePhone = ref(true);

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
  <base-form
    v-if="isOnOtpPage"
    @submit="validateOtp"
    :isLoading="isLoading"
    :disabled="isLoading"
    :inline="inline"
    ><p v-show="!inline">
      {{ $t("Enter the code you received.") }}
      {{
        !usePhone
          ? $t("Check your email inbox or spam.")
          : $t("Check your phone.")
      }}
    </p>
    <label for="otp" v-show="!inline">OTP</label>
    <input
      type="text"
      name="otp"
      required
      v-model="otpCode"
      inputmode="numeric"
      pattern="[0-9]*"
      minlength="6"
      maxlength="6"
      :placeholder="$t('One-time password')"
      :autofocus="autofocus"
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
    :inline="inline"
    :autofocus="autofocus"
    :submitText="submitText"
  >
    <template v-if="!usePhone">
      <label for="email" v-show="!inline">{{ $t("Email") }}</label>
      <input
        id="email"
        type="email"
        name="email"
        required
        :autofocus="autofocus"
        v-model="userStore.userEmail"
        ref="phoneInput"
      />
    </template>
    <template v-else>
      <label for="phone" v-show="!inline">{{
        $t("Phone number (starting with +)")
      }}</label>
      <input
        id="phone"
        type="tel"
        name="phone"
        inputmode="tel"
        required
        :autofocus="autofocus"
        v-model="userStore.userPhone"
        autocomplete="tel"
        pattern="^\+[0-9]{1,15}$"
        minlength="7"
        maxlength="16"
        :placeholder="$t('+339123456789')"
        ref="phoneInput"
      />
    </template>
    <template #after-submit>
      <p>
        <a v-if="!usePhone" href="#" @click.prevent="toggleUsePhone">{{
          $t("Use phone instead")
        }}</a>
        <a v-else href="#" @click.prevent="toggleUsePhone">{{
          $t("Use email instead")
        }}</a>
      </p>
    </template>
  </base-form>
</template>
