import type { Meta, StoryObj } from "@storybook/vue3";
import RuleSelector from "@/components/RuleSelector.vue";
import {
  sharedDecorators,
  sharedInputArgTypes,
  sharedInputArgs,
} from "../Inputs/SharedInputArgs";

import rulesFixture from "../../../cypress/fixtures/rules.json";

const meta: Meta<typeof RuleSelector> = {
  title: "Components/RuleSelector",

  tags: ["autodocs"],

  component: RuleSelector,

  argTypes: {
    ...sharedInputArgTypes,
    modelValue: {
      control: "object",
      description: "The rule to display",
      table: { category: "Props" },
    },
  },

  args: {
    ...sharedInputArgs,
    modelValue: {
      selectedRuleKey: "browser_language",
      selectedOperator: "=",
      selectedValue: "en",
    },
  },

  parameters: {
    mockData: [
      {
        url: "/api/v1/rules",
        method: "GET",
        status: 200,
        response: rulesFixture,
      },
      {
        url: "/api/v1/rules/browser_language/test?operator=contains&value=af",
        method: "POST",
        status: 200,
        response: { passes: true },
      },
    ],
  },

  // @ts-ignore
  decorators: [sharedDecorators],

  // Use a custom render template so we can see the modelValue
  render: (args) => ({
    components: { RuleSelector },
    setup() {
      return { args };
    },
    template: "<rule-selector v-bind='args' v-model='args.modelValue' />",
  }),
};

export default meta;
type Story = StoryObj<typeof RuleSelector>;

export const Default: Story = {};

export const NoValues: Story = {
  args: {
    modelValue: {
      selectedRuleKey: null,
      selectedOperator: null,
      selectedValue: null,
    },
  },
};

export const AllErrors: Story = {
  args: {
    modelValue: {
      selectedRuleKey: "Bad value" as any,
      selectedOperator: "Bad value",
      selectedValue: "Bad value",
    },
  },
};
