<script setup lang="ts">
import CreateRedirect from "@/forms/CreateRedirect.vue";
import CardElement from "@/components/CardElement.vue";
</script>
<template>
  <h1>{{ $t("New magic link") }}</h1>
  <card-element>
    <create-redirect></create-redirect>
  </card-element>
</template>
