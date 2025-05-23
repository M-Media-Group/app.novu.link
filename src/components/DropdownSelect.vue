<script lang="ts">
import i18n from "@/locales/i18n";
const t = i18n.global.t;
</script>

<script setup lang="ts">
import { debounce } from "@/helpers/debounce";
import {
  filterOptions,
  orderOptionsBySelectedFirst,
} from "@/helpers/normaliseOptions";
import { useMultiselect } from "@/composables/useMultiselect";
import type { selectOption } from "@/types/listItem";
import BaseBadge from "./BaseBadge.vue";

import { type PropType, computed, nextTick, onMounted, ref, watch } from "vue";

const props = defineProps({
  /** The model value is an array of selected options. This element will always use an array of strings as the values, even if originally they are typed as numbers. This is to stay consistent with native HTML elements "value" behaviour. This may be changed in the future. */
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => [],
  },

  /** The key to use to determine what value to return in the model */
  modelKey: {
    type: String as PropType<"id" | "render">,
    default: "id",
  },

  /** The key to use to determine the value to display */
  displayKey: {
    type: String as PropType<"id" | "render">,
    default: "render",
  },

  /** The passed options */
  options: {
    type: Array as PropType<selectOption[]>,
    default: () => [],
  },

  /** Whether the select is open or not */
  isOpen: {
    type: Boolean,
    default: false,
  },

  /** Show a select-all option */
  selectAll: {
    type: Boolean,
    default: false,
  },

  /** allow multiple selections */
  multiple: {
    type: Boolean,
    default: false,
  },

  /** The placeholder text to show */
  placeholder: {
    type: String,
    default: t("Select an option"),
  },

  /** Show search */
  searchable: {
    type: Boolean,
    default: false,
  },

  /** The search value. This is two-way binded so you should use a v-nodel for this to work */
  search: {
    type: String,
    default: "",
  },

  /** By default, the search will filter the options passed to it. If you are handling the search externally and don't want to filter the results locally, you can set this to false */
  searchLocally: {
    type: Boolean,
    default: true,
  },

  /** Limit visible elements. Its recommended to use this at a fairly low number and encourage the user to use the search. This limits how many HTML elements are rendered, but not how many are in the options array. */
  visibleLimit: {
    type: Number,
    default: 25,
  },

  /** Search encouragement text */
  searchEncouragement: {
    type: String,
    default: t("Search to see more results"),
  },

  /** Show the selected options first in the list */
  showSelectedFirst: {
    type: Boolean,
    default: false,
  },

  /** The role of the dropdown (button or undefined) */
  role: {
    type: String,
    default: undefined,
    validator: (value: string) => value === "button" || value === undefined,
  },

  /** The aria-invalid attribute */
  ariaInvalid: {
    type: Boolean,
    default: undefined,
  },

  /** The aria-busy attribute */
  ariaBusy: {
    type: Boolean,
    default: undefined,
  },

  /** Disable the entire dropdown */
  disabled: {
    type: Boolean,
    default: false,
  },

  /** If it is required to choose a value */
  required: {
    type: Boolean,
    default: false,
  },

  /** The select-all text */
  selectAllText: {
    type: String,
    default: t("Select all"),
  },

  /** The text to show when loading results */
  loadingText: {
    type: String,
    default: t("Loading..."),
  },

  /** If the search should autofocus on open */
  autofocus: {
    type: Boolean,
    default: false,
  },

  /** The placeholder for the search */
  searchPlaceholder: {
    type: String,
    default: t("Search for an option"),
  },

  /** Whether there should be a "Clear" option */
  clearable: {
    type: Boolean,
    default: false,
  },

  /** The text to show for the clear option */
  clearText: {
    type: String,
    default: t("Clear"),
  },
});

// Above rewritten in type declaration
const emit = defineEmits<{
  "update:modelValue": [string[]];
  "update:search": [string];
  reachedEndOfList: [];
  "update:isOpen": [boolean];
}>();

const {
  normalisedOptions,
  selecteableOptions,
  getLabel,
  isOptionSelected,
  toggleAllOptions,
  updateModelValue,
  unselectAllOptions,
} = useMultiselect(props, emit);

const setModelValue = (
  event: Event,
  existingValue = false as number | false
) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  updateModelValue(value, target.checked, existingValue);
};

const filteredOptions = computed(() => {
  if (!normalisedOptions.value) return [];

  if (!props.searchLocally) return normalisedOptions.value;

  const data = filterOptions(normalisedOptions.value, props.search);

  if (data.length < 2) {
    reachedEndOfListDebounced();
  }

  return data;
});

const orderedOptions = computed(() => {
  if (!filteredOptions.value) return [];

  if (!props.showSelectedFirst) {
    return filteredOptions.value;
  }

  return orderOptionsBySelectedFirst(
    filteredOptions.value,
    props.modelValue,
    props.modelKey
  );
});

const showSelectAll = computed(() => {
  if (!props.selectAll) return false;
  if (!props.multiple) return false;
  // If we are in search, we don't show it because we don't want to confuse the user user about what is being selected
  if (props.search) return false;
  if (!selecteableOptions.value) return false;
  return true;
});

/** Logic to setup the listening of when the user reached teh nottom of the dropdown list */
const dropdownList = ref<HTMLUListElement | null>(null);

const handleReachedEndOfList = () => {
  emit("reachedEndOfList");
};

const reachedEndOfListDebounced = debounce(
  handleReachedEndOfList,
  undefined,
  true
);

const setupDropdownList = () => {
  if (!dropdownList.value) return;

  dropdownList.value.addEventListener("scroll", () => {
    if (!dropdownList.value) return;
    if (
      dropdownList.value.scrollTop + dropdownList.value.clientHeight >=
      dropdownList.value.scrollHeight
    ) {
      reachedEndOfListDebounced();
    }
  });
};

const searchInput = ref<HTMLInputElement | null>(null);

/** A dunction to handle the opening of the results. If the search is present, we autofocus the search input. Note, there is a `ToggleEvent` type that should work but doesnt pass the TS linting with `TS2304: Cannot find name 'ToggleEvent'.`. */
const openResults = async (value: any) => {
  if (!value) return;

  // If the value is not the same as the current value, emit the event
  const valueCompare = value.newState === "open";

  if (valueCompare !== props.isOpen) {
    emit("update:isOpen", valueCompare);
  }
};

onMounted(() => {
  setupDropdownList();
});

const getSummaryText = () => {
  if (props.modelValue.length > 0) {
    return props.modelValue
      .map((value) => {
        const option = normalisedOptions.value.find((option) =>
          typeof option === "string"
            ? option === value
            : option[props.modelKey] === value
        );
        return option
          ? getLabel(option)
          : value.trim() !== ""
          ? value
          : props.placeholder;
      })
      .join(", ");
  }

  return props.placeholder;
};

const canBeFocusedOn = computed(
  () =>
    (props.isOpen &&
      searchInput.value &&
      props.searchable &&
      props.autofocus) ??
    false
);

watch(
  () => props.isOpen,
  async () => {
    await nextTick();
    if (!canBeFocusedOn.value) return;
    searchInput.value?.focus();
    // Scroll the dropdown to the top - this is needed because the CSS height animation seems to leave us a little bit scrolled down
    if (dropdownList.value) {
      dropdownList.value.scrollTop = 0;
    }
  }
);

// Watch the search for changes and scroll up if needed
watch(
  () => props.search,
  () => {
    if (dropdownList.value) {
      dropdownList.value.scrollTop = 0;
    }
  }
);

// Define a focus function that can be called when we use the ref on this component
const focus = () => {
  // If the dropdown is not open, open it
  if (!props.isOpen) {
    emit("update:isOpen", true);
  }
};

const dropdown = ref<HTMLDetailsElement | null>(null);

const setCustomValidity = (message: string) => {
  const element = dropdown.value;
  if (!element) return;

  let errorElement = element.nextElementSibling as HTMLElement;

  // If the message is "", remove the error message
  if (message === "") {
    if (errorElement && errorElement.classList.contains("error")) {
      errorElement.remove();
    }
    return;
  }

  if (!errorElement || !errorElement.classList.contains("error")) {
    errorElement = document.createElement("small");
    element.after(errorElement);
  }
  errorElement.innerText = message;
  errorElement.classList.add("error");
  element.insertAdjacentElement("afterend", errorElement);
};

const setAttribute = (attribute: string, value: string) => {
  if (!dropdown.value) return;
  dropdown.value.querySelector("summary")?.setAttribute(attribute, value);
};

// Expose the focus function to the parent component
defineExpose({ focus, setCustomValidity, setAttribute });
</script>
<template>
  <details
    class="dropdown"
    :open="props.isOpen"
    @toggle="openResults"
    ref="dropdown"
  >
    <summary
      :role="props.role"
      :aria-invalid="props.ariaInvalid"
      :aria-busy="props.ariaBusy"
      :data-has-value="props.modelValue.length > 0"
      :aria-required="props.required"
    >
      {{ props.modelValue.length > 0 ? getSummaryText() : props.placeholder }}
    </summary>
    <ul ref="dropdownList">
      <li v-if="props.searchable">
        <input
          type="search"
          :value="props.search"
          @input="
            $emit('update:search', ($event.target as HTMLInputElement).value)
          "
          :aria-busy="props.ariaBusy"
          :placeholder="props.searchPlaceholder"
          :aria-label="props.searchPlaceholder"
          :autofocus="props.autofocus"
          ref="searchInput"
        />
      </li>
      <li v-if="showSelectAll">
        <label>
          <input
            type="checkbox"
            :checked="props.modelValue.length === selecteableOptions?.length"
            @click="toggleAllOptions"
            :disabled="props.disabled"
            value="all"
            tabindex="0"
          />
          {{ props.selectAllText }}
        </label>
      </li>

      <li v-if="props.clearable && props.modelValue.length > 0">
        <button
          type="button"
          @click="unselectAllOptions"
          :disabled="props.disabled"
        >
          {{ props.clearText }}
        </button>
      </li>

      <li
        v-for="(option, index) in orderedOptions?.slice(0, props.visibleLimit)"
        :key="option[modelKey]"
      >
        <slot
          name="optionSlot"
          :option="option"
          :checked="isOptionSelected(option)"
          :updateModelValue="setModelValue"
          :modelValue="props.modelValue"
          :index="index"
          :value="option[modelKey]"
          :multiple="props.multiple"
          :label="getLabel(option)"
        >
          <label>
            <input
              :type="multiple ? 'checkbox' : 'radio'"
              :disabled="option.disabled || props.disabled"
              :value="option[modelKey]"
              :checked="isOptionSelected(option)"
              @click="setModelValue"
              tabindex="0"
            />
            {{ getLabel(option) }}
            <base-badge v-if="option.badge !== undefined">{{
              option.badge === true ? "" : option.badge
            }}</base-badge>
          </label>
        </slot>
      </li>

      <li v-if="ariaBusy" aria-busy="true">{{ props.loadingText }}</li>
      <!-- if the results are limited because of the visible limit, but there are more filteredResults, show a message -->
      <li v-if="filteredOptions.length > props.visibleLimit">
        {{ props.searchEncouragement }}
      </li>
    </ul>
  </details>
</template>
<style scoped>
ul {
  max-height: 400px;
  overflow-y: auto;
  list-style: none;
}
</style>
