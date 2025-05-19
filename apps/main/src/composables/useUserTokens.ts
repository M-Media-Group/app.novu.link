// src/composables/useUserTokens.ts
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import type  {PersonalAccessToken} from "@novulink/types";

export const useUserTokens = () => {
  const userStore = useUserStore();
  const router = useRouter();
  const accessTokens = ref<PersonalAccessToken[]>([]);

  // Fetch personal access tokens on mount
  const fetchTokens = async () => {
    accessTokens.value = (await userStore.getPersonalAccessTokens()) ?? [];
  };

  // Handle user email update
  const conditionallyPushUserToConfirmEmail = (event: {
    email: string | undefined;
  }) => {
    if (event.email) {
      router.push({ name: "confirm-email" });
    }
  };

  // Handle creation of new token
  const handleCreatedToken = (token: PersonalAccessToken) => {
    accessTokens.value.push(token);
  };

  // Remove token locally (for UI)
  const removeAccessTokenLocally = (id: number) => {
    const accessTokenIndex = accessTokens.value.findIndex(
      (token) => token.id === id
    );
    if (accessTokenIndex !== -1) {
      accessTokens.value.splice(accessTokenIndex, 1);
    }
  };

  // Handle deletion of token
  const handleDeleteToken = async (id: number) => {
    await userStore.deletePersonalAccessToken({ id });
    removeAccessTokenLocally(id);
  };

  // Fetch tokens on mount
  onMounted(fetchTokens);

  return {
    accessTokens,
    conditionallyPushUserToConfirmEmail,
    handleCreatedToken,
    handleDeleteToken,
  };
};
