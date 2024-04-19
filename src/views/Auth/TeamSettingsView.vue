<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import AddPaymentMethod from "@/forms/AddPaymentMethod.vue";
import TeamSettings from "@/forms/TeamSettings.vue";
import { useTeamStore } from "@/stores/team";
import { useUserStore } from "@/stores/user";
import type { PersonalAccessToken } from "@/types/user";
import { ref } from "vue";

const userStore = useUserStore();
const teamStore = useTeamStore();

teamStore.getUserTeams();

const addingNewPaymentMethod = ref(false);

const accessTokens = ref<PersonalAccessToken[]>([]);

userStore
  .getPersonalAccessTokens()
  .then((tokens) => (accessTokens.value = tokens));
</script>
<template>
  <h1>{{ $t("My Team") }}</h1>
  <card-element :titleHeadingLevel="2" title="Team settings">
    <team-settings></team-settings>
  </card-element>
  <card-element :titleHeadingLevel="2" :title="$t('Payment methods')">
    <div v-if="teamStore.activeTeam?.pm_type">
      <p>
        {{ $t("Default payment method") }}:
        {{ teamStore.activeTeam?.pm_type.toUpperCase() }} ****
        {{ teamStore.activeTeam?.pm_last_four }}
      </p>
    </div>
    <div v-else>
      <p>{{ $t("You do not have a default payment method set") }}</p>
    </div>
    <add-payment-method
      v-if="addingNewPaymentMethod"
      @success="
        addingNewPaymentMethod = false;
        userStore.getUser();
      "
    />
    <button
      data-cy="add-payment-button"
      v-else
      @click="addingNewPaymentMethod = true"
      type="button"
    >
      {{ $t("Add a payment method") }}
    </button>
  </card-element>
</template>
