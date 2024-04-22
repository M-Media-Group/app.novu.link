<script setup lang="ts">
import { useTeamStore } from "@/stores/team";
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";

const teamStore = useTeamStore();

const name = ref(teamStore.activeTeam?.name);

const baseFormRef = ref();

const emit = defineEmits(["updated"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!name.value || !teamStore.activeTeam?.id) {
    return;
  }

  // Create an object containing only the changed values
  const changedValues = {} as Record<string, string>;
  if (teamStore.activeTeam?.name !== name.value) {
    changedValues.name = name.value;
  }

  // If there are no changed values, return
  if (Object.keys(changedValues).length === 0) {
    baseFormRef.value.setSuccessOnInputs();
    return;
  }

  const response = await teamStore.update({
    id: teamStore.activeTeam?.id,
    name: name.value,
  });

  if (response === true) {
    // Emit the updated event with the changed fields
    emit("updated", changedValues);
    baseFormRef.value.setSuccessOnInputs();
  } else if (typeof response === "object") {
    // We want to show the user the correct fields to the user so they feel better
    baseFormRef.value.setSuccessOnInputs();

    // Show the fields with errors
    // baseFormRef.value.setInputErrors(response.data.errors);
  }
};
</script>

<template>
  <base-form ref="baseFormRef" @submit="submitForm" submitText="Save">
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <label for="name">{{ $t("Team Name") }}</label>
    <input
      type="text"
      id="name"
      name="name"
      :placeholder="$t('Team Name')"
      v-model="name"
      minlength="2"
      pattern=".{2,}"
      autofocus
      required
    />
    <!-- </TransitionGroup> -->
  </base-form>
</template>
