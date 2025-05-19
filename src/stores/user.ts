import { type Ref, ref } from "vue";
import { defineStore } from "pinia";

import type { User } from "@/types/user";
import { assertIsUnifiedError } from "@/services/apiServiceErrorHandler";

import {
  checkEmail as checkEmailUser,
  confirmOtp as confirmOtpUser,
  confirmPassword,
  createPersonalAccessToken,
  deletePersonalAccessToken,
  getPersonalAccessTokens,
  getUser as getUserUser,
  login as loginUser,
  logout,
  register,
  requestOtp,
  resendEmailConfirmation as resendEmailConfirmationUser,
  sendPasswordReset,
  sendPasswordResetEmail as sendPasswordResetEmailUser,
  shouldConfirmPassword,
  update as updateUser,
} from "@/repositories/user/userRepository";

export const useUserStore = defineStore("user", () => {
  // the state of the user
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const user = ref<User | null>(null);
  const attemptedToFetchUser = ref(false);

  // A promise that returns true when isLoading is false and attemptedToFetchUser is true
  const isReady = new Promise((resolve) => {
    const interval = setInterval(() => {
      if (attemptedToFetchUser.value && !isLoading.value) {
        clearInterval(interval);
        resolve(true);
      }
    }, 10);
  }).then(() => {
    return true;
  });

  // The userEmail is meant for keeping email state across auth pages, for example when going from login to forgot-password page
  const userEmail = ref(null) as Ref<string | null>;

  const userPhone = ref(null) as Ref<string | null>;

  /**
   * Get the user
   *
   */
  async function getUser() {
    try {
      user.value = await getUserUser();
      isAuthenticated.value = true;
      userEmail.value = user.value.email;
      userPhone.value = user.value.phone_number;
    } catch (error) {
      assertIsUnifiedError(error);
      if (error.status === 401) {
        isAuthenticated.value = false;
        user.value = null;
        console.log("User not authenticated");
        return;
      }
      throw error;
    } finally {
      attemptedToFetchUser.value = true;
    }
  }

  /**
   * Check if the email has an account
   *
   * @param {string} email
   * @return {*}
   */
  async function checkEmail(email: string) {
    // Check if the email is already in use by calling POST "email-exists/" + email with apiService. If it returns 404, the email is not in use.
    try {
      await checkEmailUser({ email });
      return true;
    } catch (error) {
      assertIsUnifiedError(error);

      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Log in the user
   *
   * @param {string} email
   * @param {string} password
   * @return {*}
   */
  async function login(email: string, password: string) {
    // Check if the email is already in use
    try {
      await loginUser({
        email: email,
        password: password,
        remember: "on",
      });
      return true;
    } catch (error) {
      assertIsUnifiedError(error);
      if (error.status === 422 && error.details) {
        error.details.password = error.details.password ?? error.details.email;
      }
      throw error;
    }
  }

  /**
   * Confirm the OTP
   *
   * @param {string} otp
   */
  async function confirmOtp(otp: string) {
    // Submit a reset password
    try {
      await confirmOtpUser({ otp });
    } catch (error) {
      assertIsUnifiedError(error);
      if (error.status === 422 && !error.details?.length) {
        error.details = {
          otp: "The OTP is invalid or expired.",
        };
      }

      throw error;
    }
  }

  /**
   * Resend a confirm-email email to the user
   *
   * @return {*}
   */
  async function resendEmailConfirmation() {
    await resendEmailConfirmationUser({
      email: user.value?.email,
    });
    return true;
  }

  /**
   * Send a reset-password email/request
   *
   * @param {string} email
   * @return {*}
   */
  async function sendPasswordResetEmail(email: string) {
    try {
      await sendPasswordResetEmailUser({
        email,
      });
    } catch (error: any) {
      assertIsUnifiedError(error);
      if (error.status === 422 && error.details) {
        error.details.password = error.details.email;
      }
      throw error;
    }
  }

  /**
   * Update a user's profile
   *
   * @param {string} name
   * @param {string} email
   * @return {*}
   */
  async function update(name: string, email: string, phoneNumber?: string) {
    await updateUser({
      name,
      email,
      phone_number: phoneNumber,
    });
    if (!user.value) {
      return true;
    }
    user.value = {
      ...user.value,
      name,
      email,
      phone_number: phoneNumber ?? user.value.phone_number,
    };
    return true;
  }

  async function logoutInStore() {
    isAuthenticated.value = false;
    user.value = null;
    attemptedToFetchUser.value = false;
  }

  return {
    isAuthenticated,
    checkEmail,
    getUser,
    user,
    userEmail,
    userPhone,
    attemptedToFetchUser,
    isLoading,
    login,
    register,
    resendEmailConfirmation,
    sendPasswordResetEmail,
    sendPasswordReset,
    logout,
    update,
    confirmPassword,
    shouldConfirmPassword,
    isReady,
    getPersonalAccessTokens,
    createPersonalAccessToken,
    deletePersonalAccessToken,
    requestOtp,
    confirmOtp,
    logoutInStore,
  };
});
