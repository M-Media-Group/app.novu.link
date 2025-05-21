import { describe, expect, it, vi } from "vitest";
import {
  type RequiredEmits,
  type RequiredProps,
  useMultiselect,
} from "../useMultiselect.js";

// Setup the spy on emit, so we can check if it was called
const emit = vi.spyOn(
  {
    emit: () => {
      console.log("emit");
    },
  },
  "emit"
) as unknown as RequiredEmits;

describe("useMultiselect", () => {
  // Mock props and emit function
  const props = {
    options: [
      { id: "1", render: "Option 1", disabled: false },
      { id: "2", render: "Option 2", disabled: true },
      { id: "3", render: "Option 3", disabled: false },
    ],
    displayKey: "render",
    multiple: true,
    modelValue: ["1"],
    modelKey: "id",
  } as RequiredProps<undefined>;

  it("should compute normalisedOptions correctly", async () => {
    const { normalisedOptions } = useMultiselect(props, emit);
    expect(normalisedOptions.value).toEqual([
      { id: "1", render: "Option 1", disabled: false },
      { id: "2", render: "Option 2", disabled: true },
      { id: "3", render: "Option 3", disabled: false },
    ]);
  });

  it("should compute selectableOptions correctly", async () => {
    const { selectableOptions } = useMultiselect(props, emit);
    expect(selectableOptions.value).toEqual([
      { id: "1", render: "Option 1", disabled: false },
      { id: "3", render: "Option 3", disabled: false },
    ]);
  });

  it("should return correct label for an option", async () => {
    const { getLabel } = useMultiselect(props, emit);
    expect(getLabel({ id: "1", render: "Option 1", disabled: false })).toBe(
      "Option 1"
    );
  });

  it("should update modelValue correctly when a value is selected", async () => {
    const { updateModelValue } = useMultiselect(props, emit);
    updateModelValue("2", true);
    expect(emit).toHaveBeenCalledWith("update:modelValue", ["1", "2"]);
  });

  it("should update modelValue correctly when a value is unselected", async () => {
    const { updateModelValue } = useMultiselect(props, emit);
    updateModelValue("1", false);
    expect(emit).toHaveBeenCalledWith("update:modelValue", []);
  });
});
