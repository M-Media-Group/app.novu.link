[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../README.md) / [normaliseOptions](../README.md) / normaliseOptions

# Function: normaliseOptions()

> **normaliseOptions**\<`T`\>(`options?`): `NormalisedOptionObject`\<`SelectOptionObject`\<`T`\>\>[]

Defined in: [normaliseOptions.ts:4](https://github.com/M-Media-Group/app.novu.link/blob/185285297b092339554122b4cf56a2dcd7525fea/packages/helpers/src/normaliseOptions.ts#L4)

Since we support either a callback or a string, we need to normalize the options to always have a render function

## Type Parameters

### T

`T` *extends* `PossibleRecord`

## Parameters

### options?

`SelectOption`\<`T`\>[]

## Returns

`NormalisedOptionObject`\<`SelectOptionObject`\<`T`\>\>[]
