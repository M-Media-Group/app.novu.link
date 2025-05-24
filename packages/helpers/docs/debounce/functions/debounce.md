[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../README.md) / [debounce](../README.md) / debounce

# Function: debounce()

> **debounce**\<`Args`\>(`fn`, `delay`, `leading`): (...`args`) => `void`

Defined in: [debounce.ts:14](https://github.com/M-Media-Group/app.novu.link/blob/185285297b092339554122b4cf56a2dcd7525fea/packages/helpers/src/debounce.ts#L14)

This function debounces a function

## Type Parameters

### Args

`Args` *extends* `unknown`[]

## Parameters

### fn

(...`args`) => `void`

The function to debounce

### delay

`number` = `300`

The delay in milliseconds

### leading

`boolean` = `false`

If the function should be called on the leading edge or the trailing edge (first-in triggers the function vs last-in triggers the function)

## Returns

> (...`args`): `void`

### Parameters

#### args

...`Args`

### Returns

`void`

## Example

```ts
const debounced = debounce(() => console.log('Hello World'), 300);
debounced(); // This will log 'Hello World' after 300ms
```
