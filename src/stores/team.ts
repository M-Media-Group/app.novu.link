import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axios from "axios";
import type { Team } from "@/types/team";
import { eventTypes, useEventsBus } from "@/eventBus/events";

export const useTeamStore = defineStore("team", () => {
  const activeTeamId = ref(null as Team["id"] | null);
  const teams = ref([] as Team[]);

  const $bus = useEventsBus();

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

  //   If we get an authenticated event on the event bus, we should fetch the user's teams.
  $bus.$on(eventTypes.logged_in, getUserTeams);
  $bus.$on(eventTypes.registered, getUserTeams);

  const activeTeam = computed(() => {
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
    const response = await axios.put(`/teams/${team.id}`, team);

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
    getPaymentIntent,
    addPaymentMethod,
    getPaymentMethods,
  };
});
