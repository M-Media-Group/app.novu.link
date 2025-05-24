[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../README.md) / [normaliseOptions](../README.md) / orderOptionsBySelectedFirst

# Function: orderOptionsBySelectedFirst()

> **orderOptionsBySelectedFirst**\<`T`\>(`options`, `selected`, `key`): `NormalisedOptionObject`\<`SelectOptionObject`\<`T`\>\>[]

Defined in: [normaliseOptions.ts:60](https://github.com/M-Media-Group/app.novu.link/blob/185285297b092339554122b4cf56a2dcd7525fea/packages/helpers/src/normaliseOptions.ts#L60)

Orders options by placing selected ones first, preserving original order otherwise

## Type Parameters

### T

`T` *extends* `PossibleRecord`

## Parameters

### options

`NormalisedOptionObject`\<`SelectOptionObject`\<`T`\>\>[]

### selected

`string`[]

### key

`"id"` | `"render"` | `"disabled"` | `"raw"` | `"badge"`

## Returns

`NormalisedOptionObject`\<`SelectOptionObject`\<`T`\>\>[]
