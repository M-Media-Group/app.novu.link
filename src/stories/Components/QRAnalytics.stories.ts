import type { Meta, StoryObj } from "@storybook/vue3";

import QRAnalytics from "@/components/QR/QRAnalytics.vue";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof QRAnalytics> = {
  title: "Components/QRAnalytics",
  component: QRAnalytics,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    // Disable aria-hidden-focus for this story
    a11y: {
      config: {
        /** @todo actually find a nice way to fix the color contrast issue on this graph */
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  args: {
    redirectId: "1234",
  },
};

export default meta;
type Story = StoryObj<typeof QRAnalytics>;

export const Default: Story = {};
