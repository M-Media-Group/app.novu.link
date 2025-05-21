<script lang="ts" setup>
import { useRules } from "@/useRules";
import DropdownSelect from "@/components/DropdownSelect.vue";
import { computed, onMounted, toRef, watch } from "vue";
import type { RuleModel, Rules } from "@novulink/types";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { type PropType, nextTick } from "vue";

const props = defineProps({
  /** The model value, which is an object that contains the ruleName, operator, and value */
  modelValue: {
    type: Object as PropType<RuleModel>,
    required: true,
  },
  /** The redirect ID */
  redirectId: {
    type: String,
    required: false,
  },

  /** The required flag */
  required: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const emit = defineEmits<{
  "update:modelValue": [RuleModel];
  valueSelected: [string];
}>();

const {
  rules,
  allowedOperators,
  selectedRule,

  isLoading,
  allowedInputPattern,
  isValidValue,
  formattedAllowedValues,
  userWouldPass,
} = useRules(
  toRef(() => props.modelValue),
  toRef(() => props.redirectId)
);

const { t } = useI18n();

const isOpenRuleSelector = ref(false);
const isOpenValueSelector = ref(false);

const ruleSelectorSearchTerm = ref("");
const valueSelectorSearchTerm = ref("");

const ruleOptions = computed(() => {
  if (!rules.value) return [];

  return Object.keys(rules.value)
    .map((key: string) => {
      const ruleKey = key as keyof Rules; // Cast 'key' to keyof Rules
      const rule = rules.value?.[ruleKey];
      if (!rule) return;
      return {
        id: ruleKey,
        value: ruleKey,
        render: t("Rules." + ruleKey + ".Name", rule.name),
        raw: {
          description: t("Rules." + ruleKey + ".Description", rule.description),
        },
      };
    })
    .filter((rule) => rule !== undefined);
});

const operatorInput = ref<HTMLInputElement>();
const valueInput = ref<HTMLInputElement>();

const focusOnInput = async () => {
  await nextTick();
  if (valueInput.value) {
    valueInput.value.focus();
  }
};

const handleOperatorChange = async (operator: string) => {
  emit("update:modelValue", {
    rule: props.modelValue.rule,
    operator: operator,
    value: props.modelValue.value,
  });
};

const handleRuleChange = async (ruleKey: keyof Rules) => {
  emit("update:modelValue", {
    rule: ruleKey,
    operator: props.modelValue.operator,
    value: props.modelValue.value,
  });

  isOpenRuleSelector.value = false;

  await nextTick();
  // If the operator is not set, set the first operator by default
  if (
    !props.modelValue.operator ||
    !allowedOperators.value.includes(props.modelValue.operator)
  ) {
    handleOperatorChange(allowedOperators.value[0]);
  }

  focusOnInput();
};

const handleValueChange = (newValue: RuleModel["value"]) => {
  emit("update:modelValue", {
    rule: props.modelValue.rule,
    operator: props.modelValue.operator,
    value: newValue,
  });
};

onMounted(() => {
  if (!props.modelValue.rule) {
    isOpenRuleSelector.value = true;
  }
});

// Watch the isValidValue and set the input validity
watch(isValidValue, () => {
  if (isValidValue.value && valueInput.value) {
    valueInput.value?.setAttribute("aria-invalid", "false");
    valueInput.value?.setCustomValidity("");
  } else if (valueInput.value) {
    valueInput.value?.setAttribute("aria-invalid", "true");
    valueInput.value?.setCustomValidity(t("Please enter a valid value"));
  }
});

const handleSelect = async (event: string[]) => {
  handleValueChange(event[0] as RuleModel["value"]);
  isOpenValueSelector.value = false;
  valueSelectorSearchTerm.value = "";
  emit("valueSelected", event[0] as string);
};
</script>
<template>
  <dropdown-select
    v-model:is-open="isOpenRuleSelector"
    v-model:search="ruleSelectorSearchTerm"
    :options="ruleOptions"
    :placeholder="$t('Rule')"
    :model-value="modelValue.rule ? [modelValue.rule] : undefined"
    :aria-busy="isLoading"
    :required="required"
    :show-selected-first="true"
    searchable
    :autofocus="true"
    name="rule"
    @update:model-value="handleRuleChange($event[0] as keyof Rules)"
  >
    <template #optionSlot="{ option, updateModelValue }">
      <label>
        <input
          type="radio"
          :checked="modelValue.rule === option.id"
          :disabled="isLoading"
          :value="option.id"
          tabindex="0"
          @click="updateModelValue"
        >
        {{ option.render }}
        <small class="helptext">{{ option.raw?.description }}</small>
      </label>
    </template>
  </dropdown-select>

  <select
    v-show="selectedRule"
    ref="operatorInput"
    :value="modelValue.operator"
    :placeholder="$t('Operator')"
    name="operator"
    :required="required"
    aria-label="Operator"
    @change="handleOperatorChange(($event.target as HTMLSelectElement).value)"
  >
    <option
      v-for="operator in allowedOperators"
      :key="operator"
      :value="operator"
    >
      {{ $t(operator) }}
    </option>
  </select>

  <template
    v-if="
      selectedRule?.valueType === 'select' &&
        formattedAllowedValues &&
        formattedAllowedValues.length > 0
    "
  >
    <dropdown-select
      ref="valueInput"
      v-model:is-open="isOpenValueSelector"
      v-model:search="valueSelectorSearchTerm"
      :options="
        formattedAllowedValues.map((value) => {
          return {
            id: value.key,
            render: value.value,
          };
        })
      "
      :model-value="modelValue.value ? [modelValue.value] : undefined"
      :placeholder="$t('Value')"
      :aria-busy="isLoading"
      :searchable="formattedAllowedValues.length > 5"
      :show-selected-first="true"
      autofocus
      name="value"
      :required="required"
      @update:model-value="handleSelect"
    />
  </template>
  <template v-else-if="selectedRule?.valueType === 'checkbox'">
    <label>
      <input
        ref="valueInput"
        type="checkbox"
        :value="modelValue.value"
        :disabled="isLoading"
        name="value"
        @change="
          handleValueChange(
            ($event.target as HTMLInputElement).checked ? 'true' : 'false'
          )
        "
      >
      {{ $t("Is true") }}
    </label>
    <!-- <small v-if="errors?.value" class="error">
      {{ errors.value }}
    </small> -->
  </template>
  <template v-else-if="selectedRule && modelValue.operator">
    <input
      id="valueInputId"
      ref="valueInput"
      :value="modelValue.value"
      :type="selectedRule.valueType"
      :placeholder="$t('Value')"
      :pattern="allowedInputPattern"
      :list="selectedRule.value + '-datalist'"
      autofocus
      name="value"
      :required="required"
      @input="handleValueChange(($event.target as HTMLInputElement).value)"
    >
  </template>
  <small
    v-if="
      (selectedRule?.value || modelValue.value) &&
        modelValue.operator &&
        userWouldPass !== null
    "
  >
    {{ $t("Your value is valid.") }}
    <span :data-tooltip="$t('Your value is', [selectedRule?.value ?? 'N/A'])">
      {{
        $t(
          userWouldPass
            ? "You would pass this rule"
            : "You would not pass this rule"
        )
      }}
    </span>
  </small>
  <small v-else-if="!modelValue.rule">
    {{ $t("Please select a rule") }}
  </small>
  <small v-else-if="!modelValue.operator">
    {{ $t("Please select an operator") }}
  </small>
  <!-- <small v-else-if="errors?.operator" class="error">
    {{ errors.operator }}
  </small>
  <small v-else-if="errors?.rule" class="error">
    {{ errors.rule }}
  </small> -->
  <small v-else-if="!isValidValue">
    {{ $t("Please enter a valid value") }}
  </small>
  <small v-else>
    {{ $t("The value to test against") }}
  </small>
  <!-- If we have allowedValues, show them as suggestions using a datalist - this needs to be placed after the <small> helptext for the formatting defined in the CSS to work -->
  <datalist
    v-if="selectedRule?.value && formattedAllowedValues.length > 0"
    :id="selectedRule.value + '-datalist'"
  >
    <option
      v-for="allowedValue in formattedAllowedValues"
      :key="allowedValue.key"
      :value="allowedValue.key"
    />
  </datalist>
</template>
<style>
.helptext {
  margin: unset;
  margin-left: calc(var(--pico-form-element-spacing-horizontal) * 2);
}
small {
  width: fit-content;
}
</style>
