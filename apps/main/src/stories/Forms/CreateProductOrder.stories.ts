import type { Meta, StoryObj } from "@storybook/vue3";

import CreateProductOrder from "@/forms/CreateProductOrder.vue";
import productsFixture from "../../../cypress/fixtures/products.json";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof CreateProductOrder> = {
  title: "Forms/CreateProductOrder",
  component: CreateProductOrder,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  args: {
    redirectIds: ["123"],
  },

  parameters: {
    mockData: [
      {
        url: "/api/v1/products?page=1&stream=true",
        method: "GET",
        status: 200,
        response: productsFixture,
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof CreateProductOrder>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {};
