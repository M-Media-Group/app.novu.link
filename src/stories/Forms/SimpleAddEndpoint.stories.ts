import type { Meta, StoryObj } from "@storybook/vue3";

import SimpleAddEndpoint from "@/forms/SimpleAddEndpoint.vue";
import { useUserStore } from "@/stores/user";

import userFixture from "../../../cypress/fixtures/user.json";
import redirectsFixture from "../../../cypress/fixtures/redirects.json";
import rulesFixture from "../../../cypress/fixtures/rules.json";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof SimpleAddEndpoint> = {
  title: "Forms/SimpleAddEndpoint",
  component: SimpleAddEndpoint,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  args: {
    redirectId: redirectsFixture[0].uuid,
    fallbackUrl: redirectsFixture[0].endpoints[0].endpoint,
  },
  parameters: {
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
type Story = StoryObj<typeof SimpleAddEndpoint>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  render: (args) => ({
    components: { SimpleAddEndpoint },
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
    template: "<simple-add-endpoint v-bind='args' />",
  }),
};
