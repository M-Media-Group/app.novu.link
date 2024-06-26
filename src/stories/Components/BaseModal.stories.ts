import type { Meta, StoryObj } from "@storybook/vue3";

import BaseModal from "@/components/modals/BaseModal.vue";
import { expect, waitFor, within } from "@storybook/test";

import overflowFixture from "../../../cypress/fixtures/overflowingData.json";
import { expectElementToBeCentered } from "../utils";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof BaseModal> = {
  title: "Components/BaseModal",
  component: BaseModal,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  args: {
    title: "Hello World",
    triggerText: "Hello World",
    default: "Hello World",
  }, // default value
};

export default meta;
type Story = StoryObj<typeof BaseModal>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {};

export const DefaultOpened: Story = {
  play: async ({ canvasElement }: any) => {
    const canvas = within(canvasElement);
    await waitFor(
      () => expect(canvas.queryByText("Cancel")).not.toBeVisible(),
      { timeout: 500 }
    );

    // Click the button
    const button = canvas.getByText("Hello World", { selector: "button" });
    await button.click();
    await waitFor(() => expect(canvas.queryByText("Cancel")).toBeVisible(), {
      timeout: 500,
    });

    // The modal, which is in `article` tag, should be in the middle of the screen
    const modal = canvas.getByRole("article");

    expectElementToBeCentered(modal, canvasElement);
  },
};

export const OverflowingContent: Story = {
  args: {
    title: overflowFixture.text,
    default: overflowFixture.text,
    triggerText: overflowFixture.text,
  },
};

export const MinimumExample: Story = {
  args: {
    triggerText: undefined,
    default: null,
  },
};

/**
 * This story will show the modal with the background click to close feature disabled, and no clickable close options. You could still escape using the "escape" key
 */
export const LockedIn: Story = {
  args: {
    allowBackgroundClickToClose: false,
    showFooter: false,
    showCloseInHeader: false,
  },
};

export const WithoutFooter: Story = {
  args: {
    showFooter: false,
  },
};
