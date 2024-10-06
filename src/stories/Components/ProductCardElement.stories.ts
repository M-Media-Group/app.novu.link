import type { Meta, StoryObj } from "@storybook/vue3";

import ProductCardElement from "@/components/ProductCardElement.vue";

import productsFixture from "../../../cypress/fixtures/products.json";
import type { Product } from "@/types/product";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof ProductCardElement> = {
  title: "Components/ProductCardElement",
  component: ProductCardElement,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  //  Set the router "user.isAuthenticated" to true. We will useUserStore to set the user to authenticated
};

export default meta;
type Story = StoryObj<typeof ProductCardElement>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */

export const Default: Story = {
  args: {
    product: productsFixture[3] as Product,
  },
};
