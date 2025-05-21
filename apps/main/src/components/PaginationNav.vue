<script setup lang="ts">
import BaseButton from "./BaseButton.vue";
import { usePages } from "@/composables/usePages";

const emit = defineEmits([
  /** The page the user has navigated to, either by clicking directly on a page or by using the previous and next buttons */
  "update:currentPage",
]);

const props = defineProps({
  /** The count of total items */
  totalItems: {
    type: Number,
    required: true,
    validator: (value: number) => value >= 0,
  },
  /** The current page. Note that this is the same as the emit, so when using this component, you can just use a v-model:currentPage for two-way binding */
  currentPage: {
    type: Number,
    required: false,
    default: 1,
  },
  /** The results to show per page */
  resultsPerPage: {
    type: Number,
    required: false,
    default: 5,
  },
  /** The maximum amount of pages to show before truncating. Basically, it will be: [min-page] ... [x amount of pages around and including the current page, determined by this prop] ... [max-page] */
  maxPages: {
    type: Number,
    required: false,
    default: 5,
    validator: (value: number) => value >= 3,
  },
  /** Show the previous and next buttons */
  showPrevNext: {
    type: Boolean,
    required: false,
    default: true,
  },
  /** An optional lastPage parameter to override the calculated last page. If this value is set and less than the calculated last page, then the pagination will show the last page as this value */
  lastPage: {
    type: Number,
    required: false,
  },
  /** The text to use in the separator */
  separatorText: {
    type: String,
    required: false,
    default: "...",
  },
  /** Go to page input */
  goToPage: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const {pages, totalPages} = usePages(props);

const handleInput = (value: string) => {
  const number = parseInt(value, 10);
  if (number > 0 && number <= totalPages.value) {
    emit("update:currentPage", number);
  }
};
</script>
<template>
  <nav aria-label="Pagination">
    <template v-if="showPrevNext">
      <base-button
        aria-label="Previous page"
        class="prev"
        :disabled="currentPage <= 1"
        @click="emit('update:currentPage', currentPage - 1)"
      >
        <span aria-hidden="true">&laquo;</span>
      </base-button>
    </template>
    <template
      v-for="page in pages"
      :key="page.pageNumber"
    >
      <base-button
        v-if="page.clickable"
        :aria-label="`Go to page ${page.pageNumber}`"
        :disabled="page.pageNumber === currentPage"
        class="outline contrast"
        @click="emit('update:currentPage', page.pageNumber)"
      >
        {{ page.text }}
      </base-button>
      <button
        v-else
        disabled
        class="outline secondary"
        type="button"
      >
        {{ page.text }}
      </button>
    </template>
    <template v-if="goToPage">
      <input
        type="number"
        min="1"
        :max="totalPages"
        :value="currentPage"
        aria-label="Go to page"
        class="go-to-page"
        @input="handleInput(($event.target as HTMLInputElement).value)"
      >
    </template>
    <template v-if="showPrevNext">
      <base-button
        aria-label="Next page"
        class="next"
        :disabled="currentPage >= totalPages"
        @click="emit('update:currentPage', currentPage + 1)"
      >
        <span aria-hidden="true">&raquo;</span>
      </base-button>
    </template>
  </nav>
</template>
