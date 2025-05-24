// / <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
import { TypeOptions } from 'cypress'; // Adjust the import based on where TypeOptions is defined

declare module 'cypress' {
  interface Chainable {
    handleCsrf(): Chainable;
    handleAuthenticatedUser(): Chainable;
    handleUnauthenticatedUser(): Chainable;
    invalidFor(
      subject: unknown,
      options?: Partial<TypeOptions>
    ): Chainable; // Adjust return type if needed
  }
}

Cypress.Commands.add("handleCsrf", () => {
  cy.intercept(
    {
      method: "GET",
      pathname: "/sanctum/csrf-cookie",
    },
    { statusCode: 204, delay: 50 }
  ).as("getCookie");
});

Cypress.Commands.add("handleAuthenticatedUser", () => {
  cy.intercept(
    {
      method: "GET",
      pathname: "/api/user",
    },
    { fixture: "user" }
  ).as("getAuthenticatedUser");

  cy.intercept(
    {
      method: "GET",
      pathname: "/api/v1/teams",
    },
    { fixture: "teams" }
  ).as("getTeams");

  cy.intercept(
    {
      method: "GET",
      pathname: "/dashboard",
    },
    { fixture: "dashboard" }
  ).as("getDashboard");
});

Cypress.Commands.add("handleUnauthenticatedUser", () => {
  cy.intercept(
    {
      method: "GET",
      pathname: "/api/user",
    },
    { statusCode: 401 }
  ).as("getUnauthenticatedUser");

  cy.intercept(
    {
      method: "GET",
      pathname: "/api/v1/teams",
    },
    { statusCode: 401 }
  ).as("getUnauthenticatedTeams");
});

Cypress.Commands.add(
  "invalidFor",
  {
    prevSubject: "element",
  },
  (subject, options: string[]) => {
    const availableValidityOptions = [
      "valueMissing",
      "typeMismatch",
      "patternMismatch",
      "tooLong",
      "tooShort",
      "rangeUnderflow",
      "rangeOverflow",
      "stepMismatch",
      "badInput",
      "customError",
    ];

    let shouldBeValid = true;

    // Convert the options array to object

    if (options.length !== 0) {
      shouldBeValid = false;
    }

    const optionsToCheck: Record<string, boolean> = {};

    for (const option in availableValidityOptions) {
      optionsToCheck[availableValidityOptions[option]] =
        options.indexOf(availableValidityOptions[option]) > -1;
    }
    console.log("checking", {
      ...optionsToCheck,
      valid: shouldBeValid,
    });
    // Assert that the input is invalid
    cy.wrap(subject)
      .invoke("prop", "validity")
      .should("deep.include", {
        ...optionsToCheck,
        valid: shouldBeValid,
      });
  }
);
export { };
