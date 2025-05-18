import { type Ref, computed, ref, watch } from "vue";
import type { Attribute, Product, Variant } from "@/types/product";
import { debounce } from "@/helpers/debounce";
import {
  getProduct,
  streamProducts,
} from "@/repositories/product/productRepository";

const products = ref([] as Product[]);
const currentPage = ref(1);
const hasMoreProducts = ref(true);
const isLoading = ref(false);

// Generalized function to fetch products, which can be used for pagination or category-based requests
const getProducts = async (
  productsArray: Ref<Product[]>, // Pass the local array to store products
  page = 1,
  categoryId?: string
) => {
  isLoading.value = true;

  try {
    await streamProducts(
      { page, categories: categoryId ? [categoryId] : [] },
      productsArray.value
    );
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    isLoading.value = false;
  }

  return productsArray.value;
};

const getProductsByCategory = async (
  categoryId: string,
  productRef: Ref<Product[]>
) => {
  products.value = [];
  currentPage.value = 1;
  hasMoreProducts.value = true;
  await getProducts(productRef, currentPage.value, categoryId);
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
  const newProducts = await getProducts(products, currentPage.value);
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
  variants?: { imageUrl: string | null }[];
}): string[] {
  const variantImages = product.variants?.flatMap(
    (variant) => variant.imageUrl
  );
  if (!variantImages) {
    return [product.image];
  }
  return [
    ...new Set([
      product.image,
      ...variantImages.filter((image) => image !== null),
    ]),
  ].filter(Boolean);
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
  const loadedProduct = ref<Product | null>(null);
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
    loadedProduct.value = await getProduct({ id });

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
    getProductsByCategory,
    filteredProducts,
    allAttributes,
    searchTerm,
  };
};
