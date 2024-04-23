<script setup lang="ts">
import PageFooter from "./components/PageFooter.vue";
import NavBar from "./components/NavBar.vue";
import { useUserStore } from "./stores/user";
import { RouterView } from "vue-router";
import { navIsLoading } from "./router";
import { useTeamStore } from "./stores/team";

// Using the store, attempt to get the current user
const user = useUserStore();
const team = useTeamStore();

if (!user.attemptedToFetchUser) {
  user.getUser();

  team.getUserTeams();
}
</script>

<template>
  <Transition>
    <progress v-if="navIsLoading" class="page-progress" :indeterminate="true" />
  </Transition>
  <NavBar />
  <main>
    <RouterView />
  </main>
  <PageFooter />
</template>
