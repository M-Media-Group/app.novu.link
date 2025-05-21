<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import LoginOrRegister from "@/forms/LoginOrRegister.vue";
import router from "@/router";
import image from "@/assets/undraw_link_shortener.svg";
import { watch } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

watch(
  () => userStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      router.push(
        (router.currentRoute.value.query.redirect as string) ?? "/dashboard"
      );
    }
  }
);
</script>

<template>
  <h1>{{ $t("Authenticate") }}</h1>
  <div class="two-column-grid">
    <card-element :title-heading-level="2">
      <login-or-register />
    </card-element>
    <img
      :src="image"
      alt="A person holding a link"
    >
  </div>
</template>
