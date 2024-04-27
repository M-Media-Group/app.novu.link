<script setup lang="ts">
import CreateRedirect from "@/forms/CreateRedirect.vue";
import CardElement from "@/components/CardElement.vue";
import image from "@/assets/undraw_connection.svg";
</script>
<template>
  <h1>{{ $t("New magic link") }}</h1>
  <div class="two-column-grid">
    <card-element>
      <create-redirect></create-redirect>
    </card-element>
    <img :src="image" alt="A person holding a link" />
  </div>
</template>
