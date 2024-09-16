import i18n from "../locales/i18n";

/**
 * This function takes a Date object, and using new Intl.RelativeTimeFormat, returns a string representing the relative time between the input date and the current date. It returns a string like "in 5 days" or "3 months ago" based on the difference between the input date and the current date.
 *
 * @param date - The date to compare to the current date
 * @returns A string representing the relative time between the input date and the current date
 */
export const relativeTime = (date: Date | string): string => {
  if (typeof date === "string") {
    date = new Date(date);
  }

  const rtf = new Intl.RelativeTimeFormat(i18n.global.locale.value, {
    numeric: "auto",
  });

  const diff = date.getTime() - Date.now();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);

  const absoluteMinutes = Math.abs(minutes);
  const absoluteHours = Math.abs(hours);
  const absoluteDays = Math.abs(days);

  // Less than 1 hour should be in minutes
  if (absoluteMinutes < 60) {
    return rtf.format(minutes, "minute");
  }

  // Less than 2 day should be in hours
  if (absoluteHours < 49) {
    return rtf.format(hours, "hour");
  }

  // Less than 2 weeks should be in days
  if (absoluteDays < 14) {
    return rtf.format(days, "day");
  }

  // Less than 1 month should be in weeks
  if (absoluteDays < 30) {
    return rtf.format(weeks, "week");
  }

  // Else it should be in months
  return rtf.format(months, "month");
};