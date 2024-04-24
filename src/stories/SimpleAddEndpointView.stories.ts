import type { Meta, StoryObj } from "@storybook/vue3";
import SimpleAddEndpointView from "@/views/SimpleAddEndpointView.vue";
import { useUserStore } from "@/stores/user";
// Import the user fixture json data
import userFixture from "../../cypress/fixtures/user.json";
import axios from "axios";

const meta: Meta<typeof SimpleAddEndpointView> = {
  title: "Page/SimpleAddEndpointView",
  component: SimpleAddEndpointView,
  render: (args) => ({
    components: { SimpleAddEndpointView },
    template: "<SimpleAddEndpointView />",
    setup() {
      axios.defaults.baseURL = import.meta.env.VITE_API_URL;
      return { args };
    },
  }),
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: "fullscreen",
  },
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  args: {
    redirectId: "123",
  },
};

export default meta;
type Story = StoryObj<typeof SimpleAddEndpointView>;

// More on interaction testing: https://storybook.js.org/docs/writing-tests/interaction-testing
export const NoUserData: Story = {};

export const WithUserData: Story = {
  render: (args) => ({
    components: { SimpleAddEndpointView },
    setup() {
      const user = useUserStore();
      user.isAuthenticated = true;
      user.user = {
        ...userFixture,
        seen_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      axios.defaults.baseURL = import.meta.env.VITE_API_URL;

      return { args };
    },
    template: "<SimpleAddEndpointView v-bind='args' />",
  }),
};
