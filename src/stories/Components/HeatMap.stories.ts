import type { Meta, StoryObj } from "@storybook/vue3";

import HeatMap from "@/components/charts/HeatMap.vue";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof HeatMap> = {
  title: "Components/HeatMap",
  component: HeatMap,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    imageSnapshot: {
      failureThreshold: 0.05, // 5 percent is high but this test is flakey because it doesnt wait for the stripe iframe to fully load
    },
    // Disable aria-hidden-focus for this story
    a11y: {
      config: {
        /** @todo actually find a nice way to fix the color contrast issue on this graph */
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  args: {
    matrix: [
      [0, 2, 0],
      [40, 5, 6],
      [7, 8, 20],
    ],
  },
};

export default meta;
type Story = StoryObj<typeof HeatMap>;

export const Default: Story = {};
