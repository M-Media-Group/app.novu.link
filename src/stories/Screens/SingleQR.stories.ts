import type { Meta, StoryObj } from "@storybook/vue3";

import SingleQR from "@/components/screens/SingleQR.vue";
import { vueRouter } from "storybook-vue3-router";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof SingleQR> = {
  title: "Screens/SingleQR",
  component: SingleQR,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  args: {
    redirectId: "123",
    redirectName: "Test Redirect",
  },
};

export default meta;
type Story = StoryObj<typeof SingleQR>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {};

// Add vueRouter decorator to story
/** @todo check and fix why this is even required, theoretically vueRouter should already work and this "hack"/re-declaration here should not be required */
Default.decorators = [
  vueRouter([
    {
      path: "/",
      name: "add-endpoint",
      redirect: "/add-endpoint",
    },
  ]),
];

export const Authenticated: Story = {
  args: {
    redirectId: "123",
    redirectName: "Test Redirect",
    subscribed: false,
    authenticated: true,
  },
};

Authenticated.decorators = [
  vueRouter([
    {
      path: "/",
      name: "add-endpoint",
      redirect: "/add-endpoint",
    },
  ]),
];

export const AuthenticatedAndSubscribed: Story = {
  args: {
    redirectId: "123",
    redirectName: "Test Redirect",
    subscribed: true,
    authenticated: true,
  },
};

AuthenticatedAndSubscribed.decorators = [
  vueRouter([
    {
      path: "/",
      name: "add-endpoint",
      redirect: "/add-endpoint",
    },
  ]),
];

export const AuthAndSubAndData: Story = {
  args: {
    redirectId: "123",
    redirectName: "Test Redirect",
    subscribed: true,
    authenticated: true,
    clicksToday: 15,
    clicksSameTimeYesterday: 10,
    clicksAllTime: 25,
    bestEndpoint: "https://app.novu.link",
    remainingClicks: 15,
  },
};

AuthAndSubAndData.decorators = [
  vueRouter([
    {
      path: "/",
      name: "add-endpoint",
      redirect: "/add-endpoint",
    },
  ]),
];
