import { computed, ref, watch } from "vue";
import axios from "axios";
import type { Attribute, Product, Variant } from "@/types/product";
import { debounce } from "@/helpers/debounce";

const products = ref([] as Product[]);
const currentPage = ref(1);
const hasMoreProducts = ref(true);
const isLoading = ref(false);

const baseURL = import.meta.env.VITE_API_URL;

const getProducts = async (page = 1) => {
  const response = await fetch(
    `${baseURL}/api/v1/products?page=${page}&stream=true`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch products");
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  let accumulatedData = "";

  if (reader) {
    while (true!) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and accumulate
      accumulatedData += decoder.decode(value, { stream: true });

      // Split the accumulated data into individual objects
      const objects = accumulatedData.split("\n");

      // Process each complete JSON object except the last one
      for (let i = 0; i < objects.length - 1; i++) {
        let objectString = objects[i].trim();
        // If it ends with a comma, remove it
        if (objectString.endsWith(",")) {
          objectString = objectString.slice(0, -1);
        }
        if (objectString.startsWith("[")) {
          objectString = objectString.slice(1);
        }
        if (objectString) {
          try {
            const product = JSON.parse(objectString);
            products.value.push(product);
            console.log("Product:", product); // Log the product
          } catch (error) {
            console.error("Error parsing JSON object:", error);
            console.error("Invalid JSON string:", objectString); // Log the invalid string for debugging
          }
        }
      }

      // Keep the last partial object for the next iteration
      accumulatedData = objects[objects.length - 1];
    }

    // Handle any remaining data after the stream ends
    if (accumulatedData) {
      try {
        if (accumulatedData.startsWith("[")) {
          accumulatedData = accumulatedData.slice(1);
        }
        if (accumulatedData.endsWith(",")) {
          accumulatedData = accumulatedData.slice(0, -1);
        }
        if (accumulatedData.endsWith("]")) {
          accumulatedData = accumulatedData.slice(0, -1);
        }

        // If there is no accumulated data, return
        if (!accumulatedData || accumulatedData === "[]") {
          return [];
        }

        const lastProductsArray = JSON.parse(`[${accumulatedData}]`); // Wrap the remaining data in brackets
        lastProductsArray.forEach((product: Product) => {
          products.value.push(product);
        });
      } catch (error) {
        console.error("Error parsing remaining JSON object:", error);
        console.error("Remaining data:", accumulatedData); // Log remaining data for debugging
      }
    }
  }
  return products.value;
};

const getProduct = async (id: Product["id"]): Promise<Product | null> => {
  const response = await axios.get("/api/v1/products/" + id);

  if (!response.data) {
    return null;
  }

  return response.data;
};

/**
 * Function to get the minimum price from a product.
 * @param product - The product to get the minimum price from.
 * @returns The minimum price or null if no prices are available.
 */
function getMinimumPrice(product: Product): number | null {
  const allPrices = product.variants.flatMap((variant) => variant.prices);
  if (allPrices.length === 0) {
    return null; // No prices available
  }

  const minPrice = Math.min(...allPrices.map((price) => price.priceWithTax));
  return minPrice;
}

/**
 * Function to get the maximum price from a product.
 * @param product - The product to get the maximum price from.
 * @returns The maximum price or null if no prices are available.
 */
function getMaximumPrice(product: Product): number | null {
  const allPrices = product.variants.flatMap((variant) => variant.prices);
  if (allPrices.length === 0) {
    return null; // No prices available
  }

  const maxPrice = Math.max(...allPrices.map((price) => price.priceWithTax));
  return maxPrice;
}

/**
 * Function to find a variant of a product based on given attributes.
 * @param product - The product to search for the variant.
 * @param attributesToMatch - An array of attributes to match against the variants.
 * @returns The matching variant or null if not found.
 */
function findVariantByAttributes(
  product: Product,
  attributesToMatch: Attribute[]
): Variant | null {
  const variants = [];
  // Iterate over the variants of the product
  for (const variant of product.variants) {
    // Check if the variant has all the attributes to match
    if (
      attributesToMatch.every((attrToMatch) =>
        variant.attributes.some(
          (attr) =>
            attr.name === attrToMatch.name && attr.value === attrToMatch.value
        )
      )
    ) {
      const score = attributesToMatch.filter((attrToMatch) =>
        variant.attributes.some(
          (attr) =>
            attr.name === attrToMatch.name && attr.value === attrToMatch.value
        )
      ).length;
      // If ok, add the variant to the list
      variants.push({
        variant,
        score,
      });
    }
  }

  if (variants.length === 1) {
    return variants[0].variant;
  }

  // Sort the variants by the score
  variants.sort((a, b) => b.score - a.score);

  // Return the variant with the highest score
  if (variants.length > 0) {
    return variants[0].variant;
  }

  return null; // Return null if no matching variant is found
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).format(price);
}

const loadMoreProducts = async () => {
  if (!hasMoreProducts.value || isLoading.value) {
    return;
  }

  isLoading.value = true;
  const newProducts = await getProducts(currentPage.value);
  isLoading.value = false;

  if (!newProducts) {
    return;
  }
  //   Deduplicate the products via set
  products.value = [...new Set([...products.value, ...newProducts])];

  if (newProducts?.length === 0) {
    hasMoreProducts.value = false;
    return;
  }

  currentPage.value += 1;
};

const debounceLoadMoreProducts = debounce(loadMoreProducts);

/**
 * Get all the images
 *
 * @param product - The product to get the images from
 * @returns An array of image URLs
 */
function getAllImages(product: {
  image: string;
  variants?: { imageUrl: string }[];
}): string[] {
  const variantImages = product.variants?.flatMap(
    (variant) => variant.imageUrl
  );
  if (!variantImages) {
    return [product.image];
  }
  return [...new Set([product.image, ...variantImages])].filter(Boolean);
}

/**
 * All the attributes across all products
 *
 * This computed property will return all the attributes across all products.
 *
 * @returns An object with all the attributes and their values
 */
const allAttributes = computed((): Attribute[] => {
  const attributes: Attribute[] = [];

  products.value.forEach((product) => {
    product.attributes?.forEach((attribute) => {
      const existingAttribute = attributes.find(
        (attr) => attr.name === attribute.name
      );
      if (existingAttribute) {
        if (Array.isArray(attribute.value)) {
          existingAttribute.value = [
            ...new Set([...existingAttribute.value, ...attribute.value]),
          ];
        } else {
          existingAttribute.value = [
            ...new Set([...existingAttribute.value, attribute.value]),
          ];
        }
      } else {
        attributes.push({ ...attribute });
      }
    });
  });

  return attributes;
});

export const useProducts = () => {
  const loadedProduct = ref(null as Product | null);
  const isLoadingProduct = ref(false);

  const selectedVariant = ref(null as Variant | null);

  const selectedAttributes = ref([] as Attribute[]);

  const minProductsToTriggerLoadMore = ref(0);

  const loadProduct = async (id: Product["id"]) => {
    if (isLoadingProduct.value) {
      return;
    }
    isLoadingProduct.value = true;
    selectedVariant.value = null;
    selectedAttributes.value = [];
    loadedProduct.value = await getProduct(id);

    isLoadingProduct.value = false;

    // If there is only one variant, select it
    if (loadedProduct.value?.variants.length === 1) {
      selectedVariant.value = loadedProduct.value.variants[0];
      return;
    }

    // Select the first value for each attribute
    Object.keys(loadedProduct.value!.attributes).forEach((attributeName) => {
      handleSelectedAttribute(
        attributeName,
        loadedProduct.value!.attributes.find(
          (attr) => attr.name === attributeName
        )?.value ?? null
      );
    });
  };

  const handleSelectedAttribute = (
    key: string,
    value: string | string[] | null
  ) => {
    if (!loadedProduct.value) {
      return;
    }

    // If the selected value is null, remove the attribute
    if (!value) {
      selectedAttributes.value = selectedAttributes.value.filter(
        (attr) => attr.name !== key
      );
      selectedVariant.value =
        findVariantByAttributes(
          loadedProduct.value,
          selectedAttributes.value
        ) ?? null;
      return;
    }

    selectedAttributes.value = [
      ...selectedAttributes.value.filter((attr) => attr.name !== key),
      { name: key, value },
    ];

    selectedVariant.value =
      findVariantByAttributes(loadedProduct.value, selectedAttributes.value) ??
      null;
  };

  const searchTerm = ref("");

  /**
   * Products filtered by selected attributes
   *
   * This computed property will return all products that match the selected attributes.
   */
  const filteredProducts = computed(() => {
    let filteredProducts = products.value;
    // if there is a search term, filter by it
    if (searchTerm.value.length > 2) {
      filteredProducts = products.value.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    }

    if (!selectedAttributes.value.length) {
      return filteredProducts;
    }

    return filteredProducts.filter((product) =>
      selectedAttributes.value.every((selectedAttr) =>
        product.variants.some((variant) =>
          variant.attributes.some(
            (attr) =>
              attr.name === selectedAttr.name &&
              attr.value === selectedAttr.value
          )
        )
      )
    );
  });

  //   Watch the filteredProducts. If less than 3 products are left, load more products
  watch(filteredProducts, (newProducts) => {
    if (newProducts.length <= minProductsToTriggerLoadMore.value) {
      debounceLoadMoreProducts();
    }
  });

  return {
    minProductsToTriggerLoadMore,
    products,
    loadedProduct,
    loadMoreProducts,
    loadProduct,
    isLoadingProduct,
    hasMoreProducts,
    isLoading,
    getMinimumPrice,
    getMaximumPrice,
    findVariantByAttributes,
    selectedVariant,
    selectedAttributes,
    handleSelectedAttribute,
    formatPrice,
    getAllImages,
    filteredProducts,
    allAttributes,
    searchTerm,
  };
};
