<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import LoginOrRegister from "@/forms/LoginOrRegister.vue";
import router from "@/router";
import image from "@/assets/undraw_link_shortener.svg";

const redirect = () => {
  // Redirect to the home page
  router.push(
    (router.currentRoute.value.query.redirect as string) ?? "/dashboard"
  );
};
</script>

<template>
  <h1>{{ $t("Authenticate") }}</h1>
  <div class="two-column-grid">
    <card-element :titleHeadingLevel="2">
      <login-or-register @success="redirect" />
    </card-element>
    <img :src="image" />
  </div>
</template>
