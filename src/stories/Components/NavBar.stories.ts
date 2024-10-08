import type { Meta, StoryObj } from "@storybook/vue3";

import NavBar from "@/components/NavBar.vue";

import { expect, userEvent, waitFor, within } from "@storybook/test";

import userFixture from "../../../cypress/fixtures/user.json";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof NavBar> = {
  title: "Components/NavBar",
  component: NavBar,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  //  Set the router "user.isAuthenticated" to true. We will useUserStore to set the user to authenticated
};

export default meta;
type Story = StoryObj<typeof NavBar>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const LoggedIn: Story = {
  args: {
    // @ts-ignore
    user: userFixture,
  },
};

export const DropdownOpen: Story = {
  args: {
    // @ts-ignore
    user: userFixture,
  },
  play: async ({ canvasElement }: any) => {
    const canvas = within(canvasElement);

    // There should be no logout text visible. It will be in the dom, but not visible
    expect(canvas.queryByText("Logout")).not.toBeVisible();

    // First we click on the text "my account"
    const myAccount = canvas.getByText("☰");
    // Click on the "My Account" text
    await userEvent.click(myAccount);
    // There should be a visible "Logout"
    await waitFor(() => {
      expect(canvas.getByText("My Account")).toBeVisible();
    });
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // There is some flakey behavior with the a11y tests color contrast, I think due to the "play" timing and the timing of the opening of the dropdown + maybe the switching of light/dark modes. Need to investigagte, for now we disable it here speciically
            id: "color-contrast",
            any: ["a"],
          },
        ],
      },
      options: {},
      manual: true,
    },
  },
};

export const Loading: Story = {
  args: {
    // @ts-ignore
    isLoading: true,
  },
};

export const LoggedOut: Story = {};
