import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axios from "axios";
import type { Team } from "@/types/team";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import { useRouter } from "vue-router";

export const useTeamStore = defineStore("team", () => {
  const activeTeamId = ref(null as Team["id"] | null);
  const teams = ref([] as Team[]);

  const $bus = useEventsBus();

  /** @todo move the router logic out of here - it can emit a success event but another component (e.g. not the store) should actually route */
  const router = useRouter();

  const getUserTeams = async () => {
    // Fetch teams from the API
    const response = await axios.get("/api/v1/teams").catch((error) => {
      return error.response;
    });

    if (response?.status !== 200) {
      return;
    }

    // Set the teams to the response data
    teams.value = response.data;

    if (!teams.value.length) {
      return;
    }

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
  };

  //   If we get an authenticated event on the event bus, we should fetch the user's teams.
  $bus?.$on(eventTypes.logged_in, getUserTeams);
  $bus?.$on(eventTypes.registered, getUserTeams);
  $bus?.$on(eventTypes.confirmed_otp, getUserTeams);
  $bus?.$on(eventTypes.logged_out, () => {
    teams.value = [];
    activeTeamId.value = null;
  });

  const activeTeam = computed(() => {
    if (!activeTeamId.value || !teams.value.length) {
      return null;
    }
    return teams.value.find((team) => team.id === activeTeamId.value);
  });

  /**
   * Get a payment intent
   */
  async function getPaymentIntent() {
    try {
      const response = await axios.get("user/payment-intent");
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Add a payment method for a user
   */
  async function addPaymentMethod(paymentMethodId: string) {
    try {
      await axios.post("/api/v1/payment-methods", {
        payment_method: paymentMethodId,
      });
      $bus.$emit(eventTypes.added_payment_method);
      await getUserTeams();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Get the payment methods of the user
   */
  async function getPaymentMethods() {
    try {
      const response = await axios.get("/api/v1/payment-methods");
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  const update = async (team: Team) => {
    const response = await axios.put(`/teams/${team.id}`, {
      name: team.name,
    });

    if (response.status === 200) {
      // If we have no teams, return false
      if (!teams.value.length) {
        return false;
      }
      // Update the team - only update the name for now
      const index = teams.value.findIndex((t) => t.id === team.id);
      teams.value[index].name = team.name;
      return true;
    } else {
      console.error("Failed to update team");
    }
  };

  /** Switch the current team */
  const switchTeam = async (teamId: Team["id"]) => {
    //  Make a put to /current-team with the teamId
    const response = await axios.put("/current-team", {
      team_id: teamId,
    });

    if (response.data.success || response.data.message === "Team updated.") {
      // Set the active team to the teamId
      activeTeamId.value = teamId;
      $bus.$emit(eventTypes.changed_team);
      // Redirect to dashboard
      router.push({ name: "dashboard" });
    } else {
      console.error("Failed to switch team", response.data.message);
    }
  };

  const createTeam = async (team: { name: Team["name"] }) => {
    const response = await axios
      .post("/teams", {
        name: team.name,
      })
      .catch((error) => {
        console.error("Failed to create team", error);
        return error.response;
      });

    if (response.status === 201) {
      //  The response does not return anything, so we need to fetch the teams again and then set the active team to the newly created team
      await getUserTeams();
      const newTeam = teams.value.sort((a, b) => b.id - a.id)[0];
      activeTeamId.value = newTeam.id;
      return true;
    } else {
      console.error("Failed to create team");
      return response;
    }
  };

  const getAnalyticsIntegrations = async () => {
    try {
      const response = await axios.get("/api/v1/analytics/integrations");
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const deleteAnalyticsIntegration = async (integrationId: string | number) => {
    try {
      const response = await axios.delete(
        `/api/v1/analytics/integrations/${integrationId}`
      );
      return response.status === 204;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    activeTeam,
    teams,
    getUserTeams,
    update,
    getPaymentIntent,
    addPaymentMethod,
    getPaymentMethods,
    switchTeam,
    createTeam,
    getAnalyticsIntegrations,
    deleteAnalyticsIntegration,
  };
});
