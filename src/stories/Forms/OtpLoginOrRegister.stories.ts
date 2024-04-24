import type { Meta, StoryObj } from "@storybook/vue3";

import OtpLoginOrRegister from "@/forms/OtpLoginOrRegister.vue";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof OtpLoginOrRegister> = {
  title: "Forms/OtpLoginOrRegister",
  component: OtpLoginOrRegister,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof OtpLoginOrRegister>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {};
