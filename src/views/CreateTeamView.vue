<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import CreateTeam from "@/forms/CreateTeam.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const handleSuccess = () => {
  router.push("/dashboard");
};
</script>
<template>
  <h1>{{ $t("New Team") }}</h1>
  <card-element :titleHeadingLevel="2" :showTitle="false">
    <create-team @success="handleSuccess"></create-team>
  </card-element>
</template>
