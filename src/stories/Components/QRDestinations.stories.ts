import type { Meta, StoryObj } from "@storybook/vue3";

import QRDestinations from "@/components/QR/QRDestinations.vue";
import { vueRouter } from "storybook-vue3-router";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof QRDestinations> = {
  title: "Components/QRDestinations",
  component: QRDestinations,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  args: {
    redirectId: "1234",
  },
};

export default meta;
type Story = StoryObj<typeof QRDestinations>;

export const Default: Story = {};

Default.decorators = [
  vueRouter([
    {
      path: "/",
      name: "add-endpoint",
      redirect: "/add-endpoint",
    },
  ]),
];

export const WithDestinations: Story = {
  args: {
    endpoints: [
      {
        id: 1,
        redirect_uuid: "https://example.com",
        endpoint: "http://192.168.10.17:8001/redirects/Bs5mOLf",
        clicks_by_time_of_day: [
          {
            redirect_uuid: "xxx",
            datetime: "2024-01-12T00:00:00",
            click_count: 100,
          },
        ],
      },
      {
        id: 2,
        redirect_uuid: "https://example.com",
        endpoint:
          "http://localhost:3001/?path=/story/components-qrdestinations--with-destinations",
        clicks_by_time_of_day: [
          {
            redirect_uuid: "xxx",
            datetime: "2024-01-12T00:00:00",
            click_count: 50,
          },
        ],
      },
      {
        id: 3,
        redirect_uuid: "https://example.com",
        endpoint: "https://developer.mozilla.org/en-US/docs/Web/CSS/width",
        clicks_by_time_of_day: [
          {
            redirect_uuid: "xxx",
            datetime: "2024-01-12T00:00:00",
            click_count: 75,
          },
        ],
      },
    ],
  },
};

WithDestinations.decorators = [
  vueRouter([
    {
      path: "/",
      name: "add-endpoint",
      redirect: "/add-endpoint",
    },
  ]),
];
