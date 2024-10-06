import { computed, ref, watch } from "vue";
import axios from "axios";
import type { Attribute, Attributes, Product, Variant } from "@/types/product";
import { debounce } from "@/helpers/debounce";

const products = ref([] as Product[]);
const currentPage = ref(1);
const hasMoreProducts = ref(true);
const isLoading = ref(false);

const getProducts = async (page = 1): Promise<Product[]> => {
  const response = await axios.get("/api/v1/products?page=" + page);

  if (!response.data) {
    return [];
  }

  //   If not a product, return an empty array
  if (!Array.isArray(response.data)) {
    return [];
  }

  const data = response.data.map((product: Product) => ({
    ...product,
    prices: {
      ...product.prices,
      formattedPrice: new Intl.NumberFormat("en", {
        style: "currency",
        currency: product.prices.currency,
      }).format(product.prices.min),
      formattedShipping: new Intl.NumberFormat("en", {
        style: "currency",
        currency: product.prices.currency,
      }).format(product.prices.shipping),
    },
  }));

  return data;
};

const getProduct = async (id: Product["id"]): Promise<Product | null> => {
  const response = await axios.get("/api/v1/products/" + id);

  if (!response.data) {
    return null;
  }

  return {
    ...response.data,
    prices: {
      ...response.data.prices,
      formattedPrice: new Intl.NumberFormat("en", {
        style: "currency",
        currency: response.data.prices.currency,
      }).format(response.data.prices.price),
      formattedShipping: new Intl.NumberFormat("en", {
        style: "currency",
        currency: response.data.prices.currency,
      }).format(response.data.prices.shipping),
    },
  };
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

  console.log(variants, "variants");

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
  if (newProducts.length === 0) {
    hasMoreProducts.value = false;
    return;
  }
  currentPage.value += 1;
  products.value = [...products.value, ...newProducts];
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
  return [...new Set([product.image, ...variantImages])];
}

/**
 * All the attributes across all products
 *
 * This computed property will return all the attributes across all products.
 *
 * @returns An object with all the attributes and their values
 */
const allAttributes = computed(() => {
  const attributes: Attributes = {};

  products.value.forEach((product) => {
    Object.keys(product.attributes).forEach((attributeName) => {
      if (!attributes[attributeName]) {
        attributes[attributeName] = [];
      }

      product.attributes[attributeName].forEach((attributeValue) => {
        if (!attributes[attributeName].includes(attributeValue)) {
          attributes[attributeName].push(attributeValue);
        }
      });
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
        loadedProduct.value!.attributes[attributeName][0]
      );
    });
  };

  const handleSelectedAttribute = (key: string, value: string) => {
    if (!loadedProduct.value) {
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

  /**
   * This computed property checks which current attributes are selected, and returns the remaining attributes and attribute options that can be selected.
   *
   * It will look through all variants of the loaded product, and filter to the ones that match the currently selected attributes. It will then return the remaining attributes and their options.
   *
   * @returns An object with the all the loadedProduct.attributes, but with only the allowed values based on the already selected attributes.
   */
  const allowedAttributeValues = computed((): Attributes => {
    // If there is no product loaded, return an empty object
    if (!loadedProduct.value) {
      return {};
    }

    const allowedValues: Attributes = {};

    // Iterate over all filtered attributes
    Object.keys(loadedProduct.value.attributes).forEach(
      (attributeName, index) => {
        // If its the first attribute, just add all values
        if (index === 0) {
          allowedValues[attributeName] =
            loadedProduct.value!.attributes[attributeName];
          return;
        }
        // Get all variants that match the selected attributes so far
        const matchingVariants = loadedProduct.value!.variants.filter(
          (variant) =>
            selectedAttributes.value.every((selectedAttr) =>
              variant.attributes.some(
                (variantAttr) =>
                  variantAttr.name === selectedAttr.name &&
                  variantAttr.value === selectedAttr.value
              )
            )
        );

        // Collect the unique options for the current attribute
        const attributeOptions = new Set<string>();

        // For the variants that match, gather possible values for the current attribute
        matchingVariants.forEach((variant) => {
          const attr = variant.attributes?.find(
            (variantAttr) => variantAttr.name === attributeName
          );
          if (attr) {
            attributeOptions.add(attr.value);
          }
        });

        // If there is 0 options, add all options
        if (attributeOptions.size < 1) {
          allowedValues[attributeName] =
            loadedProduct.value!.attributes[attributeName];
          return;
        }

        // Store the allowed options for the attribute
        allowedValues[attributeName] = Array.from(attributeOptions);
      }
    );

    return allowedValues;
  });

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
    allowedAttributeValues,
    formatPrice,
    getAllImages,
    filteredProducts,
    allAttributes,
    searchTerm,
  };
};
