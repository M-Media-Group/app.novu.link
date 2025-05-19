<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import BaseForm from "@/forms/BaseForm.vue";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import image from "@/assets/undraw_mobile_inbox_re_ciwq.svg";

const emailSent = ref(false);

const userStore = useUserStore();

const resendEmail = async () => {
  // Check if the email is already in use
  const response = await userStore.resendEmailConfirmation();

  if (response) {
    emailSent.value = true;
  } else {
    alert("Something went wrong sending you a new email. Please try again");
  }
};
</script>
<template>
  <h1>{{ $t("Confirm your email") }}</h1>
  <div class="two-column-grid">
    <card-element
      :title="$t('Confirm your email')"
      :subtitle="userStore.user?.email"
    >
      <p>
        {{
          $t(
            "Please confirm your email address to continue. Check your spam too. If you didn't get an email, you can ask us to send you a new one."
          )
        }}
      </p>
      <p class="success" v-if="emailSent">
        {{ $t("A new email has been sent to you.") }}
      </p>
      <base-form v-else :submit-text="$t('Resend email')" @submit="resendEmail">
        <template #after-submit>
          <!-- Change email -->
          <router-link to="/settings">{{ $t("Change email") }}</router-link>
        </template>
      </base-form>
    </card-element>
    <img :src="image" alt="A person holding a link" />
  </div>
</template>
