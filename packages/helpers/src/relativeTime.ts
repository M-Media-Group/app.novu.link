export enum TimeUnit {
  minute = "minute",
  hour = "hour",
  day = "day",
  week = "week",
}

/**
 * This function takes a Date object, and using new Intl.RelativeTimeFormat, returns a string representing the relative time between the input date and the current date. It returns a string like "in 5 days" or "3 months ago" based on the difference between the input date and the current date.
 *
 * @param date - The date to compare to the current date
 * @returns A string representing the relative time between the input date and the current date
 */
export const relativeTime = (date: Date | string, locale: string | readonly string[] = navigator.languages): string => {
  if (typeof date === "string") {
    date = new Date(date);
  }

  const rtf = new Intl.RelativeTimeFormat(locale, {
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

/**
 * Selects the best unit for a given number of minutes. It checks if the number of minutes is divisible by 10080 (weeks), 1440 (days), or 60 (hours) and returns the corresponding unit. If none of these conditions are met, it defaults to minutes.
 *
 * @param minutes - The number of minutes to select the best unit for
 * @returns
 */
export const selectBestUnit = (minutes: number): TimeUnit => {
  if (minutes % 10080 === 0) {
    return TimeUnit.week;
  } else if (minutes % 1440 === 0) {
    return TimeUnit.day;
  } else if (minutes % 60 === 0) {
    return TimeUnit.hour;
  } else {
    return TimeUnit.minute;
  }
};

/**
 * Converts a number of minutes to the corresponding unit based on the provided unit type. It divides the number of minutes by the appropriate factor for hours (60), days (1440), or weeks (10080). If the unit is minutes, it simply returns the original number of minutes.
 *
 * @param minutes - The number of minutes to convert
 * @param unit - The unit to convert the minutes to (hour, day, week, or minute)
 * @returns
 */
export const computeMinutesToUnit = (minutes: number, unit: TimeUnit) => {
  switch (unit) {
    case TimeUnit.hour:
      return minutes / 60;
    case TimeUnit.day:
      return minutes / 1440;
    case TimeUnit.week:
      return minutes / 10080;
    default:
      return minutes;
  }
};

/**
 * Uses Intl.NumberFormat to format a number with the current locale and, if provided with unit, appends the unit to the number. It will automatically determine the units to use based on the number. If it is divisible by 60, it will return an hour, if it is divisible by 24, it will return a day, and so on.
 *
 * @param minutes
 * @returns A string representing the number of minutes in a human-readable format
 */
export const formatMinutes = (minutes: number, locale = navigator.languages): string => {
  const unit = selectBestUnit(minutes);

  const mutableLocale = Array.isArray(locale) ? locale[0] : locale;

  return new Intl.NumberFormat(mutableLocale, {
    style: "unit",
    unit: unit.toString(),
    unitDisplay: "long",
  }).format(computeMinutesToUnit(minutes, unit));
};

/**
 * Converts a value in a given time unit (minutes, hours, days) to minutes.
 *
 * @param value - The value to convert
 * @param timeUnit - The time unit of the value
 * @returns The value converted to minutes
 */
export const formatToMinutes = (
  value: number,
  timeUnit: TimeUnit
): number => {
  switch (timeUnit) {
    case TimeUnit.minute:
      return value;
    case TimeUnit.hour:
      return value * 60;
    case TimeUnit.day:
      return value * 60 * 24;
    default:
      return value;
  }
};
