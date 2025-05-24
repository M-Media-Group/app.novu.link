import type { HexColor } from "@novulink/types";

/**
 * Converts an HSL color value to RGB.
 *
 * @returns an array of R, G, and B values, each between 0 and 255.
 */
export const hsl2rgb = (h: number, s: number, l: number): [number, number, number] => {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number, k = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255)) as [number, number, number];
};

/**
 * Get the contrast ratio between two hex colors.
 *
 * @param color1
 * @param color2
 * @returns the contrast ratio between two hex colors as a number between 1 and 21, where 1 is no contrast and 21 is maximum contrast.
 */
export const getContrastRatio = (color1: HexColor, color2: HexColor) => {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  return (
    (Math.max(luminance1, luminance2) + 0.05) /
    (Math.min(luminance1, luminance2) + 0.05)
  );
};

/**
 * Check if two colors have sufficient contrast.
 *
 * @param color1 a hex color
 * @param color2 a hex color
 * @param threshold a number between 1 and 21, where 1 is no contrast and 21 is maximum contrast. Default is 3, which is equivalent to the WCAG AA standard for normal text.
 * @returns
 */
export const hasSufficientContrast =
  (color1: HexColor, color2: HexColor, threshold = 3) =>
    getContrastRatio(color1, color2) >= threshold;

/**
 *
 * @param color - The hex color to convert
 * @returns The luminance of the color as a number between 0 and 1 where 0 is black and 1 is white
 */
export const getLuminance = (color: HexColor) => {
  const rgb = hexToRgb(color);
  const srgb = rgb.map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

/**
 * Converts a hex color to an RGB array.
 *
 * @param hex - The hex color to convert
 * @returns The RGB array
 */
export const hexToRgb = (hex: HexColor): [number, number, number] => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(
    shorthandRegex,
    (m, r, g, b) => r + r + g + g + b + b
  ) as HexColor;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error("Invalid hex color");
  }

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
};
