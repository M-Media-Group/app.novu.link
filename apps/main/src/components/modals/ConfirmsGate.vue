<script setup lang="ts">
import {
  type PropType,
  defineAsyncComponent,
  ref,
  shallowRef,
  useSlots,
  useTemplateRef,
} from "vue";
import BaseModal from "@/components/modals/BaseModal.vue";
import type {
  Gate,
  GateOptions,
} from "@m-media/vue3-gate-keeper/src/gateKeeper";
import { useGateKeeper } from "@m-media/vue3-gate-keeper";

const props = defineProps({
  /** The title of the modal. It will be in the header of the opened modal. */
  title: {
    type: String,
    required: true,
  },
  /** The gate or gates to check before confirming. */
  gate: {
    type: [Array, String] as PropType<string | Gate | (Gate | string)[]>,
    required: true,
  },

  /** The description of the modal. It will be in the body of the opened modal. */
  description: {
    type: String as PropType<string | null>,
    default: null,
  },

  /** Set to false to prevent the modal from closing when the background is clicked. */
  allowBackgroundClickToClose: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const slots = useSlots();

const formToUse = ref();

const emits = defineEmits(["confirmed"]);

const modal = useTemplateRef("modal");

const isConfirming = ref(false);

const interceptedByGate = ref("");

type RunGatesFunction = (arg1: string | Gate | (string | Gate)[]) => {
  handle: () => Promise<{
    data: boolean | string;
    gate: string;
  }>;
};

const runGates = useGateKeeper() as RunGatesFunction;


const getGateDataFromProps = (
  gateName: string
): GateOptions["gateOptions"] | undefined => {
  if (typeof props.gate === "string") {
    return;
  }
  // If the props.gate is a single gate, return it
  if (!Array.isArray(props.gate)) {
    return props.gate.options;
  }

  const response = props.gate.find((gate) => {
    return typeof gate !== "string" && gate?.name === gateName
      ? gate
      : undefined;
  });

  return typeof response === "string" ? undefined : response?.options;
};

const startConfirming = async () => {
  if (props.gate === undefined) {
    return;
  }

  isConfirming.value = true;

  const gateResponse = await runGates(props.gate).handle();

  if (gateResponse?.data === undefined) {
    return HandleConfirmed();
  }

  interceptedByGate.value = gateResponse.gate;

  if (
    gateResponse.data === false &&
    !slots["confirmationElement:" + interceptedByGate.value]
  ) {
    return HandleFailed();
  }

  if (typeof gateResponse.data === "string") {
    formToUse.value = gateResponse.data;
    setElement();
  }

  modal.value?.openModal();
};

const HandleConfirmed = () => {
  emits("confirmed");
  modal.value?.closeModal();
};

const HandleFailed = () => {
  modal.value?.closeModal();
};

const ConfirmationElement = shallowRef();

const setElement = () => {
  ConfirmationElement.value = defineAsyncComponent(
    () => import(`./../../forms/${formToUse.value}.vue`)
  );
};

defineExpose({
  startConfirming,
});
</script>
<template>
  <span>
    <span @click.prevent="startConfirming">
      <!-- @slot This is the slot for the trigger of the confirmation. You can use this to create a button or any other element to trigger the confirmation. It will be wrapped in a click handler that will trigger the confirmation modal. -->
      <slot :is-confirming="isConfirming" />
    </span>

    <base-modal
      ref="modal"
      :title="getGateDataFromProps(interceptedByGate)?.title ?? title"
      :show-trigger="false"
      :show-footer="false"
      :allow-background-click-to-close="allowBackgroundClickToClose"
      @closed="isConfirming = false"
    >
      <p v-if="description">
        {{ description }}
      </p>
      <!-- @slot This is the slot for the confirmation element. This is the form or element that will be shown in the modal. -->
      <slot
        :name="'confirmationElement:' + interceptedByGate"
        :success="startConfirming"
        :fail="HandleFailed"
      >
        <component
          :is="ConfirmationElement"
          v-if="formToUse && modal?.isModalOpen"
          v-bind="getGateDataFromProps(interceptedByGate)"
          @success="startConfirming"
        />
      </slot>
    </base-modal>
  </span>
</template>
