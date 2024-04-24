<script lang="ts" setup>
import { useRules } from "@/useRules";
import DropdownSelect from "@/components/DropdownSelect.vue";
import { computed, onMounted, toRef, watch } from "vue";
import type { RuleModel, Rules } from "@/types/rule";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { type PropType, nextTick } from "vue";

const props = defineProps({
  /** The model value, which is an object that contains the ruleName, selectedOperator, and selectedValue */
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
  return Object.keys(rules.value).map((key: string) => {
    const ruleKey = key as keyof Rules; // Cast 'key' to keyof Rules
    return {
      id: ruleKey,
      value: ruleKey,
      render: t("Rules." + ruleKey + ".Name", rules.value[ruleKey].name),
      raw: {
        description: t(
          "Rules." + ruleKey + ".Description",
          rules.value[ruleKey].description
        ),
      },
    };
  });
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
    selectedRuleKey: props.modelValue.selectedRuleKey,
    selectedOperator: operator,
    selectedValue: props.modelValue.selectedValue,
  });
};

const handleRuleChange = async (ruleKey: keyof Rules) => {
  emit("update:modelValue", {
    selectedRuleKey: ruleKey,
    selectedOperator: props.modelValue.selectedOperator,
    selectedValue: props.modelValue.selectedValue,
  });

  isOpenRuleSelector.value = false;

  await nextTick();
  // If the operator is not set, set the first operator by default
  if (
    !props.modelValue.selectedOperator ||
    !allowedOperators.value.includes(props.modelValue.selectedOperator)
  ) {
    handleOperatorChange(allowedOperators.value[0]);
  }

  focusOnInput();
};

const handleValueChange = (newValue: RuleModel["selectedValue"]) => {
  emit("update:modelValue", {
    selectedRuleKey: props.modelValue.selectedRuleKey,
    selectedOperator: props.modelValue.selectedOperator,
    selectedValue: newValue,
  });
};

onMounted(() => {
  if (!props.modelValue.selectedRuleKey) {
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
</script>
<template>
  <dropdown-select
    :options="ruleOptions"
    v-model:isOpen="isOpenRuleSelector"
    v-model:search="ruleSelectorSearchTerm"
    :placeholder="$t('Rule')"
    :modelValue="
      modelValue.selectedRuleKey ? [modelValue.selectedRuleKey] : undefined
    "
    @update:modelValue="handleRuleChange($event[0] as keyof Rules)"
    :aria-busy="isLoading"
    :required="required"
    :showSelectedFirst="true"
    searchable
    :autofocus="true"
    name="rule"
  >
    <template #optionSlot="{ option, updateModelValue }">
      <label>
        <input
          type="radio"
          :checked="modelValue.selectedRuleKey === option.id"
          @click="updateModelValue"
          :disabled="isLoading"
          :value="option.id"
          tabindex="0"
        />
        {{ option.render }}
        <small class="helptext">{{ option.raw.description }}</small>
      </label>
    </template>
  </dropdown-select>
  <!-- <small v-if="errors?.rule" class="error">
    {{ errors.rule }}
  </small> -->

  <select
    v-show="selectedRule"
    :value="modelValue.selectedOperator"
    @change="handleOperatorChange(($event.target as HTMLSelectElement).value)"
    :placeholder="$t('Operator')"
    ref="operatorInput"
    name="operator"
    :required="required"
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
      :options="
        formattedAllowedValues.map((value) => {
          return {
            id: value.key,
            render: value.value,
          };
        })
      "
      :modelValue="
        modelValue.selectedValue ? [modelValue.selectedValue] : undefined
      "
      @update:modelValue="
        handleValueChange($event[0] as RuleModel['selectedValue']);
        isOpenValueSelector = false;
        valueSelectorSearchTerm = '';
        $emit('valueSelected', $event[0] as string);
      "
      :placeholder="$t('Value')"
      :aria-busy="isLoading"
      v-model:is-open="isOpenValueSelector"
      :searchable="formattedAllowedValues.length > 5"
      v-model:search="valueSelectorSearchTerm"
      ref="valueInput"
      :showSelectedFirst="true"
      autofocus
      name="value"
      :required="required"
    >
    </dropdown-select>
  </template>
  <template v-else-if="selectedRule?.valueType === 'checkbox'">
    <label>
      <input
        type="checkbox"
        :value="modelValue.selectedValue"
        @change="
          handleValueChange(
            ($event.target as HTMLInputElement).checked ? 'true' : 'false'
          )
        "
        :disabled="isLoading"
        name="value"
        ref="valueInput"
      />
      {{ $t("Is true") }}
    </label>
    <!-- <small v-if="errors?.value" class="error">
      {{ errors.value }}
    </small> -->
  </template>
  <template v-else-if="selectedRule && modelValue.selectedOperator">
    <input
      :value="modelValue.selectedValue"
      @input="handleValueChange(($event.target as HTMLInputElement).value)"
      :type="selectedRule.valueType"
      :placeholder="$t('Value')"
      ref="valueInput"
      :pattern="allowedInputPattern"
      id="valueInputId"
      :list="selectedRule.value + '-datalist'"
      autofocus
      name="value"
      :required="required"
    />
  </template>

  <!-- <small v-if="errors?.value" class="error">
    {{ errors.value }}
  </small> -->
  <small
    v-else-if="
      selectedRule?.value &&
      modelValue.selectedOperator &&
      userWouldPass !== null
    "
  >
    {{ $t("Your value is valid.") }}
    <span :data-tooltip="$t('Your value is', [selectedRule?.value])">
      {{
        $t(
          userWouldPass
            ? "You would pass this rule"
            : "You would not pass this rule"
        )
      }}
    </span>
  </small>
  <small v-else-if="!modelValue.selectedRuleKey">
    {{ $t("Please select a rule") }}
  </small>
  <small v-else-if="!modelValue.selectedOperator">
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
    ></option>
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
