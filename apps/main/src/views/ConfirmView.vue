<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import { defineAsyncComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import image from "@/assets/undraw_selection_re_ycpo.svg";

const route = useRoute();
const router = useRouter();

const element = defineAsyncComponent(
  () => import(`./../forms/${route.params.element}.vue`)
);
const redirect = () => {
  // Redirect to the home page
  router.push((router.currentRoute.value.query.redirect as string) ?? "/");
};
</script>
<template>
  <h1>{{ $t("Confirm") }}</h1>
  <div class="two-column-grid">
    <card-element :title="$t('Continue')">
      <component
        :is="element"
        @success="redirect"
      />
    </card-element>
    <img
      :src="image"
      alt="A person holding a link"
    >
  </div>
</template>
