<script setup lang="ts">
import { computed, ref } from "vue";
import BaseForm from "./BaseForm.vue";

import axios from "axios";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import { formatMinutes } from "@/helpers/relativeTime";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import BaseButton from "@/components/BaseButton.vue";
import { useOptionalRedirectSelector } from "@/composables/useOptionalRedirectSelector";

const props = defineProps({
  /** If the form should autofocus */
  redirectId: {
    type: String,
    required: false,
  },
});

const isLoading = ref(false);

const baseFormRef = ref();

const $bus = useEventsBus();

const emit = defineEmits(["success"]);

const scanType = ref("successful");
const condition = ref(">");
const targetNumber = ref(10);
const timeDuration = ref(60);
const timeUnit = ref("minutes");

const timeDurationInMinutes = computed(() => {
  switch (timeUnit.value) {
    case "minutes":
      return timeDuration.value;
    case "hours":
      return timeDuration.value * 60;
    case "days":
      return timeDuration.value * 60 * 24;

    default:
      return timeDuration.value;
  }
});

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  isLoading.value = true;

  const response = await axios
    .post("/api/v1/alerts", {
      redirect_uuid: activeRedirectId.value,
      type: scanType.value,
      condition: condition.value,
      target: targetNumber.value,
      time_window: timeDurationInMinutes.value,
    })
    .catch((error) => {
      // If the error is not a validation error, show a generic error message
      if (!error.response || error.response.status !== 422)
        alert("An error occurred. Please try again later.");

      return error.response;
    });

  if (response?.status === 201) {
    // Emit the updated event with the changed fields
    emit("success");
    baseFormRef.value.setSuccessOnInputs();
    // modal.value.closeModal();
    $bus.$emit(eventTypes.created_alert);
  } else if (typeof response === "object") {
    // Show the fields with errors
    baseFormRef.value.setInputErrors(response.data.errors);
  }

  isLoading.value = false;
};

/** Refactor to not create a new instance each time */
const localeTime = computed(() => {
  return formatMinutes(timeDurationInMinutes.value);
});

const { RedirectSelector, activeRedirectId } =
  useOptionalRedirectSelector(props);
</script>

<template>
  <base-form
    ref="baseFormRef"
    @submit="submitForm"
    :disabled="!activeRedirectId"
  >
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->
    <template v-if="!redirectId">
      <label for="redirect_id">{{ $t("Magic link") }}</label>
      <redirect-selector
        :modelValue="activeRedirectId ? [activeRedirectId] : []"
        @update:modelValue="$event[0] ? (activeRedirectId = $event[0]) : null"
      ></redirect-selector>
    </template>

    <!-- Choose Scan Type -->
    <label for="scan_type">{{ $t("Scan Type") }}</label>
    <select id="scan_type" name="scan_type" required v-model="scanType">
      <option value="successful">{{ $t("Successful Scans") }}</option>
      <option value="failed">{{ $t("Failed Scans") }}</option>
      <option value="all">{{ $t("All Scans") }}</option>
    </select>

    <!-- Choose Condition (Above or Below Target) -->
    <label for="condition">{{ $t("Condition") }}</label>
    <select id="condition" name="condition" required v-model="condition">
      <option value=">">{{ $t(">") }}</option>
      <option value="<">{{ $t("<") }}</option>
    </select>

    <!-- Set Target Number -->
    <label for="target_number">{{ $t("Target Scans") }}</label>
    <input
      type="number"
      id="target_number"
      name="target_number"
      required
      v-model="targetNumber"
      min="1"
    />

    <!-- Set Time Window -->
    <label for="time_duration">{{ $t("Time Window") }}</label>
    <fieldset role="group">
      <input
        type="number"
        id="time_duration"
        name="time_duration"
        required
        aria-describedby="time_window_helper"
        v-model="timeDuration"
        min="1"
      />

      <!-- Choose Time Unit -->
      <label for="time_unit" style="display: none">{{}}</label>
      <select
        id="time_unit"
        name="time_unit"
        required
        aria-describedby="time_window_helper"
        v-model="timeUnit"
        :aria-label="$t('Unit of Time')"
      >
        <option value="minutes">{{ $t("Minutes") }}</option>
        <option value="hours">{{ $t("Hours") }}</option>
        <option value="days">{{ $t("Days") }}</option>
      </select>
    </fieldset>

    <!-- Helper text to explain the purpose -->
    <small id="time_window_helper" style="display: block; margin-top: 8px">
      {{
        $t(
          "If in the last {time} {more/less} {count} {type} scans occur, trigger the alert",
          [
            localeTime,
            $t(condition).toLowerCase(),
            targetNumber,
            scanType === "all" ? $t("total") : $t(scanType.toLowerCase()),
          ]
        )
      }}
    </small>
    <template #submit="{ disabled, isLoading, submitText }">
      <confirms-gate
        :title="$t('Enable alerts')"
        @confirmed="submitForm"
        :description="
          $t(
            'Additional destinations and design changes are free after you subscribe.'
          )
        "
        :allowBackgroundClickToClose="false"
        :gate="[
          'confirmedEmailOrPhone',
          {
            name: 'subscribedRedirect',
            options: {
              redirectId: activeRedirectId,
              title: $t('Enable alerts'),
              submitText: $t('Enable alerts'),
            },
          },
        ]"
      >
        <base-button
          class="full-width"
          :disabled="disabled"
          :aria-busy="isLoading"
          type="submit"
        >
          {{ $t(submitText) }}</base-button
        >
      </confirms-gate>
    </template>
    <!-- </TransitionGroup> -->
  </base-form>
</template>
