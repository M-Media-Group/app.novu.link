import { type Ref, computed, ref, watchEffect } from "vue";
import type {
  CommonRuleProperties,
  RuleGroup,
  RuleModel,
  Rules,
} from "@/types/rule";
import { debounce } from "@/helpers/debounce";
import axios from "axios";
import i18n from "@/locales/i18n";

const rules = ref({} as Rules);

const isLoading = ref(false);

const t = i18n.global.t;

const getAllRules = async (redirectId?: string) => {
  isLoading.value = true;

  const endpoint = redirectId
    ? `/api/v1/rules?redirectId=${redirectId}`
    : "/api/v1/rules";

  // We need to unset the default accept-language header just for this request - so that it uses the default language provided by the browser and our language rule can be checked correctly
  const response = await axios.get(endpoint, {
    transformRequest: [
      (data, headers) => {
        delete headers["Accept-Language"];
        return data;
      },
    ],
  });

  isLoading.value = false;

  rules.value = response.data as Rules;
};

/**
 * Call /rules/{name}/test to test a rule and get the users value
 * @param ruleName
 * @param operator
 * @param value
 * @param redirectId
 * @returns
 */
const testRule = async (
  ruleName?: keyof Rules,
  operator?: string,
  value?: string,
  redirectId?: string
) => {
  // If not all data is set, return an error
  if (!ruleName || !operator || !value) {
    throw new Error("Missing data to test rule");
  }

  const url =
    `/api/v1/rules/${ruleName}/test?operator=${operator}&value=${value}` +
    (redirectId ? `&redirectId=${redirectId}` : "");

  // We need to unset the default accept-language header just for this request - so that it uses the default language provided by the browser and our language rule can be checked correctly. Because its a post request to `api/v1/rules/${ruleName}/test?operator=${operator}&value=${value}`, we need to set the headers in the data object
  const response = await axios
    .post(
      url,
      {},
      {
        transformRequest: [
          (data, headers) => {
            delete headers["Accept-Language"];
            return data;
          },
        ],
      }
    )
    // Catch and pass 422 errors
    .catch((error) => {
      if (error.response.status === 422) {
        throw error.response.data;
      }

      throw error;
    });

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
export function parseRuleGroup(ruleGroup: RuleGroup) {
  return ruleGroup.rules.map((rule) => {
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
      modelData?.value?.selectedValue,
      redirectId?.value
    )
      .then((passes) => {
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
      modelData?.value?.selectedValue
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
