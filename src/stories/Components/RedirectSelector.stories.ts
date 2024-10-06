import type { Meta, StoryObj } from "@storybook/vue3";
import RedirectSelector from "@/components/RedirectSelector.vue";
import {
  sharedDecorators,
  sharedInputArgTypes,
  sharedInputArgs,
} from "../Inputs/SharedInputArgs";

import redirectsFixture from "../../../cypress/fixtures/redirects.json";

const meta: Meta<typeof RedirectSelector> = {
  title: "Components/RedirectSelector",

  tags: ["autodocs"],

  component: RedirectSelector,

  argTypes: {
    ...sharedInputArgTypes,
  },

  args: {
    ...sharedInputArgs,
    modelValue: [],
  },

  parameters: {
    mockData: [
      {
        url: "/api/v1/redirects",
        method: "GET",
        status: 200,
        response: redirectsFixture,
      },
    ],
  },

  // @ts-ignore
  decorators: [sharedDecorators],

  // Use a custom render template so we can see the modelValue
  render: (args) => ({
    components: { RedirectSelector },
    setup() {
      return { args };
    },
    template: "<redirect-selector v-bind='args' v-model='args.modelValue'/>",
  }),
};

export default meta;
type Story = StoryObj<typeof RedirectSelector>;

export const Default: Story = {};

export const Unauthenticated: Story = {
  args: {
    modelValue: [],
  },
  parameters: {
    mockData: [
      {
        url: "/api/v1/redirects",
        method: "GET",
        status: 401,
        response: {
          message: "You are not authenticated",
        },
      },
    ],
  },
};
