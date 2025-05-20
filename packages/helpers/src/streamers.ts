type Product = Record<string | number | symbol, unknown>;
type ProductsArray = Product[];

// Utility to clean the JSON string fragments
export const cleanJSONString = (str: string) => {
  if (str.endsWith(",")) str = str.slice(0, -1);
  if (str.startsWith("[")) str = str.slice(1);
  if (str.endsWith("]")) str = str.slice(0, -1);
  return str;
};

// Updated utility to handle streamed response, pushing results into the local products array
export const parseStreamedResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  productsArray: ProductsArray
) => {
  const decoder = new TextDecoder("utf-8");
  let accumulatedData = "";


  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    accumulatedData += decoder.decode(value, { stream: true });
    const objects = accumulatedData.split("\n");

    for (let i = 0; i < objects.length - 1; i++) {
      let objectString = objects[i].trim();
      objectString = cleanJSONString(objectString);
      if (objectString) {
        try {
          const product = JSON.parse(objectString);
          productsArray.push(product); // Use the local array
        } catch (error) {
          console.error("Error parsing JSON object:", error);
          console.error("Invalid JSON string:", objectString);
        }
      }
    }

    accumulatedData = objects[objects.length - 1];
  }

  if (accumulatedData) {
    parseRemainingData(accumulatedData, productsArray);
  }
};

// Updated parseRemainingData to use the local products array
export const parseRemainingData = (data: string, productsArray: ProductsArray) => {
  try {
    data = cleanJSONString(data);
    if (!data || data === "[]") return;

    const lastProductsArray = JSON.parse(`[${data}]`);
    lastProductsArray.forEach((product: Product) => {
      productsArray.push(product); // Use the local array
    });
  } catch (error) {
    console.error("Error parsing remaining JSON object:", error);
    console.error("Remaining data:", data);
  }
};
