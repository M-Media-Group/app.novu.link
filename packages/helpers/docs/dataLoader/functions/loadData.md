[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../modules.md) / [dataLoader](../README.md) / loadData

# Function: loadData()

> **loadData**\<`T`\>(`dataset`, `localeToUse`, `basePath`): `Promise`\<`T`[]\>

Defined in: [dataLoader.ts:8](https://github.com/M-Media-Group/app.novu.link/blob/d43aa75d61cafdf214ab3b4b66ffcaae1fde7b4e/packages/helpers/src/dataLoader.ts#L8)

A helper function to load data from a JSON file.

## Type Parameters

### T

`T` = \{[`key`: `string`]: `null` \| `string` \| `number` \| `boolean` \| `object`; `description?`: `string`; `name?`: `string`; \}

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
