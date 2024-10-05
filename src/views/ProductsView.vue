<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import { computed, onMounted, ref } from "vue";
import CreateProductOrder from "@/forms/CreateProductOrder.vue";
import image from "@/assets/undraw_chef_cu-0-r.svg";
import BaseButton from "@/components/BaseButton.vue";
import OpenStreetDropdown from "@/components/examples/OpenStreetDropdown.vue";
import { useProducts } from "@/composables/useProducts";
import type { Product } from "@/types/product";

const { products, loadMoreProducts, isLoading } = useProducts();

onMounted(async () => {
  await loadMoreProducts();
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
            shortDescription:
              "We offer your QR Code to be printed on any of our products for free",
            prices: {
              formattedPrice: "Free",
              currency: "EUR",
            },
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

// Random number 0 - 20
const featuredIndex = ref(Math.floor(Math.random() * 20));

const primaryProductHeading = ref();

const handleProductSelect = (product: Product) => {
  featuredIndex.value = products.value.indexOf(product);
  primaryProductHeading.value.scrollIntoView();
};

const showBuyNow = ref(false);
</script>
<template>
  <div>
    <hgroup>
      <h1>Print your QR code on anything</h1>
      <p>Shirts, mugs, stickers, and more</p>
    </hgroup>
    <section
      v-if="products.length > 0"
      class="fulscreen-width-container hero-section"
    >
      <div class="two-column-grid">
        <img
          :src="products[featuredIndex].image"
          class="full-width"
          alt="A product"
        />
        <div>
          <hgroup>
            <h2 ref="primaryProductHeading">
              {{ products[featuredIndex].name }} With Custom QR Code
            </h2>
            <p>
              {{ products[featuredIndex].prices.formattedPrice + " incl. VAT" }}
              + {{ products[featuredIndex].prices.formattedShipping }} worldwide
              shipping
            </p>
          </hgroup>
          <template v-if="!showBuyNow">
            <base-button @click="showBuyNow = true" class="full-width"
              >Buy now</base-button
            >
            <p style="white-space: pre-line">
              {{ products[featuredIndex].description }}<br />• Advanced
              Novu.Link QR Code printed in high quality<br />• Changeable
              destinations even after print, for free
            </p>
          </template>
          <template v-else>
            <p>
              <a @click="showBuyNow = false" class="back-link"
                >← Back to product</a
              >
            </p>
            <create-product-order
              :productIds="[products[featuredIndex].id]"
              @success="showBuyNow = false"
            />
            <small
              >{{ products[featuredIndex].prices.formattedPrice + " incl. VAT"
              }}<br />+ 3 EUR / month (billed annually) Magic Link<br />+ 15 EUR
              Pro Consulting</small
            >
          </template>
          <hr />
          <small>
            Fulfilled by
            <a
              href="https://www.printful.com/print-on-demand/a/583122:ccf515ea17b07bdf388ebbff9f76827b"
              >{{ products[featuredIndex].merchant }}</a
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
        <open-street-dropdown />
      </div>
      <card-element
        :title="product.name"
        :images="[{ src: product.image, alt: 'Product image' }]"
        :subtitle="
          product.prices.formattedPrice !== 'Free'
            ? product.prices.formattedPrice + ' incl. VAT'
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
        <p>{{ product.shortDescription }}</p>
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
