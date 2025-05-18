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
      dataToSend,
      usePhone.value ? "phone_number" : "email"
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
  <label v-if="inline && !isOnOtpPage" :for="usePhone ? 'phone' : 'email'">
    {{ usePhone ? $t("Phone number (starting with +)") : $t("Email") }}
  </label>
  <label v-else-if="inline">
    {{ $t("One-time password") }}
  </label>
  <base-form
    ref="baseFormRef"
    v-if="isOnOtpPage"
    @success="emit('success')"
    :submitFn="validateOtp"
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
      @input="baseFormRef?.submit()"
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
    ref="baseFormRef"
    :submitFn="makeOtpRequest"
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
        autocomplete="email"
        :placeholder="$t('Email')"
        data-hj-allow
      />
    </template>
    <template v-else>
      <label for="phone" v-show="!inline">{{
        $t("Phone number (starting with +)")
      }}</label>
      <input
        id="phone"
        type="tel"
        name="phone_number"
        inputmode="tel"
        required
        :autofocus="autofocus"
        v-model="userStore.userPhone"
        autocomplete="tel"
        pattern="^\+[0-9]{1,15}$"
        minlength="7"
        maxlength="16"
        :placeholder="$t('Phone number')"
        ref="phoneInput"
        data-hj-allow
      />
    </template>
    <template #after-submit>
      <a v-if="!usePhone" href="#" @click.prevent="toggleUsePhone">{{
        $t("Use phone instead")
      }}</a>
      <a v-else href="#" @click.prevent="toggleUsePhone">{{
        $t("Use email instead")
      }}</a>
    </template>
  </base-form>
</template>
