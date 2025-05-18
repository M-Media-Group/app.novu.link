import { type Ref, ref } from "vue";
import { defineStore } from "pinia";

import type { User } from "@/types/user";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import { assertIsUnifiedError } from "@/services/apiServiceErrorHandler";

import {
  checkEmail as checkEmailUser,
  confirmOtp as confirmOtpUser,
  confirmPassword as confirmPasswordUser,
  createPersonalAccessToken as createPersonalAccessTokenUser,
  deletePersonalAccessToken as deletePersonalAccessTokenUser,
  getPersonalAccessTokens as getPersonalAccessTokensUser,
  getUser as getUserUser,
  login as loginUser,
  logout as logoutUser,
  register as registerUser,
  requestOtp as requestOtpUser,
  resendEmailConfirmation as resendEmailConfirmationUser,
  sendPasswordResetEmail as sendPasswordResetEmailUser,
  sendPasswordReset as sendPasswordResetUser,
  shouldConfirmPassword as shouldConfirmPasswordUser,
  update as updateUser,
} from "@/repositories/user/userRepository";

export const useUserStore = defineStore("user", () => {
  // the state of the user
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const user = ref<User | null>(null);
  const attemptedToFetchUser = ref(false);

  const $bus = useEventsBus();
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

  $bus.$on(eventTypes.logged_in, () => {
    getUser();
  });

  $bus.$on(eventTypes.registered, () => {
    getUser();
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
   * Register the user
   *
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @return {*}
   */
  async function register(email: string, password: string, name: string) {
    await registerUser({
      email: email,
      password: password,
      password_confirmation: password,
      name: name,
      terms: true,
    });

    return true;
  }

  async function requestOtp(
    notifiable: string,
    method = "email" as "email" | "phone_number"
  ) {
    const payload =
      method === "email" ? { email: notifiable } : { phone_number: notifiable };
    await requestOtpUser(payload);
    $bus.$emit(eventTypes.sent_otp);
  }

  /**
   * Confirm the OTP
   *
   * @param {string} otp
   */
  async function confirmOtp(otp: string) {
    // Submit a reset password
    try {
      const response = await confirmOtpUser({ otp });
      // Fetch the user
      $bus.$emit(eventTypes.confirmed_otp);

      await getUser();

      // The response tells us if the user is new or not
      if (response.user_created) {
        $bus.$emit(eventTypes.registered);
      } else {
        $bus.$emit(eventTypes.logged_in);
      }

      return true;
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
      $bus.$emit(eventTypes.sent_reset_password_email);
    } catch (error: any) {
      assertIsUnifiedError(error);
      if (error.status === 422 && error.details) {
        error.details.password = error.details.email;
      }
      throw error;
    }
  }

  /**
   * Attempt to reset a password
   *
   * @param {string} email
   * @param {string} token
   * @param {string} password
   * @return {*}
   */
  async function sendPasswordReset(
    email: string,
    token: string,
    password: string
  ) {
    await sendPasswordResetUser({
      email: email,
      token: token,
      password: password,
      password_confirmation: password,
    });
    $bus.$emit(eventTypes.reset_password);
    return true;
  }

  /**
   * Confirm the users password
   *
   * @param {string} password
   * @return {*}
   */
  async function confirmPassword(password: string) {
    await confirmPasswordUser({
      password,
    });
    $bus.$emit(eventTypes.confirmed_password);
    return true;
  }

  /**
   * Determine if the user should confirm their password.
   *
   * @return {*}
   */
  async function shouldConfirmPassword() {
    const response = await shouldConfirmPasswordUser();
    return !response.confirmed;
  }

  /**
   * Logout the user
   *
   */
  async function logout() {
    await logoutUser();
    $bus.$emit(eventTypes.logged_out);
    isAuthenticated.value = false;
    user.value = null;
  }

  /**
   * Update a user's profile
   *
   * @param {string} name
   * @param {string} email
   * @return {*}
   */
  async function update(name: string, email: string, phone?: string | null) {
    await updateUser({
      name: name ?? user.value?.name,
      email: email ?? user.value?.email,
      phone_number: phone ?? user.value?.phone_number ?? undefined,
    });
    await getUser();
    $bus.$emit(eventTypes.updated_user);
    return true;
  }

  /**
   * Get all the users personal access tokens
   *
   * @return {*}
   */
  async function getPersonalAccessTokens() {
    return await getPersonalAccessTokensUser();
  }

  /**
   * Create a personal access token for the user
   *
   * @param {string} name
   * @return {*}
   */
  async function createPersonalAccessToken(name: string) {
    const response = createPersonalAccessTokenUser({
      name,
    });
    $bus.$emit(eventTypes.created_personal_access_token, response);
    return response;
  }

  async function deletePersonalAccessToken(id: number) {
    await deletePersonalAccessTokenUser({ id });
    $bus.$emit(eventTypes.deleted_personal_access_token);
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
  };
});
