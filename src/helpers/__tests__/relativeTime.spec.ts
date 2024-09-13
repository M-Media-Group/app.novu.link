import { describe, expect, it, vi } from "vitest";
import { relativeTime } from "../relativeTime";

describe("relativeTime", () => {
  // Mock Date.now to have consistent test results
  const now = new Date("2024-09-13T12:00:00Z").getTime();
  vi.spyOn(Date, "now").mockImplementation(() => now);

  it("should return relative time in minutes when the date is less than an hour away", () => {
    const thirtyMinutesLater = new Date(now + 30 * 60 * 1000);
    expect(relativeTime(thirtyMinutesLater)).toBe("in 30 minutes");

    const tenMinutesAgo = new Date(now - 10 * 60 * 1000);
    expect(relativeTime(tenMinutesAgo)).toBe("10 minutes ago");
  });

  it("should return relative time in hours when the date is 1 to 3 days away", () => {
    const twoHoursLater = new Date(now + 2 * 60 * 60 * 1000);
    expect(relativeTime(twoHoursLater)).toBe("in 2 hours");

    const threeHoursAgo = new Date(now - 3 * 60 * 60 * 1000);
    expect(relativeTime(threeHoursAgo)).toBe("3 hours ago");
  });

  it("should return relative time in days when the date is 4 to 13 days away", () => {
    const fiveDaysLater = new Date(now + 5 * 24 * 60 * 60 * 1000);
    expect(relativeTime(fiveDaysLater)).toBe("in 5 days");

    const sixDaysAgo = new Date(now - 6 * 24 * 60 * 60 * 1000);
    expect(relativeTime(sixDaysAgo)).toBe("6 days ago");
  });

  it("should return relative time in weeks when the date is 14 to 29 days away", () => {
    const fifteenDaysLater = new Date(now + 15 * 24 * 60 * 60 * 1000);
    expect(relativeTime(fifteenDaysLater)).toBe("in 2 weeks");

    const twentyDaysAgo = new Date(now - 20 * 24 * 60 * 60 * 1000);
    expect(relativeTime(twentyDaysAgo)).toBe("3 weeks ago");
  });

  it("should return relative time in months when the date is 30 or more days away", () => {
    const fortyDaysLater = new Date(now + 40 * 24 * 60 * 60 * 1000);
    expect(relativeTime(fortyDaysLater)).toBe("next month");

    const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
    expect(relativeTime(ninetyDaysAgo)).toBe("3 months ago");
  });

  it("should handle string input for the date", () => {
    const dateString = "2024-09-15T12:00:00Z";
    expect(relativeTime(dateString)).toBe("in 48 hours");
  });
});
