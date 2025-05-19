<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import {
  nextTick,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
} from "vue";
import { loadStripe } from "@stripe/stripe-js";
import { StripeElement, StripeElements } from "vue-stripe-js";
import { getCssVarForStripe } from "@/helpers/cssVariables";
import { useI18n } from "vue-i18n";
import BaseForm from "@/forms/BaseForm.vue";
import {
  addPaymentMethod as addPaymentMethodRepo,
  getPaymentIntent,
} from "@/repositories/payment/paymentRepository";

defineProps({
  showLabel: {
    type: Boolean,
    default: true,
  },
  submitText: {
    type: String,
  },
});

const success = ref(false);

const elementReady = ref(false);

const paymentInfoComplete = ref(false);

const baseFormRef = ref();

const userStore = useUserStore();

const form = reactive({
  paymentMethod: "",
  error: "",
  processing: false,
});

const emit = defineEmits(["success"]);

const handleStripeInput = async (event: { complete: any }) => {
  paymentInfoComplete.value = !!event.complete;
  if (paymentInfoComplete.value === true) {
    // Scroll to bottom
    // Wait for next tick
    nextTick(() => {
      // Focus on the submit button in the baseFormRef
    });
  }
};

const stripeLoaded = ref(false);
const elms = useTemplateRef<any>("elms");
const card = useTemplateRef<any>("card");

const clientSecret = ref();

const stripeKey = import.meta.env.VITE_STRIPE_KEY;

const { t } = useI18n();

onBeforeMount(() => {
  loadStripe(stripeKey).then(() => {
    stripeLoaded.value = true;
  });
});

onMounted(() => {
  getClientSecret();
});

const getClientSecret = async () => {
  const response = await getPaymentIntent();
  clientSecret.value = response.client_secret;
};

const addPaymentMethod = async () => {
  // Access instance methods, e.g. createToken()
  // Get stripe element

  if (!clientSecret.value) {
    form.error = t(
      "There was an error with the payment intent. Please try again."
    );
  }

  if (!card.value) {
    form.error = t(
      "There was an error with the card element. Please try again."
    );
  }

  if (form.error) {
    alert(form.error);
    return;
  }

  form.processing = true;

  const cardElement = card.value?.stripeElement;

  const result:
    | {
        error: { message: string };
        setupIntent: { payment_method: string };
      }
    | undefined = await elms.value?.instance.confirmCardSetup(
    clientSecret.value,
    {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: userStore.user?.name,
          email: userStore.user?.email,
        },
      },
    }
  );

  if (!result) {
    form.error = t(
      "There was an error with the payment intent. Please try again."
    );
    form.processing = false;
    return;
  }

  // Handle result.error or result.token
  if (result.error) {
    form.error = result.error.message;
    alert(form.error);
    form.processing = false;
  } else {
    if (!userStore.isAuthenticated) {
      return;
    }

    addPaymentMethodRepo(result.setupIntent)
      .then((response) => {
        // If the response is false, pass to the next catch
        if (!response) {
          throw new Error("Error adding payment method");
        }
        emit("success");
      })
      .catch((error) => {
        form.error = error.response.data.message;
      })
      .finally(() => {
        form.processing = false;
      });
  }
};

const appearanceVariables = {
  colorPrimary: getCssVarForStripe("pico-primary"),
  colorBackground: getCssVarForStripe("pico-form-element-background-color"),
  colorText: getCssVarForStripe("pico-form-element-color"),
  colorDanger: getCssVarForStripe("pico-form-element-invalid-border-color"),
  fontFamily: "system-ui,-apple-system,Roboto, Open Sans, Segoe UI, sans-serif",
  // spacingUnit: '2px',
  fontSizeBase: getCssVarForStripe("pico-font-size"),
  borderRadius: getCssVarForStripe("pico-border-radius"),
  // See all possible variables below
};

const elementStyle = {
  base: {
    iconColor: getCssVarForStripe("pico-form-element-color"),
    color: getCssVarForStripe("pico-form-element-color"),
    fontWeight: getCssVarForStripe("pico-font-weight"),
    fontFamily:
      "system-ui,-apple-system,Roboto, Open Sans, Segoe UI, sans-serif",
    fontSize: getCssVarForStripe("pico-font-size"),
    // Even though lineHeight is not suggested to be used by Stripe, we need it to keep a consistent look with Pico
    lineHeight: getCssVarForStripe("pico-line-height"),
    fontSmoothing: "antialiased",
    // ':-webkit-autofill': {
    //   color: '#fce883',
    // },
    "::placeholder": {
      color: getCssVarForStripe("pico-form-element-placeholder-color"),
    },
  },
  invalid: {
    iconColor: getCssVarForStripe("pico-form-element-invalid-border-color"),
    color: getCssVarForStripe("pico-form-element-invalid-border-color"),
  },
};

// The function receives event: { elementType: string } as a parameter - if we need it
const handleElementReady = async () => {
  elementReady.value = true;

  // Focus on the card
  await nextTick();
  focusOnInput();
};

const focusOnInput = () => {
  card.value?.stripeElement.focus();
};
</script>

<template>
  <base-form
    v-if="userStore.isAuthenticated"
    ref="baseFormRef"
    @submit="addPaymentMethod"
    :disabled="
      success || !stripeLoaded || !elementReady || !paymentInfoComplete
    "
    :is-loading="form.processing || !stripeLoaded"
    data-cy="add-payment-form"
    :submitText="submitText"
  >
    <label v-if="showLabel" @click="focusOnInput()">{{
      $t("Add a payment method")
    }}</label>
    <stripe-elements
      @click="focusOnInput()"
      class="input"
      v-if="stripeLoaded"
      v-slot="{ elements }"
      ref="elms"
      :stripe-key="stripeKey"
      :aria-busy="!elementReady"
      data-cy="add-payment-input"
      :elements-options="{
        locale: $i18n.locale,
        appearance: {
          variables: appearanceVariables,
        },
      }"
    >
      <stripe-element
        v-show="elementReady"
        ref="card"
        :elements="elements"
        @change="handleStripeInput($event)"
        @ready="handleElementReady"
        :options="{
          style: elementStyle,
        }"
      />
    </stripe-elements>
    <!-- this v-else input prevents layout shift while the above Stripe Elements are loading-->
    <input
      v-else
      type="text"
      disabled
      placeholder="Card number"
      :aria-busy="true"
    />
  </base-form>
  <div v-else>{{ $t("Login or sign up to continue") }}</div>
</template>
