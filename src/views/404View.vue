<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import CardElement from "@/components/CardElement.vue";
import image from "@/assets/undraw_team_spirit_re_yl1v.svg";
</script>
<template>
  <hgroup>
    <h1>404</h1>
    <p>This page can't be found.</p>
  </hgroup>
  <div class="two-column-grid">
    <card-element :title="$t('Go to the homepage')">
      <base-button to="/">{{ $t("Go to the homepage") }}</base-button>
    </card-element>
    <img :src="image" alt="A person holding a link" />
  </div>
</template>
