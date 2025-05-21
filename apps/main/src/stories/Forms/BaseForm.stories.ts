import type { Meta, StoryObj } from "@storybook/vue3";

import BaseForm from "@/forms/BaseForm.vue";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof BaseForm> = {
  title: "Forms/BaseForm",
  // BaseForm has generics declaration and causes some weird issues here - @todo investigate later

  // @ts-expect-error as the component is not typed here when passed to storybook
  component: BaseForm,

  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BaseForm>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  render: (args) => ({
    components: { BaseForm },
    setup() {
      return { args };
    },
    template:
      "<base-form v-bind='args'><input type='email' name='email' required placeholder='Email' /><input type='password' name='password' required placeholder='Password' /></base-form>",
  }),
};
