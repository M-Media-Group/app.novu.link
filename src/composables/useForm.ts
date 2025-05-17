import { type Ref, ref } from "vue";
import {
  clearErrorMessageOnElement,
  setErrorMessageOnElement,
} from "./manipulateDom";

const supportedElements = [
  HTMLInputElement,
  HTMLSelectElement,
  HTMLTextAreaElement,
  HTMLFormElement,
  HTMLFieldSetElement,
] as const;

export type HTMLSupportedInputElement =
  (typeof supportedElements)[number] extends new (...args: any[]) => infer R
    ? R
    : never;

// A string for all possible HTML supported input elements
const HTMLSupportedInputElementStringForQuerySelector = supportedElements
  .map((element) => element.name)
  .join(", ");

const setErrorOnInput = (
  input: HTMLSupportedInputElement,
  error: string,
  report = true
) => {
  //   Use setValidity to set the error message
  input.setCustomValidity(error);
  input.setAttribute("aria-invalid", "true");
  if (report) {
    input.reportValidity();
  }
  setErrorMessageOnElement(input);
};

const setSuccessOnInput = (input: HTMLSupportedInputElement) => {
  input.setAttribute("aria-invalid", "false");
};

const removeSuccessOnInput = (input: HTMLSupportedInputElement) => {
  if (input.validity.valid) {
    input.removeAttribute("aria-invalid");
  }
};

const resetCustomValidityOnInput = (input: HTMLSupportedInputElement) => {
  input.setCustomValidity("");
  clearErrorMessageOnElement(input);
};

const isElementInFocus = (element: HTMLSupportedInputElement) => {
  return document.activeElement === element;
};

const focusOnFirstInput = (formElement: HTMLFormElement) => {
  const firstInput = formElement?.querySelector(
    HTMLSupportedInputElementStringForQuerySelector
  ) as HTMLSupportedInputElement;
  if (firstInput) {
    firstInput.focus();
  }
};

const focusOnFirstEmptyInput = (formElement: HTMLFormElement) => {
  const firstInput = formElement?.querySelectorAll(
    HTMLSupportedInputElementStringForQuerySelector
  ) as NodeListOf<HTMLSupportedInputElement>;
  if (firstInput) {
    for (let i = 0; i < firstInput.length; i++) {
      const element = firstInput[i];
      if (element instanceof HTMLFieldSetElement) {
        return;
      }
      if (!element.value) {
        element.focus();
        return;
      }
    }
  }
};

const callActionsOnAllInputs = (
  formElement: HTMLFormElement,
  callback: (element: HTMLSupportedInputElement) => void
) => {
  if (!formElement?.elements) {
    return;
  }
  const elements = formElement.elements;
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLFormElement ||
      element instanceof HTMLFieldSetElement
    ) {
      callback(element);
    }
  }
};

const resetCustomValidityOnInputs = (formElement: HTMLFormElement) => {
  callActionsOnAllInputs(formElement, (element) => {
    resetCustomValidityOnInput(element);
  });
};

const checkValidityOnAllInputs = (formElement: HTMLFormElement) => {
  // For each element in the form, check if it's valid
  callActionsOnAllInputs(formElement, (element) => {
    // If the element is invalid, add the invalid class
    if (
      !element.validity.valid &&
      !element.validity.valueMissing

      // Not sure why below line was here in the first place @todo investigate
      // !isElementInFocus(element)
    ) {
      setErrorMessageOnElement(element);
    } else {
      clearErrorMessageOnElement(element);
    }
  });
};

const removeSuccessOnInputs = (formElement: HTMLFormElement) => {
  callActionsOnAllInputs(formElement, (element) => {
    removeSuccessOnInput(element);
  });
};

const setSuccessOnInputs = (formElement: HTMLFormElement) => {
  callActionsOnAllInputs(formElement, (element) => {
    setSuccessOnInput(element);
  });
  // After 5 seconds, clear the success state
  setTimeout(() => {
    removeSuccessOnInputs(formElement);
  }, 5000);
};

const setInputErrors = (
  formElement: HTMLFormElement,
  errors?: Record<string, string | string[] | null | undefined>
) => {
  // For each key in errors, find the input and call setErrorOnInput with the value
  if (!errors) {
    return;
  }

  for (const [key, value] of Object.entries(errors)) {
    const input = formElement?.elements.namedItem(
      key
    ) as HTMLSupportedInputElement;
    if (input) {
      // If the value is an array, join it with a space
      let valueToPass = value as string | string[];

      // If the valueToPass is an array, join it with a space
      if (Array.isArray(valueToPass)) {
        valueToPass = valueToPass.join(" ");
      }

      setErrorOnInput(input, valueToPass);
    }
  }
};

export const useForm = (formElement: Ref<HTMLFormElement | null>) => {
  const formIsValid = ref(false);

  const checkValidity = (formElement: HTMLFormElement) => {
    checkValidityOnAllInputs(formElement);

    formIsValid.value = formElement?.checkValidity() ?? false;
  };

  const handleInput = () => {
    resetCustomValidityOnInputs(formElement.value!);
    checkValidity(formElement.value!);
  };

  return {
    formElement,
    formIsValid,
    setErrorOnInput,
    setInputErrors: (
      errors?: Record<string, string | string[] | null | undefined>
    ) => setInputErrors(formElement.value!, errors),
    setSuccessOnInputs: () => setSuccessOnInputs(formElement.value!),
    setSuccessOnInput,
    removeSuccessOnInputs: () => removeSuccessOnInputs(formElement.value!),
    removeSuccessOnInput,
    resetCustomValidityOnInput,
    resetCustomValidityOnInputs: () =>
      resetCustomValidityOnInputs(formElement.value!),
    checkValidity: () => checkValidity(formElement.value!),
    handleInput,
    focusOnFirstInput: () => focusOnFirstInput(formElement.value!),
    focusOnFirstEmptyInput: () => focusOnFirstEmptyInput(formElement.value!),
    isElementInFocus,
  };
};
