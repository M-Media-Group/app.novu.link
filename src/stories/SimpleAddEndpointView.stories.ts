import type { Meta, StoryObj } from "@storybook/vue3";
import SimpleAddEndpointView from "@/views/SimpleAddEndpointView.vue";
import { useUserStore } from "@/stores/user";
// Import the user fixture json data
import userFixture from "../../cypress/fixtures/user.json";
import redirectsFixture from "../../cypress/fixtures/redirects.json";
import rulesFixture from "../../cypress/fixtures/rules.json";

const meta: Meta<typeof SimpleAddEndpointView> = {
  title: "Page/SimpleAddEndpointView",
  component: SimpleAddEndpointView,
  render: (args) => ({
    components: { SimpleAddEndpointView },
    template: "<SimpleAddEndpointView />",
    setup() {
      return { args };
    },
  }),

  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  args: {
    redirectId: redirectsFixture[0].uuid,
  },

  parameters: {
    layout: "fullscreen",

    mockData: [
      {
        url: "/api/v1/rules?redirectId=" + redirectsFixture[0].uuid,
        method: "GET",
        status: 200,
        response: rulesFixture,
      },
    ],
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

      return { args };
    },
    template: "<SimpleAddEndpointView v-bind='args' />",
  }),
};
