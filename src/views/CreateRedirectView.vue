<script setup lang="ts">
import CreateRedirect from "@/forms/CreateRedirect.vue";
import CardElement from "@/components/CardElement.vue";
import image from "@/assets/undraw_connection.svg";

// It may be possible that a user fills the url with a query string, so we need to check and send it to create-redirect form
const searchParams = new URLSearchParams(window.location.search);
const url = searchParams.get("url");
const shouldSubmit = searchParams.has("url") && searchParams.has("submit");
</script>
<template>
  <div>
    <nav aria-label="breadcrumb">
      <ul>
        <li>
          <router-link to="/dashboard">{{ $t("Dashboard") }}</router-link>
        </li>
        <li>
          <router-link to="/redirects">{{ $t("Magic links") }}</router-link>
        </li>
        <li>{{ $t("New magic link") }}</li>
      </ul>
    </nav>
    <h1>{{ $t("New magic link") }}</h1>
  </div>
  <div class="two-column-grid">
    <card-element>
      <create-redirect
        :defaultEndpointValue="url ?? ''"
        :autoSubmit="shouldSubmit"
      ></create-redirect>
    </card-element>
    <img :src="image" alt="A person holding a link" />
  </div>
</template>
