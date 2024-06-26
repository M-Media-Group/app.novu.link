import { type Ref, ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { PersonalAccessToken, User } from "@/types/user";
import { eventTypes, useEventsBus } from "@/eventBus/events";

export const useUserStore = defineStore("user", () => {
  // the state of the user
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const user = ref(null) as Ref<User | null>;
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

  // The userEmail is meant for keeping email state across auth pages, for example when going from login to forgot-password page
  const userEmail = ref(null) as Ref<string | null>;

  const userPhone = ref(null) as Ref<string | null>;

  /**
   * Get the user
   *
   */
  async function getUser() {
    isLoading.value = true;
    try {
      const response = await axios.get("/api/user");
      user.value = response.data;

      isAuthenticated.value = true;

      userEmail.value = response.data.email;
      userPhone.value = response.data.phone_number;

      await getCsrfToken();
    } catch (error) {
      console.log(error);
    } finally {
      attemptedToFetchUser.value = true;
      isLoading.value = false;
    }
  }

  /**
   * Check if the email has an account
   *
   * @param {string} email
   * @return {*}
   */
  async function checkEmail(email: string) {
    // Check if the email is valid
    if (!email) {
      return;
    }

    isLoading.value = true;

    await getCsrfToken().catch((e) => {
      console.error("CSRF cookie fetching error", e);
    });

    // Check if the email is already in use by calling POST "email-exists/" + email with axios. If it returns 404, the email is not in use.
    try {
      const response = await axios.post("/email-exists/" + email);
      return response.status === 200;
    } catch (error: any) {
      if (error.response.status === 404) {
        return false;
      }
      return error.response;
    } finally {
      isLoading.value = false;
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
    // Check if the email is valid
    if (!email) {
      return false;
    }

    // Check if the password is valid
    if (!password) {
      return false;
    }

    isLoading.value = true;

    // Check if the email is already in use
    try {
      await axios.post("/login", {
        email: email,
        password: password,
        remember: "on",
      });
      await getUser();
      $bus.$emit(eventTypes.logged_in);
      return true;
    } catch (error) {
      return false;
    } finally {
      isLoading.value = false;
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
    // Check if the email is valid
    if (!email) {
      return;
    }

    // Check if the password is valid
    if (!password) {
      return;
    }

    // Check if the name is valid
    if (!name) {
      return;
    }

    isLoading.value = true;

    try {
      // Check if the email is already in use
      await axios.post("/register", {
        email: email,
        password: password,
        password_confirmation: password,
        name: name,
        terms: true,
      });
      await getUser();
      $bus.$emit(eventTypes.registered);
      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Request an OTP to be sent to the provided email
   *
   * @param {string} notifiable
   * @return {*}
   */
  async function requestOtp(
    notifiable: string,
    method = "email" as "email" | "phone_number"
  ) {
    if (!notifiable) {
      return false;
    }

    isLoading.value = true;

    // Submit a reset password
    try {
      await axios.post("/user/otp", {
        [method]: notifiable,
      });
      $bus.$emit(eventTypes.sent_otp);
      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Confirm the OTP
   *
   * @param {string} otp
   */
  async function confirmOtp(otp: string) {
    if (!otp) {
      return false;
    }

    isLoading.value = true;

    // Submit a reset password
    try {
      const response = await axios.post("/user/otp/confirm", {
        otp: otp,
      });
      // Fetch the user
      $bus.$emit(eventTypes.confirmed_otp);

      await getUser();

      // The response tells us if the user is new or not
      if (response.data.user_created) {
        $bus.$emit(eventTypes.registered);
      } else {
        $bus.$emit(eventTypes.logged_in);
      }

      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Resend a confirm-email email to the user
   *
   * @return {*}
   */
  async function resendEmailConfirmation() {
    if (!user.value) {
      return;
    }
    isLoading.value = true;
    try {
      await axios.post("/email/verification-notification", {
        email: user.value.email,
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Send a reset-password email/request
   *
   * @param {string} email
   * @return {*}
   */
  async function sendPasswordResetEmail(email: string) {
    if (!email) {
      return false;
    }

    isLoading.value = true;

    // Submit a reset password
    try {
      await axios.post("/forgot-password", {
        email: email,
      });
      $bus.$emit(eventTypes.sent_reset_password_email);
      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
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
    if (!email) {
      return false;
    }

    if (!token) {
      return false;
    }

    if (!password) {
      return false;
    }

    isLoading.value = true;

    // Submit a reset password
    try {
      await axios.post("/reset-password", {
        email: email,
        token: token,
        password: password,
        password_confirmation: password,
      });
      $bus.$emit(eventTypes.reset_password);
      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Confirm the users password
   *
   * @param {string} password
   * @return {*}
   */
  async function confirmPassword(password: string) {
    if (!password) {
      return false;
    }

    isLoading.value = true;

    // Submit a reset password
    try {
      await axios.post("/user/confirm-password", {
        password: password,
      });
      $bus.$emit(eventTypes.confirmed_password);
      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Determine if the user should confirm their password.
   *
   * @return {*}
   */
  async function shouldConfirmPassword() {
    isLoading.value = true;
    try {
      const response = await axios.get("/user/confirmed-password-status");
      return !response.data.confirmed;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get a CSRF cookie from the server
   *
   */
  async function getCsrfToken() {
    await axios.get("/sanctum/csrf-cookie");
  }

  /**
   * Logout the user
   *
   */
  async function logout() {
    isLoading.value = true;
    await axios.post("/logout");
    isAuthenticated.value = false;
    user.value = null;
    isLoading.value = false;
    $bus.$emit(eventTypes.logged_out);
  }

  /**
   * Update a user's profile
   *
   * @param {string} name
   * @param {string} email
   * @return {*}
   */
  async function update(name: string, email: string, phone?: string | null) {
    isLoading.value = true;
    try {
      await axios.put("/user/profile-information", {
        name: name ?? user.value?.name,
        email: email ?? user.value?.email,
        phone_number: phone ?? user.value?.phone_number,
      });
      await getUser();
      $bus.$emit(eventTypes.updated_user);
      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get all the users personal access tokens
   *
   * @return {*}
   */
  async function getPersonalAccessTokens() {
    return axios
      .get("/user/personal-access-tokens")
      .then((response) => {
        if (!user.value) {
          return [] as PersonalAccessToken[];
        }
        // If the response is not one containing an array of personal access tokens, return an empty array. For example, the endpoint might return HTML instead of JSON.
        if (
          !Array.isArray(response.data) ||
          response.data.length === 0 ||
          !response.data[0].id
        ) {
          throw new Error(
            "Invalid response while fetching personal access tokens."
          );
        }

        user.value.personal_access_tokens = response.data;
        return response.data as PersonalAccessToken[];
      })
      .catch((error) => {
        console.log("Personal access tokens error", error);
        return [] as PersonalAccessToken[];
      });
  }

  /**
   * Create a personal access token for the user
   *
   * @param {string} name
   * @return {*}
   */
  async function createPersonalAccessToken(name: string) {
    return axios
      .post("/user/personal-access-tokens", {
        name: name,
      })
      .then((response) => {
        $bus.$emit(eventTypes.created_personal_access_token, response.data);
        return response.data;
      })
      .catch((error) => {
        console.log("Personal access tokens error", error);
        alert(error.response.data.message);
      })
      .finally(() => {
        isLoading.value = false;
      });
  }

  async function deletePersonalAccessToken(id: string) {
    return axios
      .delete("/user/personal-access-tokens/" + id)
      .then((response) => {
        $bus.$emit(eventTypes.deleted_personal_access_token, response.data);
        return response.data;
      })
      .catch((error) => {
        console.log("Personal access tokens error", error);
        alert(error.response.data.message);
      })
      .finally(() => {
        isLoading.value = false;
      });
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
