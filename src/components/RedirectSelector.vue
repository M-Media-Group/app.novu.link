<script lang="ts" setup>
import DropdownSelect from "@/components/DropdownSelect.vue";
import { type PropType, onMounted, ref } from "vue";
import axios from "axios";
import type { Redirect } from "@/types/redirect";
import type { selectOptionObject } from "@/types/listItem";

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

const redirectOptions = ref([] as selectOptionObject[]);
const searchTerm = ref("");

const getTeamRedirects = async (): Promise<selectOptionObject[]> => {
  isLoading.value = true;
  let data: selectOptionObject[] = [];

  const response = await axios.get("/api/v1/redirects");

  if (response.status === 200) {
    data = response.data.map(
      (redirect: Redirect) =>
        ({
          id: redirect.uuid,
          render: redirect.name,
          badge: redirect.subscribed_at ? undefined : "Not Subscribed",
          disabled: props.subscribedOnly && !redirect.subscribed_at,
        } as selectOptionObject)
    );
  }

  isLoading.value = false;

  return data;
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
  <dropdown-select
    name="redirect"
    :options="redirectOptions"
    :aria-busy="isLoading"
    :searchable="redirectOptions.length > 10"
    v-model:is-open="isOpenValueSelector"
    v-model:search="searchTerm"
    :showSelectedFirst="true"
    :modelValue="modelValue"
    @update:modelValue="handleSelect"
    :required="required"
    :autofocus="true"
    :multiple="multiple"
  />
</template>
