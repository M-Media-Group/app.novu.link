<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import { computed, onMounted, ref } from "vue";
import CreateProductOrder from "@/forms/CreateProductOrder.vue";
import image from "@/assets/undraw_chef_cu-0-r.svg";
import BaseButton from "@/components/BaseButton.vue";
import { useProducts } from "@/composables/useProducts";
import type { Product } from "@/types/product";
import BaseBadge from "@/components/BaseBadge.vue";

const {
  products,
  loadMoreProducts,
  isLoading,
  formatPrice,
  getAllImages,
  loadedProduct,
} = useProducts();

onMounted(async () => {
  await loadMoreProducts();

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
  primaryProductHeading.value.scrollIntoView();
};

const showBuyNow = ref(false);
</script>
<template>
  <div>
    <hgroup>
      <h1>{{ $t("Print your QR code on anything") }}</h1>
      <p>Shirts, mugs, stickers, and more</p>
    </hgroup>
    <section
      v-if="loadedProduct && loadedProduct !== null"
      class="fulscreen-width-container hero-section"
      data-theme="light"
    >
      <div class="two-column-grid">
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
          />
        </div>

        <div>
          <hgroup>
            <h2 ref="primaryProductHeading">
              {{ loadedProduct.name }} With Custom QR Code
            </h2>
            <p>
              <template
                v-if="loadedProduct.prices.min !== loadedProduct.prices.max"
              >
                {{ $t("From") }}
              </template>
              {{
                formatPrice(
                  loadedProduct.prices.min,
                  loadedProduct.prices.currency
                ) + " incl. VAT"
              }}
              +
              {{
                formatPrice(
                  loadedProduct.prices.shipping,
                  loadedProduct.prices.currency
                )
              }}
              worldwide shipping
            </p>
          </hgroup>
          <template v-if="!showBuyNow">
            <base-button @click="showBuyNow = true" class="full-width"
              >Buy now</base-button
            >
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
          </template>
          <template v-else>
            <p>
              <a @click="showBuyNow = false" class="back-link"
                >← Back to product</a
              >
            </p>
            <create-product-order
              :productIds="[loadedProduct.id]"
              @success="showBuyNow = false"
            />
          </template>
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
    <section class="three-column-grid">
      <div>
        <hgroup>
          <h2>All products</h2>
          <p>Our most popular products</p>
        </hgroup>
      </div>
      <card-element
        :title="product.name"
        :images="[
          {
            src: product.image,
            alt: 'A product',
          },
        ]"
        :subtitle="
          product.prices.min !== 0
            ? formatPrice(product.prices.min, product.prices.currency) +
              ' incl. VAT'
            : 'Free'
        "
        v-for="product in displayAbleProducts"
        :key="product.id"
        @click="
          handleProductSelect(product as Product);
          $refs.primaryProductHeading.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        "
        style="height: 100%"
      >
        <p>{{ product.short_description }}</p>

        <small v-if="Object.keys(product.attributes).length > 0">
          Customise:
          <base-badge
            v-for="attribute in Object.keys(product.attributes)"
            :key="attribute"
          >
            {{ attribute }}
          </base-badge>
        </small>
      </card-element>

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
  background-color: blanchedalmond;
  padding-top: calc(var(--pico-spacing) * 2);
}

/* And also for every interjection make it full width */
.three-column-grid *:nth-child(8n + 2) {
  grid-column: span 2;
}
</style>
