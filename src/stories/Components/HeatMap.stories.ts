import type { Meta, StoryObj } from "@storybook/vue3";

import HeatMap from "@/components/charts/HeatMap.vue";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof HeatMap> = {
  title: "Components/HeatMap",
  component: HeatMap,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  //  Set the router "user.isAuthenticated" to true. We will useUserStore to set the user to authenticated

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
