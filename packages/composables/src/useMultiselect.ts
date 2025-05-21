import { normaliseOptions } from "@novulink/helpers/normaliseOptions";
import type {
  NormalisedOptionObject,
  PossibleRecord,
  SelectOption,
  SelectOptionObject,
} from "@novulink/types";
import { computed, toRaw } from "vue";

export interface RequiredProps<T extends PossibleRecord> {
  options: SelectOption<T>[];
  displayKey: keyof NormalisedOptionObject<SelectOptionObject<T>>;
  modelValue: string[];
  modelKey: keyof NormalisedOptionObject<SelectOptionObject<T>>;
  multiple: boolean;
}

export type RequiredEmits = (
  evt: "update:modelValue",
  args_0: string[]
) => void;

/**
 * A composable for a multiselect component
 */
export function useMultiselect<T extends PossibleRecord>(
  props: RequiredProps<T>,
  emit: RequiredEmits
) {
  type Normalised = NormalisedOptionObject<SelectOptionObject<T>>;

  const normalisedOptions = computed<Normalised[]>(() => {
    return normaliseOptions(toRaw(props.options));
  });

  const selectableOptions = computed(() =>
    normalisedOptions.value.filter((option) => !option.disabled)
  );

  const getLabel = (option: Normalised): string => {
    const value = option[props.displayKey];
    return typeof value === "string" ? value : value?.toString() ?? "";
  };

  const updateModelValue = (
    newValue: string | null,
    valueSelected = true,
    existingValueIndex: number | false = false
  ) => {
    if (!newValue) return;

    if ((!props.modelValue || !props.multiple) && valueSelected) {
      emit("update:modelValue", [newValue]);
      return;
    }

    let newValues: string[];

    if (existingValueIndex !== false) {
      newValues = [...props.modelValue];
      newValues[existingValueIndex] = newValue;
    } else {
      newValues = props.modelValue.includes(newValue)
        ? props.modelValue.filter((id) => id !== newValue)
        : [...props.modelValue, newValue];
    }

    emit("update:modelValue", newValues);
  };

  const isOptionSelected = (option: Normalised): boolean => {
    return props.modelValue.includes(String(option[props.modelKey]));
  };

  const selectAllOptions = () => {
    const allIds = selectableOptions.value.map((option) =>
      String(option[props.modelKey])
    );
    emit("update:modelValue", allIds);
  };

  const unselectAllOptions = () => {
    emit("update:modelValue", []);
  };

  const toggleAllOptions = () => {
    if (props.modelValue.length === selectableOptions.value.length) {
      return unselectAllOptions();
    }
    return selectAllOptions();
  };

  return {
    normalisedOptions,
    selectableOptions,
    getLabel,
    updateModelValue,
    isOptionSelected,
    selectAllOptions,
    unselectAllOptions,
    toggleAllOptions,
  };
}
