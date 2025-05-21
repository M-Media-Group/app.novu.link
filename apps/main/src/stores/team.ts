import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type { Team } from "@novulink/types";
import { getUserTeams as getUserTeamsRepo, switchTeam, updateTeam } from "@novulink/api";


export const useTeamStore = defineStore("team", () => {
  const activeTeamId = ref<Team["id"] | null>(null);
  const teams = ref<Team[]>([]);

  const getUserTeams = async () => {
    try {
      const response = await getUserTeamsRepo();
      teams.value = response;

      const active = teams.value.find((team) => team.is_active)?.id;
      const wasInactive = !activeTeamId.value;

      if (active) {
        activeTeamId.value = active;
      }

      return { wasInactive };
    } catch (error) {
      console.error("Failed to fetch teams", error);
      throw error;
    }
  };

  const update = async (team: Team) => {
    await updateTeam(team);
    return false;
  };

  const setActiveTeam = (id: number) => {
    activeTeamId.value = id;
  };

  const setNewestTeamAsActive = () => {
    if (!teams.value.length) return;
    const newest = [...teams.value].sort((a, b) => b.id - a.id)[0];
    activeTeamId.value = newest.id;
  };

  const activeTeam = computed(
    () => teams.value.find((team) => team.id === activeTeamId.value) ?? null
  );

  const reset = () => {
    teams.value = [];
    activeTeamId.value = null;
  };

  return {
    activeTeam,
    teams,
    getUserTeams,
    update,
    switchTeam,
    setActiveTeam,
    setNewestTeamAsActive,
    reset,
  };
});
