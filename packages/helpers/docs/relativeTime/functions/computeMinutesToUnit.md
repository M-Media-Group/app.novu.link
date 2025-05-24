[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../modules.md) / [relativeTime](../README.md) / computeMinutesToUnit

# Function: computeMinutesToUnit()

> **computeMinutesToUnit**(`minutes`, `unit`): `number`

Defined in: [relativeTime.ts:83](https://github.com/M-Media-Group/app.novu.link/blob/d43aa75d61cafdf214ab3b4b66ffcaae1fde7b4e/packages/helpers/src/relativeTime.ts#L83)

Converts a number of minutes to the corresponding unit based on the provided unit type. It divides the number of minutes by the appropriate factor for hours (60), days (1440), or weeks (10080). If the unit is minutes, it simply returns the original number of minutes.

## Parameters

### minutes

`number`

The number of minutes to convert

### unit

[`TimeUnit`](../enumerations/TimeUnit.md)

The unit to convert the minutes to (hour, day, week, or minute)

## Returns

`number`
