[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../modules.md) / [hasMethod](../README.md) / flattenObjectToDotNotationWithArrayAndStopAtKey

# Function: flattenObjectToDotNotationWithArrayAndStopAtKey()

> **flattenObjectToDotNotationWithArrayAndStopAtKey**\<`T`\>(`obj`, `parentKey`, `result`, `stopKey`): `Record`\<`string`, `FlattenedValue`\>

Defined in: [hasMethod.ts:62](https://github.com/M-Media-Group/app.novu.link/blob/d43aa75d61cafdf214ab3b4b66ffcaae1fde7b4e/packages/helpers/src/hasMethod.ts#L62)

Recursively flattens a nested object into dot notation,
stopping at a specific key (default "_errors").

Used primarily to unify error messages from different sources.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `FlattenedValue`\>

## Parameters

### obj

`T`

### parentKey

`string` = `""`

### result

`Record`\<`string`, `FlattenedValue`\> = `{}`

### stopKey

`string` = `"_errors"`

## Returns

`Record`\<`string`, `FlattenedValue`\>

## Example

```ts
const dataToFlatten = {a: [{ b: [{ _errors: ["Error"] }] }]};
const output = flattenObjectToDotNotationWithArrayAndStopAtKey(dataToFlatten);
return output === {
 "a.0.b.0": ["Error"]
};
```
