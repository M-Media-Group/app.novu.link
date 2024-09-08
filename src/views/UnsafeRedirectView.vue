<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import CardElement from "@/components/CardElement.vue";
import image from "@/assets/undraw_team_spirit_re_yl1v.svg";
import { setFollow } from "@m-media/vue3-meta-tags";

setFollow(false);
</script>
<template>
  <div>
    <hgroup>
      <h1>{{ $t("Link disabled") }}</h1>
      <p>
        {{
          $t(
            "This link has been disabled for your safety because it has been detected as phishing, malware, spyware, ransomware, or adware."
          )
        }}
      </p>
    </hgroup>
    <div class="two-column-grid">
      <card-element :title="$t('Go to the homepage')">
        <base-button to="/">{{ $t("Go to the homepage") }}</base-button>
      </card-element>
      <img :src="image" alt="A person holding a link" />
    </div>
  </div>
</template>
