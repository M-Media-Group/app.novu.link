<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import CardElement from "@/components/CardElement.vue";
import image from "@/assets/undraw_team_spirit_re_yl1v.svg";
import { setFollow } from "@m-media/vue3-meta-tags";

setFollow(false);
</script>
<template>
  <hgroup>
    <h1>{{ $t("Link disabled") }}</h1>
    <p>
      {{ $t("This link is dangerous.") }}
    </p>
  </hgroup>
  <div class="two-column-grid">
    <card-element :title="$t('Dangerous link')">
      <p>
        {{
          $t(
            "This link has been disabled for your safety because it has been detected as phishing, malware, spyware, ransomware, or adware."
          )
        }}
      </p>
      <div class="two-column-grid">
        <base-button to="/">
          {{ $t("Go to the homepage") }}
        </base-button>
        <base-button
          class="secondary"
          href="https://blog.novu.link/disabled-links-for-safety/"
          target="_blank"
        >
          {{ $t("Learn more") }}
        </base-button>
      </div>
    </card-element>
    <img
      :src="image"
      alt="A person holding a link"
    >
  </div>
</template>
