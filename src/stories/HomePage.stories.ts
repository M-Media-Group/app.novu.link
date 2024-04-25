import type { Meta, StoryObj } from "@storybook/vue3";
import HomeView from "@/views/HomeView.vue";
// Import the user fixture json data

const meta: Meta<typeof HomeView> = {
  title: "Page/HomeView",
  component: HomeView,

  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    // layout: "fullscreen",
  },
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HomeView>;

// More on interaction testing: https://storybook.js.org/docs/writing-tests/interaction-testing
export const NoUserData: Story = {};
