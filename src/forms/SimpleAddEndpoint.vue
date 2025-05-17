<script setup lang="ts">
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";
import RuleSelector from "@/components/RuleSelector.vue";
import type { RuleModel } from "@/types/rule";
import { eventTypes, useEventsBus } from "@/eventBus/events";

import BaseButton from "@/components/BaseButton.vue";
import { removeProtocol } from "@/helpers/urlFormatter";
import { addRedirectEndpoint } from "@/useRedirects";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import { assertIsUnifiedError } from "@/services/apiServiceErrorHandler";
import { useUrlFormatter } from "@/composables/useDebouceProtocol";

const $bus = useEventsBus();

const props = defineProps({
  /** The redirect ID to add the endpoint for */
  redirectId: {
    type: String,
    required: true,
  },
  /** The fallback URL */
  fallbackUrl: {
    type: String,
    required: false,
  },
});

// url, password, and remember me
const urlInput = ref(null as HTMLInputElement | null);

const subscriptionStartRef = ref();

const isLoading = ref(false);

const ruleData = ref({
  selectedRuleKey: null,
  selectedOperator: null,
  selectedValue: null,
} as RuleModel);

const baseFormRef = ref();

const emit = defineEmits<{
  success: [];
}>();

const startConfirming = async () => {
  subscriptionStartRef.value.startConfirming();
};

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (
    !ruleData.value.selectedRuleKey ||
    !endpointUrl.value ||
    !ruleData.value.selectedOperator ||
    !ruleData.value.selectedValue ||
    !props.redirectId
  ) {
    return;
  }

  isLoading.value = true;

  try {
    await await addRedirectEndpoint(props.redirectId, {
      endpoint: endpointUrl.value,
      rule_groups: [
        {
          rules: [
            {
              rule: ruleData.value.selectedRuleKey,
              operator: ruleData.value.selectedOperator,
              value: ruleData.value.selectedValue,
            },
          ],
        },
      ],
    });
    emit("success");
    baseFormRef.value.setSuccessOnInputs();
    $bus.$emit(eventTypes.created_endpoint);
  } catch (error) {
    assertIsUnifiedError(error);
    // Format errors. We get them as rule_groups.0.rules.0.value - but since this is a simple form, we just need to get the last item after ., in this case its .value, and set it on the setErrors function
    const errors = {
      ...error.details,
    };

    // If response.data.errors["rule_groups.0.rules.0.value"], we set errors.value
    if (errors["rule_groups.0.rules.0.value"]) {
      errors.value = errors["rule_groups.0.rules.0.value"];
    }
    if (errors["rule_groups.0.rules.0.rule"]) {
      errors.rule = errors["rule_groups.0.rules.0.rule"];
    }
    if (errors["rule_groups.0.rules.0.operator"]) {
      errors.operator = errors["rule_groups.0.rules.0.operator"];
    }
    baseFormRef.value.setInputErrors(errors);
    return error.originalError;
  } finally {
    isLoading.value = false;
  }
};

const handleFailedConfirmation = () => {
  isLoading.value = false;
  baseFormRef.value.setSuccessOnInputs();
  baseFormRef.value.setInputErrors({
    endpoint: "Error",
  });
};

const focusOnUrl = () => {
  if (!urlInput.value) return;
  urlInput.value.focus();
};

const { endpointUrl, debounceAddProtocolIfMissing } = useUrlFormatter();
</script>

<template>
  <div v-if="!redirectId">
    {{ $t("Please select a redirect first") }}
  </div>

  <base-form
    v-else
    ref="baseFormRef"
    @submit="startConfirming"
    :isLoading="isLoading"
    :submitText="$t('Add destination to QR code')"
    :autofocus="false"
    :disabled="isLoading"
  >
    <label for="rule">{{ $t("If") }}</label>
    <rule-selector
      required
      v-model="ruleData"
      @valueSelected="focusOnUrl"
      :redirectId="props.redirectId"
    ></rule-selector>
    <label for="url">{{ $t("Go to") }}</label>
    <input
      ref="urlInput"
      type="url"
      inputmode="url"
      minlength="3"
      autocapitalize="none"
      name="endpoint"
      placeholder="https://test.com"
      data-hj-allow=""
      v-model="endpointUrl"
      required
      pattern="(https?://)?([a-z0-9\-]+\.)+[a-z]{2,}(:[0-9]+)?(/.*)?"
      @input="
        debounceAddProtocolIfMissing(($event.target as HTMLInputElement).value)
      "
    />
    <div v-if="fallbackUrl">
      {{ $t("Else fallback to", [removeProtocol(fallbackUrl)]) }}
    </div>
    <br />
    <!-- </TransitionGroup> -->

    <template #submit="{ disabled, isLoading, submitText }">
      <confirms-gate
        ref="subscriptionStartRef"
        @confirmed="submitForm"
        @failed="handleFailedConfirmation"
        :title="$t('Activate destination')"
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
              redirectId,
              title: $t('Activate destination'),
              submitText: $t('Subscribe and activate destination'),
            },
          },
        ]"
      >
        <base-button :disabled="disabled" type="submit" :aria-busy="isLoading">
          {{ $t(submitText) }}
        </base-button>
      </confirms-gate>
    </template>
  </base-form>
</template>
