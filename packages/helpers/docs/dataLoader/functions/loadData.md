[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../README.md) / [dataLoader](../README.md) / loadData

# Function: loadData()

> **loadData**\<`T`\>(`dataset`, `localeToUse`, `basePath`): `Promise`\<`T`[]\>

Defined in: [dataLoader.ts:8](https://github.com/M-Media-Group/app.novu.link/blob/185285297b092339554122b4cf56a2dcd7525fea/packages/helpers/src/dataLoader.ts#L8)

A helper function to load data from a JSON file.

## Type Parameters

### T

`T` = \{[`key`: `string`]: `undefined` \| `null` \| `string` \| `number` \| `boolean` \| `object`; `description?`: `string`; `name?`: `string`; \}

## Parameters

### dataset

`string` = `"features"`

the dataset to load, defaults to "features"

### localeToUse

`string` = `"en"`

the locale to use, defaults to "en"

### basePath

`string` = `'@/data'`

the base path to the data directory, defaults to '@/data'

## Returns

`Promise`\<`T`[]\>
