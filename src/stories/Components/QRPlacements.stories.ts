import type { Meta, StoryObj } from "@storybook/vue3";

import QRPlacements from "@/components/QR/QRPlacements.vue";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof QRPlacements> = {
  title: "Components/QRPlacements",
  component: QRPlacements,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  args: {
    redirectId: "1234",
  },
};

export default meta;
type Story = StoryObj<typeof QRPlacements>;

export const Default: Story = {};

export const WithData: Story = {
  args: {
    placements: [
      {
        id: 50,
        description: null,
        redirect_uuid: "ocsyVbM",
        created_by_user_id: 1,
        url: "example.com/blog/awesome-links",
        is_physical: false,
        should_scrape: true,
        last_confirmed_at: "2024-09-05T19:34:56.000000Z",
        can_scrape: true,
        created_at: "2022-07-20T19:34:56.000000Z",
        updated_at: "2022-07-20T19:34:56.000000Z",
      },
      {
        id: 1,
        description: null,
        redirect_uuid: "ocsyVbM",
        created_by_user_id: 1,
        url: "QR Code",
        is_physical: true,
        should_scrape: false,
        last_confirmed_at: "2024-09-02T19:34:56.000000Z",
        can_scrape: false,
        created_at: "2022-07-20T19:34:56.000000Z",
        updated_at: "2022-07-20T19:34:56.000000Z",
      },
      {
        id: 53,
        description: null,
        redirect_uuid: "ocsyVbM",
        created_by_user_id: 1,
        url: "example.com/blog/awesome-links-2020",
        is_physical: false,
        should_scrape: true,
        last_confirmed_at: "2022-07-20T19:34:56.000000Z",
        can_scrape: false,
        created_at: "2022-07-20T19:34:56.000000Z",
        updated_at: "2022-07-20T19:34:56.000000Z",
      },
    ],
  },
};
