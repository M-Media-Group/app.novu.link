<script setup lang="ts">
import CreateRedirect from "@/forms/CreateRedirect.vue";
import CardElement from "@/components/CardElement.vue";
</script>

<template>
  <section id="externalLinks" class="two-column-grid hero-section">
    <hgroup>
      <h1>{{ $t("Solve QR codes forever") }}</h1>
      <p>
        {{
          $t(
            `The hardest thing with QR codes and links is changing them after they're printed. We've fixed that.`
          )
        }}
      </p>
    </hgroup>
    <card-element>
      <create-redirect :autofocus="false"></create-redirect>
    </card-element>
  </section>
</template>
<style scoped>
.hero-section {
  grid-template-columns: 3fr 2fr;
}
h2 {
  font-size: 300%;
}
hgroup h2 + p {
  font-size: 300%;
}
</style>
