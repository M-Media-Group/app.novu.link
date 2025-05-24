[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../README.md) / [relativeTime](../README.md) / selectBestUnit

# Function: selectBestUnit()

> **selectBestUnit**(`minutes`): [`TimeUnit`](../enumerations/TimeUnit.md)

Defined in: [relativeTime.ts:64](https://github.com/M-Media-Group/app.novu.link/blob/185285297b092339554122b4cf56a2dcd7525fea/packages/helpers/src/relativeTime.ts#L64)

Selects the best unit for a given number of minutes. It checks if the number of minutes is divisible by 10080 (weeks), 1440 (days), or 60 (hours) and returns the corresponding unit. If none of these conditions are met, it defaults to minutes.

## Parameters

### minutes

`number`

The number of minutes to select the best unit for

## Returns

[`TimeUnit`](../enumerations/TimeUnit.md)
