import { describe, expect, it } from "vitest";
import { getContrastRatio, getLuminance, hasSufficientContrast, hexToRgb, hsl2rgb } from "../colors.js";

describe("hsl2rgb", () => {
    it("should convert HSL to RGB correctly", () => {
        // h=0 (red), s=1, l=0.5 => pure red
        expect(hsl2rgb(0, 1, 0.5).map(Math.round)).toEqual([255, 0, 0]);
        // h=120 (green), s=1, l=0.5 => pure green
        expect(hsl2rgb(120, 1, 0.5).map(Math.round)).toEqual([0, 255, 0]);
        // h=240 (blue), s=1, l=0.5 => pure blue
        expect(hsl2rgb(240, 1, 0.5).map(Math.round)).toEqual([0, 0, 255]);
        // h=0, s=0, l=0.5 => gray
        expect(hsl2rgb(0, 0, 0.5).map(Math.round)).toEqual([128, 128, 128]);
    });
});

describe("hexToRgb", () => {
    it("should convert 6-digit hex to RGB", () => {
        expect(hexToRgb("#ff0000")).toEqual([255, 0, 0]);
        expect(hexToRgb("#00ff00")).toEqual([0, 255, 0]);
        expect(hexToRgb("#0000ff")).toEqual([0, 0, 255]);
        expect(hexToRgb("#123456")).toEqual([18, 52, 86]);
    });

    it("should convert 3-digit hex to RGB", () => {
        expect(hexToRgb("#f00")).toEqual([255, 0, 0]);
        expect(hexToRgb("#0f0")).toEqual([0, 255, 0]);
        expect(hexToRgb("#00f")).toEqual([0, 0, 255]);
    });

    it("should throw on invalid hex", () => {
        expect(() => hexToRgb("#xyz")).toThrow();
        // @ts-expect-error since we are passing a string not starting with #
        expect(() => hexToRgb("12345")).toThrow();
        expect(() => hexToRgb("#12")).toThrow();
    });
});

describe("getLuminance", () => {
    it("should calculate luminance for white", () => {
        expect(getLuminance("#ffffff")).toBeCloseTo(1, 5);
    });

    it("should calculate luminance for black", () => {
        expect(getLuminance("#000000")).toBeCloseTo(0, 5);
    });

    it("should calculate luminance for red", () => {
        expect(getLuminance("#ff0000")).toBeCloseTo(0.2126, 4);
    });

    it("should calculate luminance for green", () => {
        expect(getLuminance("#00ff00")).toBeCloseTo(0.7152, 4);
    });

    it("should calculate luminance for blue", () => {
        expect(getLuminance("#0000ff")).toBeCloseTo(0.0722, 4);
    });
});

describe("getContrastRatio", () => {
    it("should return 21 for black and white", () => {
        expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    });

    it("should return 1 for same color", () => {
        expect(getContrastRatio("#123456", "#123456")).toBeCloseTo(1, 5);
    });

    it("should return correct ratio for red and green", () => {
        const ratio = getContrastRatio("#ff0000", "#00ff00");
        expect(ratio).toBeGreaterThan(2);
        expect(ratio).toBeLessThan(3);
    });
});

describe("hasSufficientContrast", () => {
    it("should return true for black and white", () => {
        expect(hasSufficientContrast("#000000", "#ffffff")).toBe(true);
    });

    it("should return false for same color", () => {
        expect(hasSufficientContrast("#123456", "#123456")).toBe(false);
    });

    it("should return true for red and green with threshold 2", () => {
        const ratio = hasSufficientContrast("#ff0000", "#00ff00", 2);
        expect(ratio).toBe(true);
    });
});