<script lang="ts" setup>
import DropdownSelect from "@/components/DropdownSelect.vue";
import { type PropType, onMounted, ref } from "vue";
import type { Redirect } from "@novulink/types";
import type { SelectOptionObject } from "@novulink/types";
import CreateRedirect from "@/forms/CreateRedirect.vue";
import { getRedirects } from "@novulink/api";

const props = defineProps({
  modelValue: {
    type: Array as PropType<Redirect["uuid"][]>,
    required: true,
  },

  /** The required flag */
  required: {
    type: Boolean,
    required: false,
    default: true,
  },

  /** If unsubscribed redirects should be not selectable */
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

const isLoading = ref(false);

const isOpenValueSelector = ref(false);

const redirectOptions = ref([] as SelectOptionObject[]);
const searchTerm = ref("");

const getTeamRedirects = async (): Promise<SelectOptionObject[]> => {
  isLoading.value = true;
  let data: SelectOptionObject[] = [];

  try {
    const response = await getRedirects();
    data = response.map(
      (redirect) =>
        ({
          id: redirect.uuid,
          render: redirect.name,
          badge: redirect.subscribed_at ? undefined : "Not Subscribed",
          disabled: props.subscribedOnly && !redirect.subscribed_at,
        } as SelectOptionObject)
    );

    return data;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }

  return [];
};

onMounted(async () => {
  redirectOptions.value = await getTeamRedirects();
});

const handleSelect = (selected: Redirect["uuid"][]) => {
  emit("update:modelValue", selected);
  isOpenValueSelector.value = false;
};

const emit = defineEmits<{
  "update:modelValue": [Redirect["uuid"][]];
}>();
</script>
<template>
  <template v-if="!isLoading && redirectOptions.length === 0">
    <create-redirect
      :inline="true"
      :show-name-input="false"
      :show-label="false"
      :redirect-on-success="false"
      @success="
        ($event) => {
          redirectOptions.push({
            id: $event,
            render: $event,
          });
          handleSelect([$event]);
        }
      "
    />
  </template>
  <dropdown-select
    v-else
    v-model:is-open="isOpenValueSelector"
    v-model:search="searchTerm"
    name="redirect"
    :options="redirectOptions"
    :aria-busy="isLoading"
    :searchable="redirectOptions.length > 10"
    :show-selected-first="true"
    :model-value="modelValue"
    :required="required"
    :autofocus="true"
    :multiple="multiple"
    @update:model-value="handleSelect"
  />
</template>
