<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import { computed, onMounted, ref } from "vue";
import CreateProductOrder from "@/forms/CreateProductOrder.vue";
import image from "@/assets/undraw_chef_cu-0-r.svg";
import BaseButton from "@/components/BaseButton.vue";
import { useProducts } from "@/composables/useProducts";
import type { Product } from "@/types/product";
import BaseBadge from "@/components/BaseBadge.vue";
import ProductCardElement from "@/components/ProductCardElement.vue";
import DropdownSelect from "@/components/DropdownSelect.vue";
import skierImage from "@/assets/skierQr.png";
import skaterQr from "@/assets/skaterQr.png";
import businessQr from "@/assets/businessQr.png";
import storefrontQr from "@/assets/storefrontQr.png";

const {
  products,
  loadMoreProducts,
  isLoading,
  formatPrice,
  getAllImages,
  loadedProduct,
  filteredProducts,
  allAttributes,
  handleSelectedAttribute,
  selectedAttributes,
  searchTerm,
  minProductsToTriggerLoadMore,
} = useProducts();

minProductsToTriggerLoadMore.value = 3;

onMounted(async () => {
  loadMoreProducts();

  while (products.value.length < 10) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  // Load a random product
  handleProductSelect(
    products.value[Math.floor(Math.random() * products.value.length)]
  );
});

const displayAbleProducts = computed(() => {
  // Interject a loading card every 20 products
  return products.value.flatMap((product, index) =>
    index % 12 === 0
      ? [
          {
            id: `loading-${index}`,
            name: "Free Integrated Novu.Link QR Code",
            price: "0",
            image: image,
            merchant: "Novu.Link",
            description:
              "We offer your QR Code to be printed on any of our products for free",
            short_description:
              "We offer your QR Code to be printed on any of our products for free",
            prices: {
              min: 0,
              max: 0,
              currency: "EUR",
            },
            attributes: {},
          },
          product,
        ]
      : product
  );
});

// Whenever we reach the bottom of the page, load more products
const hasMoreProducts = ref(true);

window.onscroll = async () => {
  if (!hasMoreProducts.value) {
    return;
  }
  if (isLoading.value) {
    return;
  }
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadMoreProducts();
  }
};

const primaryProductHeading = ref();

const handleProductSelect = (product: Product) => {
  loadedProduct.value = product;
  primaryProductHeading.value?.scrollIntoView();
};

const showBuyNow = ref(false);

const resultsSection = ref();

const handleCategoryClick = (category: string) => {
  searchTerm.value = category;
  // smooth scroll to the search
  resultsSection.value?.scrollIntoView({ behavior: "smooth" });
};
</script>
<template>
  <div>
    <section class="fulscreen-width-container hero-section">
      <hgroup
        style="
          padding-top: calc(var(--pico-spacing));
          padding-bottom: calc(var(--pico-spacing));
          text-align: center;
          font-size: 100%;
        "
      >
        <h1>Printed Products With Changeable QR Codes</h1>
        <p>Easily update your QR code links anytime, even after printing.</p>
      </hgroup>
      <div class="two-column-grid category-images">
        <div @click="handleCategoryClick('jacket')">
          <img :src="skierImage" />
          <h2>Jackets</h2>
        </div>
        <div @click="handleCategoryClick('hoodie')">
          <img :src="skaterQr" />
          <h2>Hoodies</h2>
        </div>
        <div @click="handleCategoryClick('mug')">
          <img :src="businessQr" />
          <h2>Mugs</h2>
        </div>
        <div @click="handleCategoryClick('sticker')">
          <img :src="storefrontQr" />
          <h2>Stickers</h2>
        </div>
      </div>
    </section>
    <section
      v-if="loadedProduct && loadedProduct !== null"
      class="fulscreen-width-container hero-section"
    >
      <div class="two-column-grid">
        <div>
          <div
            class="images overflow-auto"
            style="
              height: 100%;
              max-height: 70dvh;
              border-radius: var(--pico-border-radius);
              margin-bottom: var(--pico-spacing);
            "
            v-if="loadedProduct"
          >
            <img
              v-for="img in getAllImages(loadedProduct).map((image) => ({
                src: image,
                alt: loadedProduct?.name ?? 'Product image',
              }))"
              :key="img.src"
              :src="img.src"
              class="full-width"
              :alt="img.alt"
              loading="lazy"
            />
          </div>
          <!-- An image caption saying its not the actual product -->

          <!-- A div grid for all images - small thumbnails -->
          <div
            v-if="getAllImages(loadedProduct).length > 1"
            class="images overflow-auto"
            style="height: min-content"
          >
            <img
              v-for="img in getAllImages(loadedProduct).map((image) => ({
                src: image,
                alt: loadedProduct?.name ?? 'Product image',
              }))"
              :key="img.src"
              :src="img.src"
              class="full-width"
              :alt="img.alt"
              height="32"
              style="object-fit: contain; height: 96px; width: auto"
            />
          </div>
        </div>
        <div>
          <hgroup>
            <h2 ref="primaryProductHeading">
              {{ loadedProduct.name }} With Custom QR Code
            </h2>
            <p>
              <template
                v-if="
                  loadedProduct?.prices?.min?.priceWithTax !==
                  loadedProduct?.prices?.max?.priceWithTax
                "
              >
                {{ $t("From") }}
              </template>
              {{
                formatPrice(
                  loadedProduct.prices?.min?.priceWithTax,
                  loadedProduct.prices?.min?.currencyCode
                ) + " incl. VAT"
              }}
              +
              {{
                formatPrice(
                  loadedProduct.prices?.shipping,
                  loadedProduct.prices?.currency
                )
              }}
              worldwide shipping
            </p>
          </hgroup>
          <div v-show="!showBuyNow">
            <base-button
              @click="showBuyNow = true"
              class="full-width"
              :disabled="!loadedProduct.is_in_stock"
            >
              {{
                loadedProduct.is_in_stock ? $t("Buy now") : $t("Out of stock")
              }}
            </base-button>
            <p style="white-space: pre-line">
              {{ loadedProduct.description }}<br />• Advanced Novu.Link QR Code
              printed in high quality<br />• Changeable destinations even after
              print, for free
            </p>
            <small>
              <base-badge>{{
                loadedProduct.is_in_stock ? "In stock" : "Out of stock"
              }}</base-badge>
            </small>
          </div>
          <div v-show="showBuyNow">
            <p>
              <a @click="showBuyNow = false" class="back-link"
                >← Back to product</a
              >
            </p>
            <create-product-order
              :productIds="[loadedProduct.id]"
              @success="showBuyNow = false"
            />
          </div>
          <hr />
          <small>
            Fulfilled by
            <a
              href="https://www.printful.com/print-on-demand/a/583122:ccf515ea17b07bdf388ebbff9f76827b"
              >{{ loadedProduct.merchant }}</a
            >
          </small>
        </div>
      </div>
    </section>
    <section
      v-else
      class="fulscreen-width-container hero-section"
      data-theme="light"
    >
      <div class="two-column-grid" style="height: 100dvh">
        <div
          class="gl-animate-skeleton-loader images overflow-auto"
          style="
            min-height: 100%;
            max-height: 70dvh;
            border-radius: var(--pico-border-radius);
            margin-bottom: var(--pico-spacing);
          "
        ></div>
        <div>
          <div class="gl-animate-skeleton-loader" style="height: 2rem"></div>
          <div class="gl-animate-skeleton-loader" style="height: 1rem"></div>
        </div>
      </div>
    </section>
    <section class="results three-column-grid" ref="resultsSection">
      <div>
        <hgroup>
          <h2>Explore 1320 products</h2>
          <p>Our most popular products</p>
        </hgroup>
        <input
          type="search"
          v-model="searchTerm"
          placeholder="Search products"
        />
        <details>
          <summary>
            Filters {{ selectedAttributes.map((x) => x.value).join(", ") }}
          </summary>
          <div v-if="allAttributes">
            <template v-for="options in allAttributes" :key="options.name">
              <label for="size">{{ options.name }}</label>
              <dropdown-select
                :modelValue="
                  selectedAttributes
                    .filter((x) => x.name === options.name)
                    .map((x) =>
                      typeof x.value === 'string' ? x.value : x.value?.join(',')
                    )
                    .filter(Boolean)
                "
                @update:modelValue="
                  handleSelectedAttribute(
                    `${options.name}`,
                    $event?.[0] as string
                  )
                "
                :options="
                  typeof options.value === 'string'
                    ? [options.value]
                    : options.value
                "
                :visibleLimit="100"
                :clearable="true"
              />
            </template>
          </div>
        </details>
      </div>
      <product-card-element
        v-for="product in filteredProducts"
        :product="product"
        :key="product.id"
        @click="
          handleProductSelect(product as Product);
          $refs.primaryProductHeading.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        "
        :inline="false"
      />

      <template v-if="isLoading">
        <card-element
          v-for="x in 20"
          :key="x"
          :loading="isLoading"
          :title="'Loading...'"
          :subtitle="'Please wait'"
          :images="[
            {
              src: 'https://via.placeholder.com/150',
              alt: 'Placeholder image',
            },
          ]"
          style="height: 100%"
        >
          Loading...
        </card-element>
      </template>
      <card-element
        v-if="filteredProducts.length === 0 && !isLoading"
        :title="'No products found'"
        :subtitle="'Try a different search term or change the filters'"
        :images="[
          {
            src: image,
            alt: 'Placeholder image',
          },
        ]"
        style="height: 100%"
      />
      <card-element
        v-if="!hasMoreProducts"
        :title="'No more products'"
        :subtitle="'Check back later for more products'"
        :images="[
          {
            src: image,
            alt: 'Placeholder image',
          },
        ]"
        style="height: 100%"
      >
        <p>There's new products added every week. Check back later for more.</p>
      </card-element>
    </section>
  </div>
</template>
<style scoped>
.hero-section {
  /* background-color: blanchedalmond; */
  padding-top: calc(var(--pico-spacing) * 2);

  min-height: 100dvh;
}

/* And also for every interjection make it full width */
.results.three-column-grid *:nth-child(8n + 2) {
  grid-column: span 2;
}

.gl-animate-skeleton-loader {
  height: 100%;
}

.category-images > div img,
.category-images > div img + h2 {
  /* Make smooth translation */
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  overflow: hidden;
}

.category-images > div:hover img {
  transform: scale(1.05);
}

.category-images > div:hover img + h2 {
  transform: scale(1.05);
  margin-top: -2rem;
  margin-left: 1rem;
  color: white;
}
</style>
