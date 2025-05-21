<script lang="ts" setup>
import DropdownSelect from "@/components/DropdownSelect.vue";
import { type PropType, computed, onMounted, ref } from "vue";
import type { Product } from "@novulink/types";
import type { SelectOptionObject } from "@novulink/types";
import { useProducts } from "@novulink/vue-composables/useProducts";

const props = defineProps({
  modelValue: {
    type: Array as PropType<Product["id"][]>,
    required: true,
  },

  /** The required flag */
  required: {
    type: Boolean,
    required: false,
    default: true,
  },

  /** If unsubscribed products should be not selectable */
  subscribedOnly: {
    type: Boolean,
    required: false,
    default: false,
  },

  /** If multiple options can be selected */
  multiple: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const isOpenValueSelector = ref(false);

const searchTerm = ref("");

const { products, loadMoreProducts, isLoading, formatPrice } = useProducts();

const productOptions = computed(() =>
  products.value.map(
    (product: Product) =>
      ({
        id: product.id,
        render: product.name,
        raw: {
          ...product,
          image: product.image,
          description: product.short_description,
          price: formatPrice(
            product.prices?.min.priceWithTax,
            product.prices.currency
          ),
        },
      } as SelectOptionObject)
  )
);

onMounted(async () => {
  loadMoreProducts();
});

const currentlySelectedProduct = computed(() =>
  products.value.find((product) => props.modelValue.includes(product.id))
);

// make currentlySelectedProduct readable by the parent component
defineExpose({ currentlySelectedProduct });

const handleSelect = (selected: Product["id"][]) => {
  emit("update:modelValue", selected);
  isOpenValueSelector.value = false;
};

const emit = defineEmits<{
  "update:modelValue": [Product["id"][]];
}>();

const handleReachedEndOfList = async () => {
  loadMoreProducts();
};
</script>
<template>
  <dropdown-select
    v-model:is-open="isOpenValueSelector"
    v-model:search="searchTerm"
    :options="productOptions"
    :aria-busy="isLoading"
    :searchable="productOptions.length > 10"
    :show-selected-first="true"
    :model-value="[`${modelValue}`]"
    :required="required"
    :autofocus="true"
    @update:model-value="handleSelect"
    @reached-end-of-list="handleReachedEndOfList"
  >
    <template
      #optionSlot="{
        option,
        multiple: slotMultiple,
        updateModelValue,
        checked,
        value,
        label,
      }"
    >
      <label>
        <input
          :type="slotMultiple ? 'checkbox' : 'radio'"
          :disabled="option.disabled"
          :value="value"
          :checked="checked"
          tabindex="0"
          :visibleLimit="100"
          @click="updateModelValue"
        >

        <img
          loading="lazy"
          :src="option.raw?.image ? `${option.raw?.image}` : undefined"
          style="height: 64px"
          alt=""
        >
        {{ label }}
        <br>
        <small>{{ option.raw?.price }} EUR - {{ option.raw?.description }}</small>
      </label>
    </template>
  </dropdown-select>
</template>
