<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import AccountSettings from "@/forms/AccountSettings.vue";
import PersonalAccessTokens from "@/forms/PersonalAccessTokens.vue";
import BaseButton from "@/components/BaseButton.vue";
import { useUserTokens } from "@/composables/useUserTokens";

const {
  accessTokens,
  conditionallyPushUserToConfirmEmail,
  handleCreatedToken,
  handleDeleteToken,
} = useUserTokens();
</script>
<template>
  <h1>{{ $t("My Account") }}</h1>
  <card-element :titleHeadingLevel="2" :title="$t('Settings')">
    <account-settings
      @updated="conditionallyPushUserToConfirmEmail"
    ></account-settings>
  </card-element>

  <card-element :titleHeadingLevel="2" title="API">
    <template v-if="accessTokens.length > 0">
      <ul>
        <li v-for="token in accessTokens" :key="'token-' + token.id">
          <strong>{{ token.name ?? "Untitled token" }}: </strong>
          <span>created {{ token.created_at }}</span>
          <button @click="handleDeleteToken(token.id)" type="button">
            Delete
          </button>
        </li>
      </ul>
    </template>
    <p v-else>{{ $t("You have no API access tokens.") }}</p>
    <personal-access-tokens @created="handleCreatedToken" :autofocus="false" />
    <a href="https://blog.novu.link/developers/" target="_blank">
      {{ $t("API Documentation") }} ({{ $t("en") }})
    </a>
  </card-element>

  <card-element :titleHeadingLevel="2" :title="$t('Payment methods')">
    <p>
      {{ $t("Manage your payment methods in your team's settings.") }}
    </p>
    <base-button :to="{ path: '/team/settings' }" type="button">
      {{ $t("Go to team settings") }}
    </base-button>
  </card-element>
</template>
