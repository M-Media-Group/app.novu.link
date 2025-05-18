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
