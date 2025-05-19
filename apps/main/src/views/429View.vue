<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
</script>
<template>
  <h1>429</h1>
  <p>
    {{
      $t(
        "We've detected an unusual amount of traffic from your IP address. Please wait a few minutes before trying again."
      )
    }}
  </p>
  <base-button to="/">{{ $t("Home") }}</base-button>
</template>
