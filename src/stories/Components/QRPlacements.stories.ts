import type { Meta, StoryObj } from "@storybook/vue3";

import QRPlacements from "@/components/QR/QRPlacements.vue";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof QRPlacements> = {
  title: "Components/QRPlacements",
  component: QRPlacements,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  args: {
    redirectId: "1234",
  },
};

export default meta;
type Story = StoryObj<typeof QRPlacements>;

export const Default: Story = {};
