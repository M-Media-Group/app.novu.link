import { expect, waitFor } from "@storybook/test";

/** Recursively check that the children are not overflowing */
export const expectChildrenNotOverflowing = (
  children: HTMLCollectionOf<Element>,
  parent: Element
) => {
  const elementRect = parent.getBoundingClientRect();
  for (const child of children) {
    const childRect = child.getBoundingClientRect();
    expect(childRect.width).toBeLessThanOrEqual(elementRect.width);
    expect(childRect.height).toBeLessThanOrEqual(elementRect.height);
    if (child.children.length > 0) {
      expectChildrenNotOverflowing(child.children, parent);
    }
  }
};

/** Check that the element is not overflowing */
export const expectTextNotOverflowing = async (element: Element) => {
  const elementRect = element.getBoundingClientRect();

  //   If the element handles overflow, we can't check for overflow. It might handle it by setting overflow: hidden and nowrap
  if (
    window.getComputedStyle(element).overflow === "hidden" &&
    window.getComputedStyle(element).whiteSpace === "nowrap"
  ) {
    return;
  }
  await waitFor(
    () => {
      expect(element.scrollWidth).toBeLessThanOrEqual(elementRect.width);
      expect(element.scrollHeight).toBeLessThanOrEqual(elementRect.height);
    },
    { timeout: 500 }
  );
};

/** check that an element is centered relative to parent */
export const expectElementToBeCentered = (
  element: Element,
  parent: Element,
  checkVerticalToo = false
) => {
  const elementRect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  const leftDistance = elementRect.left - parentRect.left;
  const rightDistance = parentRect.right - elementRect.right;

  expect(leftDistance).toBeCloseTo(rightDistance, 0);

  if (!checkVerticalToo) {
    return;
  }

  const topDistance = elementRect.top - parentRect.top;
  const bottomDistance = parentRect.bottom - elementRect.bottom;
  expect(topDistance).toBeCloseTo(bottomDistance, 0);
};
