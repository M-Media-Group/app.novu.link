import type { Meta, StoryObj } from "@storybook/vue3";

import QRDestinations from "@/components/QR/QRDestinations.vue";
import { vueRouter } from "storybook-vue3-router";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof QRDestinations> = {
  title: "Components/QRDestinations",
  component: QRDestinations,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  args: {
    redirectId: "1234",
  },
};

export default meta;
type Story = StoryObj<typeof QRDestinations>;

export const Default: Story = {};

Default.decorators = [
  vueRouter([
    {
      path: "/",
      name: "add-endpoint",
      redirect: "/add-endpoint",
    },
  ]),
];
