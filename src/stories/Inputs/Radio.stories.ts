import type { Meta, StoryObj } from "@storybook/vue3";
import {
  sharedDecorators,
  sharedInputArgTypes,
  sharedInputArgs,
  sharedTests,
} from "./SharedInputArgs";

type HTMLInputElementCustom = Omit<HTMLInputElement, "type"> &
  typeof sharedInputArgs;

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<HTMLInputElementCustom> = {
  title: "Components/Inputs/Radio",
  // We will just show a simple input
  render: (args) => ({
    setup() {
      return { args };
    },
    // We need to render the radio with options from args
    template: `
      <label for='radio'>
        <input id='radio' type='radio' v-bind='args' data-testid="input"></input>
        {{args.value}}
      </label>
      `,
  }),

  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    ...sharedInputArgTypes,
  },
  args: {
    ...sharedInputArgs,
    checked: true,
  },
  play: async ({ canvasElement, args }) => {
    sharedTests(canvasElement, args);
  },
  decorators: [sharedDecorators],
};

export default meta;
type Story = StoryObj<HTMLInputElementCustom>;

export const Default: Story = {};

export const MultiOptions: Story = {
  render: (args) => ({
    setup() {
      return { args };
    },
    // We need to render the radio with options from args - here we show 2 radios
    template: `
      <label for='radio'>
        <input id='radio' type='radio' data-testid="input" v-bind='args' name='{{args.name}}'></input>
        {{args.value}}
      </label>
      <label for='radio2'>
        <input id='radio2' type='radio' data-testid="input" v-bind='args' name='{{args.name}}'></input>
        {{args.value}}
      </label>
      `,
  }),
};

// Multi options that show the radio buttons like when picking the size of a t-shirt
export const Containered: Story = {
  args: {
    name: "tshirt-size",
    value: "Small",
  },
  render: (args) => ({
    setup() {
      return { args };
    },
    // We need to render the radio with options from args - here we show 2 radios
    template: `
      <label class="radio-checkbox-container">
        <input type='radio' data-testid="input" v-bind='args' name='{{args.name}}'></input>
        {{args.value}}
      </label>
      <label class="radio-checkbox-container">
        <input type='radio' data-testid="input" v-bind='args' name='{{args.name}}' disabled></input>
        {{args.value}}
      </label>
      <label class="radio-checkbox-container">
        <input type='radio' data-testid="input" v-bind='args' name='{{args.name}}' disabled></input>
        {{args.value}}
        <small>(Out of stock)</small>
      </label>
      <label class="radio-checkbox-container">
        {{args.value}}
        <small>(Great text here)</small>
        <input type='radio' data-testid="input" v-bind='args' name='{{args.name}}'></input>
      </label>
      `,
  }),
};
