import { type Ref, computed, ref, watchEffect } from "vue";
import type { CommonRuleProperties, RuleModel, Rules } from "@/types/rule";
import { debounce } from "@/helpers/debounce";
import axios from "axios";

const rules = ref({} as Rules);

const isLoading = ref(false);

const getAllRules = async (redirectId?: string) => {
  isLoading.value = true;

  const endpoint = redirectId
    ? `api/v1/rules?redirectId=${redirectId}`
    : "api/v1/rules";

  const response = await axios.get(endpoint);

  isLoading.value = false;

  rules.value = response.data as Rules;
};

/**
 * Call /rules/{name}/test to test a rule and get the users value
 * @param ruleName
 * @param operator
 * @param value
 * @returns
 */
const testRule = async (
  ruleName?: keyof Rules,
  operator?: string,
  value?: string
) => {
  // If not all data is set, return an error
  if (!ruleName || !operator || !value) {
    throw new Error("Missing data to test rule");
  }

  // Set a header for Accept to application/json
  const headers = new Headers();
  headers.append("Accept", "application/json");

  const response = await axios.post(
    `api/v1/rules/${ruleName}/test?operator=${operator}&value=${value}`
  );

  const data = response.data as { passes: boolean };

  return data?.passes ?? false;
};

/**
 * Format allowedValues. They may come in as null, an array, or a record. If its a record, the key is the value and the value is the description/text to display
 *
 * @param ruleName
 * @returns { key: string, value: string }[]
 */
const formatAllowedValues = (
  allowedValues: CommonRuleProperties["allowedValues"]
) => {
  if (!allowedValues) {
    return [];
  }

  if (Array.isArray(allowedValues)) {
    return allowedValues.map((value) => ({ key: value, value }));
  }

  return Object.entries(allowedValues).map(([key, value]) => ({
    key,
    value: value as string,
  }));
};

const getAllowedOperatorForRule = (ruleName: keyof Rules) => {
  if (!rules.value[ruleName]) {
    return [];
  }
  return rules.value[ruleName].allowedOperators;
};

export function useRules(
  modelData?: Ref<RuleModel>,
  redirectId?: Ref<string | undefined>
) {
  // Get all rules on load
  getAllRules(redirectId?.value);

  const selectedRule = computed(() => {
    if (!modelData?.value?.selectedRuleKey) {
      return null;
    }
    return rules.value[modelData?.value?.selectedRuleKey];
  });

  const allowedOperators = computed(() => {
    if (!modelData?.value?.selectedRuleKey) {
      return [];
    }
    return getAllowedOperatorForRule(modelData?.value?.selectedRuleKey);
  });

  const userWouldPass = ref(null as boolean | null);

  const debounceTestRule = debounce(() => {
    if (
      !modelData?.value?.selectedRuleKey ||
      !modelData?.value?.selectedOperator ||
      !modelData?.value?.selectedValue
    ) {
      return;
    }
    testRule(
      modelData?.value?.selectedRuleKey as keyof Rules,
      modelData?.value?.selectedOperator,
      modelData?.value?.selectedValue
    ).then((passes) => {
      userWouldPass.value = passes;
    });
  }, 500);

  // Compute the allowed keyboard input pattern. If the rule is a number, only allow numbers
  const allowedInputPattern = computed(() => {
    if (!selectedRule.value) {
      return undefined;
    }

    if (selectedRule.value.valueType === "number") {
      return "\\d*";
    }

    return undefined;
  });

  const formattedAllowedValues = computed(() => {
    return formatAllowedValues(selectedRule.value?.allowedValues);
  });

  // Compute if the value is valid. If the rule is a number, only allow numbers. If the rule has allowed values, only allow those values
  const isValidValue = computed(() => {
    if (!selectedRule.value || !modelData?.value?.selectedValue) {
      return false;
    }

    if (
      formattedAllowedValues.value.length > 0 &&
      !formattedAllowedValues.value.some(
        (allowedValue) => allowedValue.key == modelData?.value?.selectedValue
      )
    ) {
      return false;
    }

    if (selectedRule.value.valueType === "number") {
      return /^\d*$/.test(modelData?.value?.selectedValue ?? "");
    }

    return true;
  });

  watchEffect(() => {
    if (
      selectedRule.value &&
      modelData?.value?.selectedOperator &&
      modelData?.value?.selectedValue &&
      isValidValue.value
    ) {
      debounceTestRule();
    } else {
      userWouldPass.value = null;
    }
  });

  return {
    rules,
    allowedOperators,
    selectedRule,
    userWouldPass,
    isLoading,
    allowedInputPattern,
    isValidValue,
    formattedAllowedValues,
  };
}
