import type { Meta, StoryObj } from "@storybook/vue3";
import DashboardView from "@/views/DashboardView.vue";
import { useUserStore } from "@/stores/user";
// Import the user fixture json data
import userFixture from "../../cypress/fixtures/user.json";
import dashboardFixture from "../../cypress/fixtures/dashboard.json";

const meta: Meta<typeof DashboardView> = {
  title: "Page/UserDashboard",
  component: DashboardView,
  render: () => ({
    components: { DashboardView },
    template: "<main><DashboardView /></main>",
  }),
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    // layout: "fullscreen",
    mockData: [
      {
        url: "/dashboard",
        method: "GET",
        status: 200,
        response: {},
      },
    ],
  },
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DashboardView>;

// More on interaction testing: https://storybook.js.org/docs/writing-tests/interaction-testing
export const NoUserData: Story = {};

export const WithUserData: Story = {
  /** @todo implement */
  render: () => ({
    components: { DashboardView },
    template: "<main><DashboardView /></main>",
    setup() {
      const user = useUserStore();
      user.isAuthenticated = true;
      user.user = {
        ...userFixture,
        seen_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
    },
  }),

  parameters: {
    template: "<DashboardView />",
    mockData: [
      {
        url: "/dashboard",
        method: "GET",
        status: 200,
        response: { ...dashboardFixture },
      },
    ],
  },
};

export const WithUserDataAndSubscribed: Story = {
  /** @todo implement */
  render: () => ({
    components: { DashboardView },
    template: "<main><DashboardView /></main>",
    setup() {
      const user = useUserStore();
      user.isAuthenticated = true;
      user.user = {
        ...userFixture,
        seen_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
    },
  }),

  parameters: {
    template: "<DashboardView />",
    mockData: [
      {
        url: "/dashboard",
        method: "GET",
        status: 200,
        response: { ...dashboardFixture, hasBillableRedirects: true },
      },
    ],
  },
};
