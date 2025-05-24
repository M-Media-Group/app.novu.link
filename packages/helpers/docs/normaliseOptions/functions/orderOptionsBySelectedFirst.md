[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../modules.md) / [normaliseOptions](../README.md) / orderOptionsBySelectedFirst

# Function: orderOptionsBySelectedFirst()

> **orderOptionsBySelectedFirst**\<`T`\>(`options`, `selected`, `key`): `NormalisedOptionObject`\<`SelectOptionObject`\<`T`\>\>[]

Defined in: [normaliseOptions.ts:60](https://github.com/M-Media-Group/app.novu.link/blob/d43aa75d61cafdf214ab3b4b66ffcaae1fde7b4e/packages/helpers/src/normaliseOptions.ts#L60)

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
