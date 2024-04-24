import type { Meta, StoryObj } from "@storybook/vue3";
import RuleSelector from "@/components/RuleSelector.vue";
import {
  sharedDecorators,
  sharedInputArgTypes,
  sharedInputArgs,
} from "../Inputs/SharedInputArgs";

import axios from "axios";

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

  // @ts-ignore
  decorators: [sharedDecorators],

  // Use a custom render template so we can see the modelValue
  render: (args) => ({
    components: { RuleSelector },
    setup() {
      axios.defaults.baseURL = import.meta.env.VITE_API_URL;
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
