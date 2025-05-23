import type { Meta, StoryObj } from "@storybook/vue3";

import AddPaymentMethod from "@/forms/AddPaymentMethod.vue";
import { useUserStore } from "@/stores/user";

import userFixture from "../../../cypress/fixtures/user.json";
import teamsFixture from "../../../cypress/fixtures/teams.json";
import paymentIntent from "../../../cypress/fixtures/paymentIntent.json";

import { expect, waitFor, within } from "@storybook/test";
import { useTeamStore } from "@/stores/team";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof AddPaymentMethod> = {
  title: "Forms/AddPaymentMethod",
  component: AddPaymentMethod,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    imageSnapshot: {
      failureThreshold: 0.05, // 5 percent is high but this test is flakey because it doesnt wait for the stripe iframe to fully load
    },
    // Disable aria-hidden-focus for this story - the error comes from deep within the Stripe element, not much we can do about it
    a11y: {
      config: {
        rules: [{ id: "aria-hidden-focus", enabled: false }],
      },
    },

    mockData: [
      {
        url: "/user/payment-intent",
        method: "GET",
        status: 200,
        response: paymentIntent,
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof AddPaymentMethod>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  render: (args) => ({
    components: { AddPaymentMethod },
    setup() {
      const user = useUserStore();
      const team = useTeamStore();
      user.isAuthenticated = true;
      user.user = {
        ...userFixture,
        created_at: new Date(),
        updated_at: new Date(),
      } as any;

      team.teams = teamsFixture;

      return { args };
    },
    template: "<add-payment-method v-bind='args' />",
  }),
  play: async ({ canvasElement }: any) => {
    const canvas = within(canvasElement);

    // Confirm the submit button is there
    await waitFor(() => {
      expect(canvas.getByRole("button")).toBeVisible();
      // It should be disabled
      expect(canvas.getByRole("button")).toBeDisabled();
    });

    // We can assert that the iframe is visible "data-cy="add-payment-form""
    await waitFor(
      () => {
        expect(canvas.getByRole("presentation")).toBeVisible();
      },
      {
        timeout: 10000,
        container: canvasElement,
      }
    );
  },
};
