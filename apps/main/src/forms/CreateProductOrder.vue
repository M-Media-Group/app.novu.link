<script setup lang="ts">
import { type PropType, computed, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import RedirectSelector from "@/components/RedirectSelector.vue";
import ProductSelector from "@/components/ProductSelector.vue";
import { watch } from "vue";
import { useProducts } from "@novulink/vue-composables/useProducts";
import type { Product } from "@novulink/types";
import type { Redirect } from "@novulink/types";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import BaseButton from "@/components/BaseButton.vue";
import type { Gate } from "@m-media/vue3-gate-keeper";
import { createOrder } from "@novulink/api";

const props = defineProps({
  /** The redirect ids. If passed, the selector will be hidden */
  redirectIds: {
    type: Array as PropType<Redirect["uuid"][]>,
    required: false,
  },

  /** The product ID */
  productIds: {
    type: Array as PropType<Product["id"][]>,
    required: false,
  },
});

const emit = defineEmits(["success"]);

const {
  loadedProduct,
  loadProduct,
  isLoadingProduct,
  handleSelectedAttribute,
  selectedVariant,
  selectedAttributes,
  formatPrice,
} = useProducts();

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  await createOrder({
    redirect_uuid: localRedirectIds.value[0],
    quantity: quantity.value,
    merchant: loadedProduct.value?.merchant,
    include_qr_code_subscription: includeQrCodeSubscription.value,
    include_consultation: includeConsultation.value,
    attributes: selectedAttributes.value,
    product_id: loadedProduct.value?.id,
  });
};

const localRedirectIds = ref(props.redirectIds ?? []);

const quantity = ref(1);
const includeQrCodeSubscription = ref(true);
const includeConsultation = ref(true);
const notes = ref("");

const localProductIds = ref(props.productIds ?? []);

const productSelectorElement = ref();

watch(
  () => productSelectorElement.value?.currentlySelectedProduct,
  (value) => {
    if (!value) {
      return;
    }
    selectedAttributes.value = [];
    loadedProduct.value = value;
  }
);

watch(
  () => props.productIds,
  async (value, oldValue) => {
    if (value?.[0] === oldValue?.[0]) {
      return;
    }
    if (value && value.length > 0) {
      await loadProduct(value[0]);
    }
  },
  { immediate: true }
);

const gates = computed(() => {
  const gatesArray = ["confirmedEmailOrPhone", "hasPaymentMethod"] as (
    | Gate
    | string
  )[];

  if (includeQrCodeSubscription.value) {
    gatesArray.push({
      name: "subscribedRedirect",
      options: {
        redirectId: localRedirectIds.value[0],
      },
    });
  }

  return gatesArray;
});
</script>

<template>
  <base-form
    ref="baseFormRef"
    :submit-fn="submitForm"
    submit-text="Buy now"
    :disabled="isLoadingProduct || localRedirectIds.length === 0"
    :is-loading="isLoadingProduct"
    @succeess="emit('success')"
  >
    <label for="redirect">QR Code to Print on Product</label>
    <redirect-selector
      v-if="!redirectIds"
      v-model="localRedirectIds"
      required
    />
    <product-selector
      v-if="!productIds"
      ref="productSelectorElement"
      v-model="localProductIds"
      required
    />
    <template v-if="loadedProduct?.attributes">
      <template
        v-for="options in loadedProduct.attributes"
        :key="options.name"
      >
        <label for="size">{{ options.name }}</label>
        <select
          name="size"
          required
          :aria-busy="isLoadingProduct"
          @change="
            handleSelectedAttribute(
              `${options.name}`,
              ($event.target as HTMLSelectElement).value
            )
          "
        >
          <option
            v-for="option in options.value"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </template>
    </template>

    <label for="quantity">Quantity</label>
    <input
      id="quantity"
      v-model="quantity"
      type="number"
      name="quantity"
      min="1"
      required
    >

    <!-- Notes input -->
    <!-- Notes emoji:  -->
    <details>
      <summary>📝 Add order notes</summary>
      <textarea
        id="notes"
        v-model="notes"
        name="notes"
        placeholder="Any notes for the designer?"
      />
    </details>

    <label>
      <input
        id="terms"
        v-model="includeQrCodeSubscription"
        type="checkbox"
        name="terms"
      >
      {{
        $t(
          "Include QR Code subscription for advanced scan tracking, multiple destinations, custom alerts, and more."
        )
      }}
    </label>

    <label>
      <input
        id="terms"
        v-model="includeConsultation"
        type="checkbox"
        name="terms"
      >
      {{ $t("Include one to one design consultation.") }}
      {{
        $t(
          "We'll meet with you to discuss your needs and help you meet your design vision."
        )
      }}
    </label>
    <template #submit="{ disabled, isLoading, submitText, submit }">
      <confirms-gate
        :title="$t('Subscribe')"
        :description="
          $t(
            'Additional destinations and design changes are free after you subscribe.'
          )
        "
        :allow-background-click-to-close="false"
        :gate="gates"
        @confirmed="submit()"
      >
        <base-button
          class="full-width"
          :disabled="disabled"
          :aria-busy="isLoading"
          type="submit"
        >
          {{ $t(submitText) }}
        </base-button>
      </confirms-gate>
    </template>
    <template
      v-if="selectedVariant?.prices[0]?.priceWithTax"
      #after-submit
    >
      <small>{{
               formatPrice(
                 selectedVariant?.prices[0]?.priceWithTax,
                 selectedVariant?.prices[0]?.currencyCode
               ) + " incl. VAT"
             }}
        {{ selectedVariant?.name }} x
        {{ quantity }}
        <template v-if="loadedProduct?.prices.shipping">
          <br>+
          {{
            formatPrice(
              loadedProduct.prices.shipping,
              loadedProduct.prices.currency
            )
          }}
          worldwide shipping
        </template>
        <template v-if="includeQrCodeSubscription">
          <br>+ €3 / month (billed annually) Magic Link
        </template>
        <template v-if="includeConsultation">
          <br>+ €15 Pro Consulting
        </template>
      </small>
    </template>
    <!-- </TransitionGroup> -->
  </base-form>
</template>
