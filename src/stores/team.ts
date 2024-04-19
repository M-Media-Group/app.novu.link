import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axios from "axios";
import type { Team } from "@/types/team";

export const useTeamStore = defineStore("team", () => {
  const activeTeamId = ref(null as Team["id"] | null);
  const teams = ref([] as Team[]);

  const getUserTeams = async () => {
    // Fetch teams from the API
    const response = await axios.get("/api/v1/teams");

    // Set the teams to the response data
    teams.value = response.data;

    const activeTeam = teams.value.find((team) => team.is_active)?.id;

    if (!activeTeam) {
      return;
    }

    // Set the active team to the team that has is_active set to true
    activeTeamId.value = activeTeam;
  };

  const activeTeam = computed(() => {
    return teams.value.find((team) => team.id === activeTeamId.value);
  });

  const update = async (team: Team) => {
    const response = await axios.put(`/api/v1/teams/${team.id}`, team);

    if (response.status === 200) {
      // Update the team in the store
      const index = teams.value.findIndex((t) => t.id === team.id);
      teams.value[index] = team;
      return true;
    } else {
      console.error("Failed to update team");
    }
  };

  return {
    activeTeam,
    teams,
    getUserTeams,
    update,
  };
});
