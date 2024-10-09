<script setup lang="ts">
import type { PropType } from "vue";
import type { Product } from "@/types/product";
import CardElement from "@/components/CardElement.vue";
import { useProducts } from "@/composables/useProducts";
import BaseBadge from "@/components/BaseBadge.vue";

defineProps({
  /** The product object to display */
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
  /** If the card should render as a skeleton loader */
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Inline card */
  inline: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const { formatPrice } = useProducts();
</script>

<template>
  <card-element
    :loading="loading"
    :title="product.name"
    :images="[
      {
        src: product.image,
        alt: 'A product',
      },
    ]"
    :subtitle="
      product.prices?.min?.price !== 0
        ? formatPrice(
            product.prices?.min?.priceWithTax,
            product.prices?.min?.currencyCode
          ) + ' incl. VAT'
        : 'Free'
    "
    style="height: 100%"
    :class="{ inline: inline }"
  >
    <p>{{ product.short_description }}</p>

    <footer v-if="Object.keys(product.attributes).length > 0">
      Customise:
      <base-badge v-for="attribute in product.attributes" :key="attribute.name">
        {{ attribute.name }}
      </base-badge>
    </footer>
  </card-element>
</template>
<style>
article.inline {
  display: grid;
  grid-template-columns: auto 1fr; /* Two columns: first for images, second for content */
  grid-auto-rows: auto; /* Automatically create rows for each content block */

  gap: var(--pico-spacing);

  padding: 0 !important;

  > :first-child:is(.images) {
    margin: 0;
    width: 100%;
    grid-column: 1; /* First column */
    grid-row: span 3; /* Allow images to span all rows */
  }

  > :not(:first-child) {
    grid-column: 2; /* Second column */
    min-width: 80vw;
    padding: 0;
    padding-right: var(--pico-spacing);
    margin: 0;
  }

  > .images + header {
    margin-top: var(--pico-block-spacing-vertical);
  }

  /* The last child should span all columns */
  &:last-child {
    margin-bottom: var(--pico-block-spacing-vertical);
  }
}
</style>
