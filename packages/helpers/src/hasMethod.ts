type FlattenedValue = string | string[];

function has<
  T extends string,
  Obj extends Record<string, unknown> = Record<string, unknown>,
>(
  el: unknown,
  method: T,
  type: string,
): el is Obj {
  return (
    typeof el === "object" &&
    el !== null &&
    method in el &&
    typeof (el as Record<string, unknown>)[method] === type
  );
}

/**
 *  Determines if an object has a method of a specific type in a type-safe way.
 */
export function hasMethod<
  T extends string,
  Obj extends Record<string, unknown> = Record<string, unknown>
>(
  el: unknown,
  method: T
): el is Obj {
  return has(el, method, "function");
}

/**
 * Determines if an object has a property of a specific type in a type-safe way.
 */
export function hasProperty<
  T extends string,
  Obj extends Record<string, unknown> = Record<string, unknown>
>(
  el: unknown,
  method: T
): el is Obj {
  return has(el, method, "string");
};


/**
 * Recursively flattens a nested object into dot notation,
 * stopping at a specific key (default "_errors").
 *
 * @example
 * ```ts
 * const dataToFlatten = {a: [{ b: [{ _errors: ["Error"] }] }]};
 * const output = flattenObjectToDotNotationWithArrayAndStopAtKey(dataToFlatten);
 * return output === {
 *  "a.0.b.0": ["Error"]
 * };
 * ```
 */
export const flattenObjectToDotNotationWithArrayAndStopAtKey = (
  obj: unknown,
  parentKey = "",
  result: Record<string, FlattenedValue> = {},
  stopKey = "_errors"
): Record<string, FlattenedValue> => {
  if (typeof obj !== "object" || obj === null) {
    return result;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      const newKey = parentKey ? `${parentKey}.${idx}` : `${idx}`;
      flattenObjectToDotNotationWithArrayAndStopAtKey(item, newKey, result, stopKey);
    });
    return result;
  }

  for (const key of Object.keys(obj)) {
    const value = (obj as Record<string, unknown>)[key];
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (key === stopKey) {
      result[parentKey] = value as FlattenedValue;
      // Stop further flattening at this branch
      return result;
    } else if (typeof value === "object" && value !== null) {
      flattenObjectToDotNotationWithArrayAndStopAtKey(value, newKey, result, stopKey);
    }
    else {
      result[newKey] = value as FlattenedValue;
    }
  }

  return result;
}
