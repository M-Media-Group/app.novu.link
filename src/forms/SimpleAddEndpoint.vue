<script setup lang="ts">
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";
import RuleSelector from "@/components/RuleSelector.vue";
import type { RuleModel } from "@/types/rule";
import { debounce } from "@/helpers/debounce";
import axios from "axios";
import { useI18n } from "vue-i18n";
import ConfirmsSubscriptionStart from "@/components/modals/ConfirmsSubscriptionStart.vue";

import BaseButton from "@/components/BaseButton.vue";

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
  /** If creating the endpoint will start a subscription */
  isSubscribable: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const { t } = useI18n();

// url, password, and remember me
const url = ref(null as string | null);
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
  if (props.isSubscribable) {
    subscriptionStartRef.value.startConfirming();
  } else {
    submitForm();
  }
};

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (
    !ruleData.value.selectedRuleKey ||
    !url.value ||
    !ruleData.value.selectedOperator ||
    !ruleData.value.selectedValue ||
    !props.redirectId
  ) {
    return;
  }

  isLoading.value = true;

  const response = await axios
    .post(`/api/v1/redirects/${props.redirectId}/endpoints`, {
      endpoint: url.value,
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
    })
    .catch((error) => {
      alert(t("An error occurred. Please try again later."));
      return error.response;
    });

  // If the response is a 201, emit the updated event
  if (!response) {
    isLoading.value = false;
    return;
  }

  if (response.status === 201) {
    // Emit the updated event with the changed fields
    emit("success");
    baseFormRef.value.setSuccessOnInputs();
  } else if (typeof response === "object") {
    // We want to show the user the correct fields to the user so they feel better
    baseFormRef.value.setSuccessOnInputs();

    // Show the fields with errors
    baseFormRef.value.setInputErrors(response.data.errors);
  }

  isLoading.value = false;
};

const focusOnUrl = () => {
  if (!urlInput.value) return;
  urlInput.value.focus();
};

const addProtocolIfMissing = () => {
  if (!url.value) return;
  if (!url.value.startsWith("http")) {
    url.value = "https://" + url.value;
  }
};

const debounceAddProtocolIfMissing = debounce(addProtocolIfMissing, 500);
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
  >
    <label for="rule">{{ $t("If") }}</label>
    <rule-selector
      id="rule"
      required
      v-model="ruleData"
      @valueSelected="focusOnUrl"
    ></rule-selector>
    <label for="url">{{ $t("Go to") }}</label>
    <input
      ref="urlInput"
      type="url"
      id="url"
      name="url"
      :placeholder="$t('url')"
      v-model="url"
      required
      @blur="addProtocolIfMissing"
      @input="debounceAddProtocolIfMissing"
    />
    <div v-if="fallbackUrl">
      {{ $t("Else fallback to", [fallbackUrl]) }}
    </div>
    <br />
    <!-- </TransitionGroup> -->

    <template
      #submit="{ disabled, isLoading, submitText }"
      v-if="isSubscribable"
    >
      <confirms-subscription-start
        ref="subscriptionStartRef"
        @confirmed="submitForm"
      >
        <template v-slot="{ isConfirming }">
          <base-button
            :disabled="disabled"
            type="submit"
            :aria-busy="isLoading || isConfirming"
          >
            {{ $t(submitText) }}
          </base-button>
        </template>
      </confirms-subscription-start>
    </template>
  </base-form>
</template>
