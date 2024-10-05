<script setup lang="ts">
import { type PropType, ref } from "vue";
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

  /** The size options. If not provided, will fetch via API */
  sizeOptions: {
    type: Array as PropType<{ id: string; render: string }[]>,
    required: false,
  },
});

const baseFormRef = ref();
const $bus = useEventsBus();

const emit = defineEmits(["success"]);

const { loadedProduct, loadProduct, isLoadingProduct } = useProducts();

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!localRedirectIds.value) {
    return;
  }

  isLoading.value = true;

  const response = await axios
    .post(`/api/v1/products/${props.productIds}/orders`, {
      redirect_uuid: localRedirectIds.value[0],
      size: size.value,
      quantity: quantity.value,
      merchant: "Printful",
      include_qr_code_subscription: includeQrCodeSubscription.value,
      include_consultation: includeConsultation.value,
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
const size = ref();
const quantity = ref(1);
const includeQrCodeSubscription = ref(true);
const includeConsultation = ref(true);

const localProductIds = ref(props.productIds ?? []);

const productSelectorElement = ref();

watch(
  () => productSelectorElement.value?.currentlySelectedProduct,
  (value) => {
    if (!value) {
      return;
    }
    loadedProduct.value = value;
    size.value = value.sizes[0];
  }
);

watch(
  () => props.productIds,
  async (value) => {
    if (value && value.length > 0) {
      await loadProduct(value[0]);
      if (loadedProduct.value && loadedProduct.value.sizes) {
        size.value = loadedProduct.value.sizes[0];
      }
    }
  },
  { immediate: true }
);
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
    <template v-if="loadedProduct?.sizes && loadedProduct.sizes.length > 0">
      <label for="size">Size</label>
      <select name="size" required v-model="size" :aria-busy="isLoadingProduct">
        <option
          v-for="option in loadedProduct.sizes"
          :value="option"
          :key="option"
        >
          {{ option }}
        </option>
      </select>
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
      {{ $t("Include one to one consultation on design.") }}
      {{
        $t(
          "We'll meet with you to discuss your needs and help you meet your design vision."
        )
      }}
    </label>

    <template #submit="{ disabled, isLoading, submitText }">
      <confirms-gate
        :title="$t('Enable alerts')"
        @confirmed="submitForm"
        :description="
          $t(
            'Additional destinations and design changes are free after you subscribe.'
          )
        "
        :allowBackgroundClickToClose="false"
        :gate="[
          'confirmedEmailOrPhone',
          'hasPaymentMethod',
          {
            name: 'subscribedRedirect',
            options: {
              redirectId: localRedirectIds[0],
            },
          },
        ]"
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
    <template #after-submit v-if="loadedProduct?.prices?.formattedPrice">
      <small
        >{{ loadedProduct.prices.formattedPrice + " incl. VAT" }} x
        {{ quantity }}
        <template v-if="loadedProduct.prices.formattedShipping">
          <br />+ {{ loadedProduct.prices.formattedShipping }} worldwide
          shipping
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
