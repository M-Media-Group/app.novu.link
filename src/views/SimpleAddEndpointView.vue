<script setup lang="ts">
import SimpleAddEndpoint from "@/forms/SimpleAddEndpoint.vue";
import CardElement from "@/components/CardElement.vue";
import image from "@/assets/undraw_road_sign.svg";

defineProps({
  /** The redirect ID to add the endpoint for */
  redirectId: {
    type: String,
    required: true,
  },
  isSubscribable: {
    type: Boolean,
    required: false,
    default: true,
  },
});
</script>
<template>
  <div style="min-height: 100vh">
    <h1>{{ $t("Add destination") }}</h1>
    <p>
      {{
        $t(
          "Specify what conditions you want met to redirect to the new destination."
        )
      }}
    </p>
    <div class="two-column-grid">
      <card-element>
        <simple-add-endpoint
          v-if="redirectId"
          :redirectId="redirectId"
          :isSubscribable="isSubscribable"
          @success="$router.push(`/redirects/${redirectId}`)"
        />
        <div v-else>
          <p>{{ $t("No redirect ID provided") }}</p>
        </div>
      </card-element>
      <img :src="image" alt="A person holding a link" />
    </div>
  </div>
</template>
