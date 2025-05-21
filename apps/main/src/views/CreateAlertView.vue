<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import image from "@/assets/undraw_team_spirit_re_yl1v.svg";
import CreateAlert from "@/forms/CreateAlert.vue";
</script>
<template>
  <nav aria-label="breadcrumb">
    <ul>
      <li>
        <router-link to="/dashboard">
          {{ $t("Dashboard") }}
        </router-link>
      </li>
      <li>
        <router-link to="/alerts">
          {{ $t("Alerts") }}
        </router-link>
      </li>
      <li>{{ $t("Create a new alert") }}</li>
    </ul>
  </nav>
  <hgroup>
    <h1>{{ $t("Create a new alert") }}</h1>
    <p>{{ $t("Get notified when key events happen on your QR code") }}</p>
  </hgroup>
  <div class="two-column-grid">
    <card-element :title="$t('Create a new alert')">
      <create-alert />
    </card-element>
    <img
      :src="image"
      alt="A person holding a link"
    >
  </div>
</template>
