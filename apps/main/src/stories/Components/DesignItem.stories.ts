import type { Meta, StoryObj } from "@storybook/vue3";

import DesignItem from "@/components/DesignItem.vue";

import redirectsFixture from "../../../cypress/fixtures/redirects.json";
import type { QRDesign } from "@novulink/types";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof DesignItem> = {
  title: "Components/DesignItem",
  component: DesignItem,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    // Disable aria-hidden-focus for this story
    a11y: {
      config: {
        /** @todo actually find a nice way to fix the color contrast issue on this graph */
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  args: {
    redirectId: "1234",
    design: redirectsFixture[0].qr_designs![0] as any as QRDesign,
  },
  // Wrap the story in a <ul> element
  decorators: [
    () => ({
      template: `<ul style="list-style-type: none;padding: 0;margin: 0;"><story /></ul>`,
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof DesignItem>;

export const Default: Story = {};

export const List: Story = {
  decorators: [
    () => ({
      template: `<ul style="list-style-type: none;padding: 0;margin: 0;"><story /><story /><story /><story /><story /><story /><story /></ul>`,
    }),
  ],
};

export const AutomaticallyGenerated: Story = {
  args: {
    redirectId: "1234",

    design: {
      id: 3,
      team_id: 67,
      user_id: 1,
      name: "Extra rounded red",
      color: "#e32400",
      background_color: "#ffffff",
      error_correction_level: "medium",
      size: 300,
      margin: 10,
      round_block_size_mode: "margin",
      block_shape: "extra-rounded",
      corner_dot_shape: "circle",
      corner_shape: "circle",
      logo: null,
      logo_size: 100,
      logo_punchout_background: true,
      is_scannable: true,
      was_automatically_generated: true,
      last_scan_check_at: new Date("2024-09-17T13:23:09.000000Z"),
      updated_at: new Date("2024-09-17T13:23:09.000000Z"),
      pivot: {
        is_default: false,
      },
    },
  },
};

export const NonScannable: Story = {
  args: {
    redirectId: "1234",

    design: {
      id: 3,
      team_id: 67,
      user_id: 1,
      name: "Extra rounded red",
      color: "#e32400",
      background_color: "#a32400",
      error_correction_level: "medium",
      size: 300,
      margin: 10,
      round_block_size_mode: "margin",
      block_shape: "extra-rounded",
      corner_dot_shape: "circle",
      corner_shape: "circle",
      logo: null,
      logo_size: 100,
      logo_punchout_background: true,
      is_scannable: false,
      was_automatically_generated: false,
      last_scan_check_at: new Date("2024-09-17T13:23:09.000000Z"),
      updated_at: new Date("2024-09-17T13:23:09.000000Z"),
      pivot: {
        is_default: false,
      },
    },
  },
};
