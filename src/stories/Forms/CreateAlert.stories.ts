import type { Meta, StoryObj } from "@storybook/vue3";

import CreateAlert from "@/forms/CreateAlert.vue";

import redirectsFixture from "../../../cypress/fixtures/redirects.json";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof CreateAlert> = {
  title: "Forms/CreateAlert",
  component: CreateAlert,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  args: {
    redirectId: redirectsFixture[0].uuid,
  },
  parameters: {
    mockData: [
      {
        url: "/api/v1/redirects",
        method: "GET",
        status: 200,
        response: redirectsFixture,
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof CreateAlert>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {};
