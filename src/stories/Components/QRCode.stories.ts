import type { Meta, StoryObj } from "@storybook/vue3";

import QRCode from "@/components/QRCode.vue";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof QRCode> = {
  title: "Components/QRCode",
  component: QRCode,
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

  // The argType for selectedShape should be square, rounded, or circle
  argTypes: {
    lightColor: {
      control: { type: "color" },
      description: "The light color of the QR code",
    },
    darkColor: {
      control: { type: "color" },
      description: "The dark color of the QR code",
    },
    fileType: {
      options: ["png", "svg"],
      control: { type: "select" },
      table: { category: "Props" },
      description: "The file type of the QR code",
    },
  },
};

export default meta;
type Story = StoryObj<typeof QRCode>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    redirectId: "1234",
    loading: true,
  },
};
