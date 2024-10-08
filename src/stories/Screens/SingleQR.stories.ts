import type { Meta, StoryObj } from "@storybook/vue3";

import SingleQR from "@/components/screens/SingleQR.vue";
import { vueRouter } from "storybook-vue3-router";
import redirectsFixture from "../../../cypress/fixtures/redirects.json";
import type { Alert, Endpoint, Webhook } from "@/types/redirect";
import type { QRDesign } from "@/types/qrDesign";

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

  parameters: {
    mockData: [
      {
        url: "/api/v1/webhooks/events",
        method: "GET",
        status: 200,
        response: {
          data: ["test"],
        },
      },
    ],
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
    endpoints: redirectsFixture[0].endpoints as unknown as Endpoint[],
    designs: redirectsFixture[0].qr_designs as unknown as QRDesign[],
    webhooks: redirectsFixture[0].webhooks as unknown as Webhook[],
    alerts: redirectsFixture[0].alerts as unknown as Alert[],
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

export const AuthAndSubAndErrorData: Story = {
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
    endpoints: [
      {
        id: 1,
        redirect_uuid: "https://example.com",
        endpoint: "http://example.com/my/path",
        last_http_code: 500,

        clicks_by_time_of_day: [
          {
            redirect_uuid: "xxx",
            datetime: "2024-01-12T00:00:00",
            click_count: 100,
          },
        ],
      },
    ],
  },
};

AuthAndSubAndErrorData.decorators = [
  vueRouter([
    {
      path: "/",
      name: "add-endpoint",
      redirect: "/add-endpoint",
    },
  ]),
];
