import { type Ref, ref } from "vue";

const supportedElements = [
  HTMLInputElement,
  HTMLSelectElement,
  HTMLTextAreaElement,
  HTMLFormElement,
  HTMLFieldSetElement,
] as const;

type HTMLSupportedInputElement =
  (typeof supportedElements)[number] extends new (...args: any[]) => infer R
    ? R
    : never;

const setErrorMessageOnElement = (element: HTMLSupportedInputElement) => {
  //  Update or create a sibling element with the error message
  let errorElement = element.nextElementSibling as HTMLElement;
  if (!errorElement || !errorElement.classList.contains("error")) {
    errorElement = document.createElement("small");
    element.after(errorElement);
  }
  errorElement.innerText = element.validationMessage;
  errorElement.classList.add("error");

  element.insertAdjacentElement("afterend", errorElement);
};

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

const clearErrorMessageOnElement = (element: HTMLSupportedInputElement) => {
  // If the element is valid, remove the invalid class
  const errorElement = element.nextElementSibling as HTMLElement;
  if (errorElement && errorElement.classList.contains("error")) {
    errorElement.remove();
  }
};

const isElementInFocus = (element: HTMLSupportedInputElement) => {
  return document.activeElement === element;
};

const focusOnFirstInput = (formElement: HTMLFormElement) => {
  const firstInput = formElement?.querySelector("input");
  if (firstInput) {
    firstInput.focus();
  }
};

const focusOnFirstEmptyInput = (formElement: HTMLFormElement) => {
  const firstInput = formElement?.querySelectorAll("input");
  if (firstInput) {
    for (let i = 0; i < firstInput.length; i++) {
      if (!firstInput[i].value) {
        firstInput[i].focus();
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
  errors?: Record<string, string | string[] | null>
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
    setInputErrors: (errors?: Record<string, string | string[] | null>) =>
      setInputErrors(formElement.value!, errors),
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
