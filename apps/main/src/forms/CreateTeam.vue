<script setup lang="ts">
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { createTeam } from "@novulink/api";

const name = ref("");

const baseFormRef = ref();

const emit = defineEmits(["success"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!name.value) {
    return;
  }

  await createTeam({
    name: name.value,
  });
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    :submit-fn="submitForm"
    @success="emit('success')"
  >
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <label for="name">{{ $t("Team Name") }}</label>
    <input
      id="name"
      v-model="name"
      type="text"
      name="name"
      :placeholder="$t('Team Name')"
      minlength="2"
      pattern=".{2,}"
      autofocus
      required
    >
    <!-- </TransitionGroup> -->
  </base-form>
</template>
