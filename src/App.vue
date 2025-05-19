<script setup lang="ts">
import PageFooter from "@/components/PageFooter.vue";
import { useUserStore } from "./stores/user";
import { RouterView } from "vue-router";
import { navIsLoading } from "./router";
import { useTeamStore } from "./stores/team";
import NavBar from "@/components/NavBar.vue";
import { useTeamEventListeners } from "./composables/useTeamEventListeners";
import { useUserEventListeners } from "./composables/useUserEventListeners";
import { onMounted } from "vue";

// Using the store, attempt to get the current user
const user = useUserStore();
const team = useTeamStore();

onMounted(async () => {
  if (!user.attemptedToFetchUser) {
    useUserEventListeners();
    useTeamEventListeners();
    user.getUser();

    await user.isReady;

    if (user.isAuthenticated) {
      team.getUserTeams();
    }
  }
});
</script>

<template>
  <Transition>
    <progress v-if="navIsLoading" class="page-progress" :indeterminate="true" />
  </Transition>
  <NavBar
    :user="user.user"
    :team="team.activeTeam"
    :teams="team.teams"
    @switch-team="team.switchTeam({ team_id: $event })"
  />
  <main>
    <RouterView />
  </main>
  <PageFooter />
</template>
