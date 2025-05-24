[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../README.md) / [relativeTime](../README.md) / relativeTime

# Function: relativeTime()

> **relativeTime**(`date`, `locale`): `string`

Defined in: [relativeTime.ts:14](https://github.com/M-Media-Group/app.novu.link/blob/185285297b092339554122b4cf56a2dcd7525fea/packages/helpers/src/relativeTime.ts#L14)

This function takes a Date object, and using new Intl.RelativeTimeFormat, returns a string representing the relative time between the input date and the current date. It returns a string like "in 5 days" or "3 months ago" based on the difference between the input date and the current date.

## Parameters

### date

The date to compare to the current date

`string` | `Date`

### locale

`string` | readonly `string`[]

## Returns

`string`

A string representing the relative time between the input date and the current date
