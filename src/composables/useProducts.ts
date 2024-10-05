import { ref } from "vue";
import axios from "axios";
import type { Product } from "@/types/product";

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
      }).format(product.prices.price),
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

const products = ref([] as Product[]);
const currentPage = ref(1);
const hasMoreProducts = ref(true);
const isLoading = ref(false);

export const useProducts = () => {
  const loadedProduct = ref(null as Product | null);
  const isLoadingProduct = ref(false);

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

  const loadProduct = async (id: Product["id"]) => {
    if (isLoadingProduct.value) {
      return;
    }
    isLoadingProduct.value = true;
    loadedProduct.value = await getProduct(id);
    isLoadingProduct.value = false;
  };

  return {
    products,
    loadedProduct,
    loadMoreProducts,
    loadProduct,
    isLoadingProduct,
    hasMoreProducts,
    isLoading,
  };
};
