[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../README.md) / [colors](../README.md) / hasSufficientContrast

# Function: hasSufficientContrast()

> **hasSufficientContrast**(`color1`, `color2`, `threshold`): `boolean`

Defined in: [colors.ts:41](https://github.com/M-Media-Group/app.novu.link/blob/185285297b092339554122b4cf56a2dcd7525fea/packages/helpers/src/colors.ts#L41)

Check if two colors have sufficient contrast.

## Parameters

### color1

`` `#${string}` ``

a hex color

### color2

`` `#${string}` ``

a hex color

### threshold

`number` = `3`

a number between 1 and 21, where 1 is no contrast and 21 is maximum contrast. Default is 3, which is equivalent to the WCAG AA standard for normal text.

## Returns

`boolean`
