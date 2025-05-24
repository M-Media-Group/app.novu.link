[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../modules.md) / [relativeTime](../README.md) / formatMinutes

# Function: formatMinutes()

> **formatMinutes**(`minutes`, `locale`): `string`

Defined in: [relativeTime.ts:102](https://github.com/M-Media-Group/app.novu.link/blob/d43aa75d61cafdf214ab3b4b66ffcaae1fde7b4e/packages/helpers/src/relativeTime.ts#L102)

Uses Intl.NumberFormat to format a number with the current locale and, if provided with unit, appends the unit to the number. It will automatically determine the units to use based on the number. If it is divisible by 60, it will return an hour, if it is divisible by 24, it will return a day, and so on.

## Parameters

### minutes

`number`

### locale

readonly `string`[] = `navigator.languages`

## Returns

`string`

A string representing the number of minutes in a human-readable format
