<script lang="ts" setup>
import DropdownSelect from "@/components/DropdownSelect.vue";
import { type PropType, computed, onMounted, ref } from "vue";
import type { Product } from "@novulink/types";
import type { selectOptionObject } from "@novulink/types";
import { useProducts } from "@/composables/useProducts";

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

const productOptions = computed((): selectOptionObject[] =>
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
      } as selectOptionObject)
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
    :options="productOptions"
    :aria-busy="isLoading"
    :searchable="productOptions.length > 10"
    v-model:is-open="isOpenValueSelector"
    v-model:search="searchTerm"
    :showSelectedFirst="true"
    :modelValue="[`${modelValue}`]"
    @update:modelValue="handleSelect"
    :required="required"
    :autofocus="true"
    @reached-end-of-list="handleReachedEndOfList"
  >
    <template
      #optionSlot="{
        option,

        multiple,
        updateModelValue,
        checked,
        value,
        label,
      }"
    >
      <label>
        <input
          :type="multiple ? 'checkbox' : 'radio'"
          :disabled="option.disabled"
          :value="value"
          :checked="checked"
          @click="updateModelValue"
          tabindex="0"
          :visibleLimit="100"
        />

        <img
          loading="lazy"
          :src="option.raw.image"
          style="height: 64px"
          alt=""
        />
        {{ label }}
        <br />
        <small>{{ option.raw.price }} EUR - {{ option.raw.description }}</small>
      </label>
    </template>
  </dropdown-select>
</template>
