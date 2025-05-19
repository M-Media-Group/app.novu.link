export const hasMethod = (
  el: unknown,
  method: string = "setCustomValidity"
): el is { setCustomValidity: (message: string) => void } => {
  return (
    typeof el === "object" &&
    el !== null &&
    method in el &&
    typeof (el as any)[method] === "function"
  );
};

export const hasProperty = (
  el: unknown,
  property: string = "validationMessage"
): el is { validationMessage: string } => {
  return (
    typeof el === "object" &&
    el !== null &&
    property in el &&
    typeof (el as any)[property] === "string"
  );
};

export const flattenObjectToDotNotation = (
  obj: Record<string, any>,
  parentKey: string = "",
  result: Record<string, any> = {}
): Record<string, string | string[]> => {
  for (const key in obj) {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenObjectToDotNotation(obj[key], newKey, result);
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
};

/**
 * Same as above, but allows the value to be an array
 *
 */
export const flattenObjectToDotNotationWithArray = (
  obj: Record<string, any>,
  parentKey: string = "",
  result: Record<string, any> = {}
): Record<string, string | string[]> => {
  for (const key in obj) {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (Array.isArray(obj[key])) {
      result[newKey] = obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenObjectToDotNotationWithArray(obj[key], newKey, result);
    } else {
      result[newKey] = obj[key];
    }
  }

  return result;
};

/**
 * Same as above, but stops at a certain key. By default its _errors
 *
 * e.g. where the above would return "a.0.b.0._errors", this would return "a.0.b.0"
 *
 */
export const flattenObjectToDotNotationWithArrayAndStopAtKey = (
  obj: Record<string, any>,
  parentKey: string = "",
  result: Record<string, any> = {},
  stopKey: string = "_errors"
): Record<string, string | string[]> => {
  for (const key in obj) {
    if (key === stopKey) {
      result[parentKey] = obj[key];
      continue;
    }

    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(obj[key])) {
      result[newKey] = obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenObjectToDotNotationWithArrayAndStopAtKey(
        obj[key],
        newKey,
        result,
        stopKey
      );
    } else {
      result[newKey] = obj[key];
    }
  }

  return result;
};
