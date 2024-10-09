<script setup lang="ts">
import { type PropType, computed, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import RedirectSelector from "@/components/RedirectSelector.vue";
import ProductSelector from "@/components/ProductSelector.vue";
import axios from "axios";
import { watch } from "vue";
import { useProducts } from "@/composables/useProducts";
import type { Product } from "@/types/product";
import type { Redirect } from "@/types/redirect";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import BaseButton from "@/components/BaseButton.vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import type { Gate } from "@m-media/vue3-gate-keeper";

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

const baseFormRef = ref();
const $bus = useEventsBus();

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
  if (!localRedirectIds.value || !loadedProduct.value) {
    return;
  }

  isLoading.value = true;

  const response = await axios
    .post(`/api/v1/products/${loadedProduct.value.id}/orders`, {
      redirect_uuid: localRedirectIds.value[0],
      quantity: quantity.value,
      merchant: loadedProduct.value.merchant,
      include_qr_code_subscription: includeQrCodeSubscription.value,
      include_consultation: includeConsultation.value,
      attributes: selectedAttributes.value,
    })
    .catch((error) => {
      console.error(error);
      return error.response;
    });

  if (response.status === 201) {
    // Emit the updated event with the changed fields
    emit("success");
    baseFormRef.value.setSuccessOnInputs();
    $bus.$emit(eventTypes.created_product_order);
  } else if (typeof response === "object") {
    // Show the fields with errors
    baseFormRef.value.setInputErrors(response.data.errors);
  }

  isLoading.value = false;
};

const isLoading = ref(false);

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
    @submit="submitForm"
    submitText="Buy now"
    :disabled="isLoading || isLoadingProduct || localRedirectIds.length === 0"
    :isLoading="isLoading || isLoadingProduct"
  >
    <label for="redirect">QR Code to Print on Product</label>
    <redirect-selector
      v-if="!redirectIds"
      v-model="localRedirectIds"
      required
    />
    <product-selector
      v-if="!productIds"
      v-model="localProductIds"
      ref="productSelectorElement"
      required
    />
    <template v-if="loadedProduct?.attributes">
      <template v-for="options in loadedProduct.attributes" :key="options.name">
        <label for="size">{{ options.name }}</label>
        <select
          name="size"
          required
          @change="
            handleSelectedAttribute(
              `${options.name}`,
              ($event.target as HTMLSelectElement).value
            )
          "
          :aria-busy="isLoadingProduct"
        >
          <option v-for="option in options.value" :value="option" :key="option">
            {{ option }}
          </option>
        </select>
      </template>
    </template>

    <label for="quantity">Quantity</label>
    <input
      type="number"
      id="quantity"
      name="quantity"
      min="1"
      required
      v-model="quantity"
    />

    <!-- Notes input -->
    <!-- Notes emoji:  -->
    <details>
      <summary>📝 Add order notes</summary>
      <textarea
        id="notes"
        name="notes"
        v-model="notes"
        placeholder="Any notes for the designer?"
      ></textarea>
    </details>

    <label>
      <input
        type="checkbox"
        id="terms"
        name="terms"
        v-model="includeQrCodeSubscription"
      />
      {{
        $t(
          "Include QR Code subscription for advanced scan tracking, multiple destinations, custom alerts, and more."
        )
      }}
    </label>

    <label>
      <input
        type="checkbox"
        id="terms"
        name="terms"
        v-model="includeConsultation"
      />
      {{ $t("Include one to one design consultation.") }}
      {{
        $t(
          "We'll meet with you to discuss your needs and help you meet your design vision."
        )
      }}
    </label>
    <template #submit="{ disabled, isLoading, submitText }">
      <confirms-gate
        :title="$t('Subscribe')"
        @confirmed="submitForm"
        :description="
          $t(
            'Additional destinations and design changes are free after you subscribe.'
          )
        "
        :allowBackgroundClickToClose="false"
        :gate="gates"
      >
        <base-button
          class="full-width"
          :disabled="disabled"
          :aria-busy="isLoading"
          type="submit"
        >
          {{ $t(submitText) }}</base-button
        >
      </confirms-gate>
    </template>
    <template #after-submit v-if="selectedVariant?.prices[0]?.priceWithTax">
      <small
        >{{
          formatPrice(
            selectedVariant?.prices[0]?.priceWithTax,
            selectedVariant?.prices[0]?.currencyCode
          ) + " incl. VAT"
        }}
        {{ selectedVariant?.name }} x
        {{ quantity }}
        <template v-if="loadedProduct?.prices.shipping">
          <br />+
          {{
            formatPrice(
              loadedProduct.prices.shipping,
              loadedProduct.prices.currency
            )
          }}
          worldwide shipping
        </template>
        <template v-if="includeQrCodeSubscription">
          <br />+ €3 / month (billed annually) Magic Link
        </template>
        <template v-if="includeConsultation">
          <br />+ €15 Pro Consulting
        </template>
      </small>
    </template>
    <!-- </TransitionGroup> -->
  </base-form>
</template>
