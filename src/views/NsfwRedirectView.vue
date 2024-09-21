<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import CardElement from "@/components/CardElement.vue";
import image from "@/assets/undraw_team_spirit_re_yl1v.svg";
import { setFollow } from "@m-media/vue3-meta-tags";

setFollow(false);

// Get the redirectTo query parameter
const redirectTo = new URLSearchParams(window.location.search).get(
  "redirectTo"
);

// If no redirectTo query parameter is present, redirect to the homepage
if (!redirectTo) {
  window.location.href = "/";
}
</script>
<template>
  <div>
    <hgroup>
      <h1>{{ $t("Link Not Safe for Work") }}</h1>
      <p>
        {{
          $t(
            "This link contains porn, nudity, violence, or other NSFW content."
          )
        }}
      </p>
    </hgroup>
    <div class="two-column-grid">
      <card-element :title="$t('NSFW link')" :subtitle="redirectTo ?? ''">
        <p>
          {{
            $t(
              "You can continue to the link at your own risk, or go back to safety."
            )
          }}
        </p>
        <div class="two-column-grid">
          <base-button to="/">{{ $t("Go to the homepage") }}</base-button>
          <base-button
            class="secondary"
            :href="redirectTo"
            rel="noopener noreferrer"
            >{{ $t("Continue to the link") }}</base-button
          >
        </div>
      </card-element>
      <img :src="image" alt="A person holding a link" />
    </div>
  </div>
</template>
