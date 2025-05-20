import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearErrorMessageOnElement, setErrorMessageOnElement } from "../manipulateDom.js";

// Mock hasProperty to control its behavior
vi.mock("@novulink/helpers/hasMethod", () => ({
    hasProperty: (el: unknown, prop: string) => prop in (el as object),
}));

describe("setErrorMessageOnElement", () => {
    let input: HTMLInputElement;

    beforeEach(() => {
        document.body.innerHTML = "";
        input = document.createElement("input");
        document.body.appendChild(input);
    });

    it("creates an error element with a custom message", () => {
        setErrorMessageOnElement(input, "Custom error");
        const errorElement = input.nextElementSibling as HTMLElement;
        expect(errorElement).toBeTruthy();
        expect(errorElement.tagName).toBe("SMALL");
        expect(errorElement.classList.contains("error")).toBe(true);
        expect(errorElement.innerText).toBe("Custom error");
    });

    it("uses validationMessage if no custom message is provided", () => {
        // To do this test, we need to mock the input element's validationMessage property
        vi.spyOn(input, "validationMessage", "get").mockReturnValue("Validation failed");
        setErrorMessageOnElement(input);
        const errorElement = input.nextElementSibling as HTMLElement;
        expect(errorElement.innerText).toBe("Validation failed");
    });

    it("sets empty message if no custom or validationMessage", () => {
        setErrorMessageOnElement(input);
        const errorElement = input.nextElementSibling as HTMLElement;
        expect(errorElement.innerText).toBe("");
    });

    it("reuses existing error element", () => {
        setErrorMessageOnElement(input, "First error");
        const firstErrorElement = input.nextElementSibling as HTMLElement;
        setErrorMessageOnElement(input, "Second error");
        const secondErrorElement = input.nextElementSibling as HTMLElement;
        expect(firstErrorElement).toBe(secondErrorElement);
        expect(secondErrorElement.innerText).toBe("Second error");
    });
});

describe("clearErrorMessageOnElement", () => {
    let input: HTMLInputElement;

    beforeEach(() => {
        document.body.innerHTML = "";
        input = document.createElement("input");
        document.body.appendChild(input);
    });

    it("removes the error element if present", () => {
        setErrorMessageOnElement(input, "Error");
        const errorElement = input.nextElementSibling as HTMLElement;
        expect(errorElement).toBeTruthy();
        clearErrorMessageOnElement(input);
        expect(input.nextElementSibling).toBeNull();
    });

    it("does nothing if there is no error element", () => {
        expect(() => clearErrorMessageOnElement(input)).not.toThrow();
        expect(input.nextElementSibling).toBeNull();
    });

    it("does not remove non-error siblings", () => {
        const span = document.createElement("span");
        input.after(span);
        clearErrorMessageOnElement(input);
        expect(input.nextElementSibling).toBe(span);
    });
});