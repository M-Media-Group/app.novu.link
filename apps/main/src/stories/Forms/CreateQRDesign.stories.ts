import type { Meta, StoryObj } from "@storybook/vue3";

import CreateQRDesign from "@/forms/CreateQRDesign.vue";
import { expect, fireEvent, userEvent, waitFor, within } from "@storybook/test";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof CreateQRDesign> = {
  title: "Forms/CreateQRDesign",
  component: CreateQRDesign,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CreateQRDesign>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {};

export const InsufficentContrast: Story = {
  // Change the foreground color to white
  play: async ({ canvasElement }) => {
    // Get the element with the text "Shape" in it
    const canvas = within(canvasElement);

    const button = canvas.getByLabelText("Color", { selector: "input" });

    await waitFor(async () => {
      await expect(button).toBeVisible();
    });

    await userEvent.click(button);

    // Change the color to white. We need to set the value to #ffffff programmatically because its a color picker
    await fireEvent.input(button, { target: { value: "#00AEE8" } });

    const contrastWarning = canvas.getByText(
      "The contrast ratio is too low. The QR code may not be scannable."
    );

    await waitFor(async () => {
      await expect(contrastWarning).toBeVisible();
    });
  },
};

export const ShapePage: Story = {
  play: async ({ canvasElement }) => {
    // Get the element with the text "Shape" in it
    const canvas = within(canvasElement);

    const button = canvas.getByText("Shape", { selector: "button" });

    await waitFor(async () => {
      await expect(button).toBeVisible();
    });

    await userEvent.click(button);
  },
};

export const LogoPage: Story = {
  play: async ({ canvasElement }) => {
    // Get the element with the text "Shape" in it
    const canvas = within(canvasElement);

    const button = canvas.getByText("Logo", { selector: "button" });

    await waitFor(async () => {
      await expect(button).toBeVisible();
    });

    await userEvent.click(button);
  },
};

export const NamePage: Story = {
  play: async ({ canvasElement }) => {
    // Get the element with the text "Shape" in it
    const canvas = within(canvasElement);

    const button = canvas.getByText("Name", { selector: "button" });

    await waitFor(async () => {
      await expect(button).toBeVisible();
    });

    await userEvent.click(button);
  },
};

export const AdvancedPage: Story = {
  play: async ({ canvasElement }) => {
    // Get the element with the text "Shape" in it
    const canvas = within(canvasElement);

    const button = canvas.getByText("Advanced", { selector: "button" });

    await waitFor(async () => {
      await expect(button).toBeVisible();
    });

    await userEvent.click(button);
  },
};

export const NameModal: Story = {
  play: async ({ canvasElement }) => {
    // Get the element with the text "Shape" in it
    const canvas = within(canvasElement);

    const button = canvas.getAllByText("Create design")[0];

    await waitFor(async () => {
      await expect(button).toBeVisible();
    });

    await userEvent.click(button);
  },
};
