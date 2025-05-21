import type { NormalisedOptionObject, PossibleRecord, SelectOption, SelectOptionObject } from "@novulink/types";

/** Since we support either a callback or a string, we need to normalize the options to always have a render function */
export const normaliseOptions = <T extends PossibleRecord>(
  options?: SelectOption<T>[]
): NormalisedOptionObject<SelectOptionObject<T>>[] => {
  if (!options) return [];

  // We will use a straight for loop for performance
  const normalisedOptions: NormalisedOptionObject<SelectOptionObject<T>>[] = [];
  for (const option of options) {
    if (typeof option === "string") {
      normalisedOptions.push({
        id: option,
        render: option,
      });
      continue;
    }
    normalisedOptions.push({
      id: option.id.toString(),
      render: option.render,
      disabled: option.disabled || false,
      raw: option.raw,
      badge: option.badge,
    });
  }
  return normalisedOptions;
};

/**
 * Filter options by a given search string and key
 */
export const filterOptions = <T extends PossibleRecord>(
  options: NormalisedOptionObject<SelectOptionObject<T>>[],
  value: string,
  key: keyof NormalisedOptionObject<SelectOptionObject<T>> = "render"
): NormalisedOptionObject<SelectOptionObject<T>>[] => {
  if (!value.trim() || key === "raw") {
    return options;
  }

  const lowercaseValue = value.toLowerCase();

  return options.filter((option) => {
    const fieldValue = option[key];

    if (fieldValue == null) return false;

    if (typeof fieldValue === "string") {
      return fieldValue.toLowerCase().includes(lowercaseValue);
    }

    return fieldValue.toString().toLowerCase().includes(lowercaseValue);
  });
};

/**
 * Orders options by placing selected ones first, preserving original order otherwise
 */
export const orderOptionsBySelectedFirst = <T extends PossibleRecord>(
  options: NormalisedOptionObject<SelectOptionObject<T>>[],
  selected: string[],
  key: keyof NormalisedOptionObject<SelectOptionObject<T>> = "render"
): NormalisedOptionObject<SelectOptionObject<T>>[] => {
  if (selected.length === 0) return [...options];

  const selectedSet = new Set(selected);

  return [...options].sort((a, b) => {
    const aSelected = selectedSet.has(String(a[key]));
    const bSelected = selectedSet.has(String(b[key]));

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });
};

/**
 * Computes the tab options from data
 * @param featuresByGroupData
 * @returns
 */
export const computeTabOptions = <T extends PossibleRecord>(data: T[]): SelectOption<T>[] => {
  return data.map((item) => ({
    render: item?.name as string,
    id: item?.id as number,
  }));
};