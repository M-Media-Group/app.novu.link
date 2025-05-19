import { type Ref, computed, onMounted, ref, watchEffect } from "vue";
import type { CommonRuleProperties, RuleModel, Rules } from "@novulink/types";
import { debounce } from "@/helpers/debounce";
import i18n from "@/locales/i18n";
import { assertIsUnifiedError } from "./services/api/apiServiceErrorHandler";
import { getRules, testRule } from "./repositories/rule/ruleRepository";

const rules = ref<Partial<Rules> | null>(null);

const isLoading = ref(false);

const t = i18n.global.t;

const getAllRules = async (redirectId?: string) => {
  try {
    const response = await getRules({
      redirectId,
    });
    if (!response || response === undefined) {
      return;
    }
    rules.value = response as Rules;
  } catch (error) {
    assertIsUnifiedError(error);
    alert(error.message);
    return error.originalError;
  }
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
    return allowedValues.map((value) => ({ key: value, value: t(value) }));
  }

  return Object.entries(allowedValues).map(([key, value]) => ({
    key,
    value: t(value),
  }));
};

const getAllowedOperatorForRule = (ruleName: keyof Rules) => {
  if (!rules.value?.[ruleName]) {
    return [];
  }
  return rules.value[ruleName].allowedOperators;
};

/**
 * Takes a JSON data rule and parses it into something human readable.
 *
 * Here is an example input:
 * "rule_groups": [
                {
                    "id": 120,
                    "name": null,
                    "match_all": 0,
                    "endpoint_id": 319,
                    "created_at": "2024-04-21T10:40:12.000000Z",
                    "updated_at": "2024-04-21T10:40:12.000000Z",
                    "rules": [
                        {
                            "id": 120,
                            "rule_group_id": 120,
                            "rule": "browser_language",
                            "operator": "contains",
                            "value": "af",
                            "created_at": "2024-04-21T10:40:12.000000Z",
                            "updated_at": "2024-04-21T10:40:12.000000Z"
                        }
                    ]
                }
            ],
 *
 */
export function parseRuleGroup(rules: RuleModel[]) {
  return rules.map((rule) => {
    if (!rule.rule || !rule.operator || !rule.value) {
      return "";
    }
    const ruleName = t("Rules." + rule.rule + ".Name", rule.rule);
    const operatorName = t(rule.operator).toLocaleLowerCase();
    return `${ruleName} ${operatorName} ${rule.value}`;
  });
}

export function useRules(
  modelData?: Ref<RuleModel>,
  redirectId?: Ref<string | undefined>
) {
  // Get all rules on load
  onMounted(() => {
    getAllRules(redirectId?.value);
  });

  const selectedRule = computed(() => {
    if (!modelData?.value?.rule) {
      return null;
    }
    return rules.value?.[modelData?.value?.rule];
  });

  const allowedOperators = computed(() => {
    if (!modelData?.value?.rule) {
      return [];
    }
    return getAllowedOperatorForRule(modelData?.value?.rule);
  });

  const userWouldPass = ref(null as boolean | null);

  const debounceTestRule = debounce(() => {
    testRule({
      ...modelData?.value,
      redirectId: redirectId?.value,
    })
      .then(({ passes }) => {
        userWouldPass.value = passes;
      })
      // Catch any errors and set the error message
      .catch((error) => {
        console.log(error);
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
    if (!selectedRule.value || !modelData?.value?.value) {
      return false;
    }

    if (
      formattedAllowedValues.value.length > 0 &&
      !formattedAllowedValues.value.some(
        (allowedValue) => allowedValue.key == modelData?.value?.value
      )
    ) {
      return false;
    }

    if (selectedRule.value.valueType === "number") {
      return /^\d*$/.test(modelData?.value?.value ?? "");
    }

    return true;
  });

  watchEffect(() => {
    if (
      selectedRule.value &&
      modelData?.value?.operator &&
      modelData?.value?.value
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
    parseRuleGroup,
  };
}
