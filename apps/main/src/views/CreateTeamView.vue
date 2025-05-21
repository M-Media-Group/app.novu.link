<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import CreateTeam from "@/forms/CreateTeam.vue";
import { useRouter } from "vue-router";
import image from "@/assets/undraw_team_spirit_re_yl1v.svg";

const router = useRouter();

const handleSuccess = () => {
  router.push("/dashboard");
};
</script>
<template>
  <h1>{{ $t("Create New Team") }}</h1>
  <div class="two-column-grid">
    <card-element
      :title-heading-level="2"
      :show-title="false"
    >
      <create-team @success="handleSuccess" />
    </card-element>
    <img
      :src="image"
      alt="A person holding a link"
    >
  </div>
</template>
