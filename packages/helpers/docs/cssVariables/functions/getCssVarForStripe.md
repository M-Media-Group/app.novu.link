[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../README.md) / [cssVariables](../README.md) / getCssVarForStripe

# Function: getCssVarForStripe()

> **getCssVarForStripe**(`cssVariable`): `string`

Defined in: [cssVariables.ts:10](https://github.com/M-Media-Group/app.novu.link/blob/185285297b092339554122b4cf56a2dcd7525fea/packages/helpers/src/cssVariables.ts#L10)

Get the value of a CSS variable. Apply some extra logic useful for Stripe, like coverting > 100% to pixels, and converting hsl to rgb.

Used primarily to sync app CSS variables with Stripe Elements.

## Parameters

### cssVariable

`string`

The CSS variable to get the value of, without the `--` prefix.

## Returns

`string`
