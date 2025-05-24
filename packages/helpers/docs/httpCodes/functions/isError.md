[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../README.md) / [httpCodes](../README.md) / isError

# Function: isError()

> **isError**(`code`): `boolean`

Defined in: [httpCodes.ts:6](https://github.com/M-Media-Group/app.novu.link/blob/185285297b092339554122b4cf56a2dcd7525fea/packages/helpers/src/httpCodes.ts#L6)

Determine if the status code is an error that should be displayed to the user as an error, commonly with a "Fix now" message.

## Parameters

### code

`number`

## Returns

`boolean`

true if the error code is of any status code: 400 or higher, or lower than 200, but not 429, 401, 204, or 403.
