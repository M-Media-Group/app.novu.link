import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type { Team } from "@/types/team";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import { useRouter } from "vue-router";
import { apiService } from "@/services/apiClient";
import type { AnalyticsIntegration } from "@/types/analyticsIntegrations";
import {
  getUserTeams as getUserTeamsRepo,
  switchTeam,
  updateTeam,
} from "@/repositories/team/teamRepository";

export const useTeamStore = defineStore("team", () => {
  const activeTeamId = ref(null as Team["id"] | null);
  const teams = ref([] as Team[]);

  const $bus = useEventsBus();

  /** @todo move the router logic out of here - it can emit a success event but another component (e.g. not the store) should actually route */
  const router = useRouter();

  const getUserTeams = async () => {
    try {
      const response = await getUserTeamsRepo();
      teams.value = response;

      const activeTeam = teams.value.find((team) => team.is_active)?.id;

      if (!activeTeam) {
        return;
      }

      const hasActiveTeam = !!activeTeamId.value;

      // Set the active team to the team that has is_active set to true
      activeTeamId.value = activeTeam;

      // If there is current no active team, we emit an event
      if (!hasActiveTeam) {
        $bus.$emit(eventTypes.set_active_team);
      }
    } catch (error) {
      console.error("Failed to fetch teams", error);
      return error;
    }
  };

  //   If we get an authenticated event on the event bus, we should fetch the user's teams.
  $bus?.$on(eventTypes.logged_in, getUserTeams);
  $bus?.$on(eventTypes.registered, getUserTeams);
  $bus?.$on(eventTypes.confirmed_otp, getUserTeams);
  $bus?.$on(eventTypes.logged_out, () => {
    teams.value = [];
    activeTeamId.value = null;
  });
  $bus?.$on(eventTypes.added_payment_method, () => {
    // If the user changes the team, we should fetch the user's teams.
    getUserTeams();
  });

  $bus?.$on(eventTypes.changed_team, (id: number) => {
    activeTeamId.value = id;
    router.push({ name: "dashboard" });
  });

  $bus?.$on(eventTypes.created_team, async () => {
    await getUserTeams();
    const newTeam = teams.value.sort((a, b) => b.id - a.id)[0];
    activeTeamId.value = newTeam.id;
  });

  const activeTeam = computed(() => {
    if (!activeTeamId.value || !teams.value.length) {
      return null;
    }
    return teams.value.find((team) => team.id === activeTeamId.value);
  });

  const update = async (team: Team) => {
    await updateTeam(team);

    if (!teams.value.length) {
      return false;
    }

    // Update the team - only update the name for now
    const index = teams.value.findIndex((t) => t.id === team.id);
    teams.value[index].name = team.name;
    return true;
  };

  const getAnalyticsIntegrations = async () => {
    try {
      const response = await apiService.get<AnalyticsIntegration[]>(
        "/api/v1/analytics/integrations"
      );
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const deleteAnalyticsIntegration = async (integrationId: string | number) => {
    try {
      await apiService.delete(
        `/api/v1/analytics/integrations/${integrationId}`
      );
      return true;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    activeTeam,
    teams,
    getUserTeams,
    update,
    switchTeam,

    getAnalyticsIntegrations,
    deleteAnalyticsIntegration,
  };
});
