import { describe, expect, it, vi } from "vitest";

import { mount } from "@vue/test-utils";

import { createTestingPinia } from "@pinia/testing";

import NavBar from "../NavBar.vue";

import "html-validate/vitest";

describe("NavBar", () => {
  it("renders properly when logged out", () => {
    const wrapper = mount(NavBar, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
      },
    });

    expect(wrapper.find("[aria-roledescription='logo']").exists()).toBe(true);
    expect(wrapper.text()).toContain("Login");
    expect(wrapper.text()).toContain("Sign up");

    // @ts-ignore an ambient declaration file doesnt seem to work to add toHTMLValidate @todo and check
    expect(wrapper.html()).toHTMLValidate();

    // Expect the snapshot to match
    expect(wrapper.html()).toMatchSnapshot();
  });
  it("renders properly when logged in", async () => {
    const wrapper = mount(NavBar, {
      props: {
        user: {
          id: 1,
        } as any,
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
      },
    });

    expect(wrapper.find("[aria-roledescription='logo']").exists()).toBe(true);
    expect(wrapper.text()).toContain("My Account");
    expect(wrapper.text()).toContain("Logout");
    expect(wrapper.text()).toContain("Settings");

    // @ts-ignore an ambient declaration file doesnt seem to work to add toHTMLValidate @todo and check
    expect(wrapper.html()).toHTMLValidate();

    // Expect the snapshot to match
    expect(wrapper.html()).toMatchSnapshot();
  });
});
