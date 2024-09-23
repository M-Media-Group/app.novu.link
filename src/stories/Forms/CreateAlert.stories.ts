import type { Meta, StoryObj } from "@storybook/vue3";

import CreateAlert from "@/forms/CreateAlert.vue";
import { within } from "@storybook/test";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof CreateAlert> = {
  title: "Forms/CreateAlert",
  component: CreateAlert,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CreateAlert>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {};

export const Email: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Click on "Use email instead"
    const emailButton = canvas.getByText("Use email instead");
    emailButton.click();
  },
};
