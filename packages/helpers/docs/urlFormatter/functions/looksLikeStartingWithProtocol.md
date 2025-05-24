[**@novulink/helpers**](../../README.md)

***

[@novulink/helpers](../../modules.md) / [urlFormatter](../README.md) / looksLikeStartingWithProtocol

# Function: looksLikeStartingWithProtocol()

> **looksLikeStartingWithProtocol**(`url`): `boolean`

Defined in: [urlFormatter.ts:59](https://github.com/M-Media-Group/app.novu.link/blob/d43aa75d61cafdf214ab3b4b66ffcaae1fde7b4e/packages/helpers/src/urlFormatter.ts#L59)

Returns true if a string looks like it is starting with a protocol. This is useful when passing partially written or incomplete URLs and determening if we should add a protocol to it even if the string isn't a valid URL yet.

It will return true if the first letter is an "h" or "H" and the second letter is a "t" or "T", etc

"h" will return true
"ht" will return true
"htt" will return true
"hot" will return false
"a" will return false
"htp" will return false
"http" will return true
"https:/a" will return false

## Parameters

### url

`string`

## Returns

`boolean`
