<script setup lang="ts">
import { type PropType, computed, reactive, ref, toRefs, watch } from "vue";
import BaseForm from "./BaseForm.vue";
import TabNav from "@/components/TabNav.vue";
import type { HexColor, QRDesign } from "@/types/qrDesign";
import type { selectOption } from "@/types/listItem";
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from "@/components/BaseButton.vue";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import { getContrastRatio } from "@/helpers/colors";
import { createQrDesign } from "@/repositories/qrdesign/qrdesignRepository";

const props = defineProps({
  /** The redirect uuid */
  redirectId: {
    type: String,
    required: false,
  },
  /** The logo size */
  includePages: {
    type: Array as PropType<string[]>,
    required: false,
    default: () => ["color", "shape", "logo", "name", "advanced"],
  },

  /** If the submit button should be shown. We may want to not show the button if the form is used only for dynamic viewing */
  showSubmitButton: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const modal = ref();

const state = reactive({
  name: "" as QRDesign["name"],
  color: "#000000" as HexColor,
  backgroundColor: "#ffffff" as HexColor,
  blockShape: "square" as QRDesign["block_shape"],
  cornerDotShape: "square" as QRDesign["corner_dot_shape"],
  cornerShape: "square" as QRDesign["corner_shape"],
  errorCorrectionLevel: "medium" as QRDesign["error_correction_level"],
  roundBlockSizeMode: "margin" as QRDesign["round_block_size_mode"],
  logo: null as QRDesign["logo"],
  logoSize: 0 as QRDesign["logo_size"],
  logoPunchout: true as QRDesign["logo_punchout_background"],
});

const {
  name,
  color,
  backgroundColor,
  blockShape,
  cornerDotShape,
  cornerShape,
  errorCorrectionLevel,
  roundBlockSizeMode,
  logo,
  logoSize,
  logoPunchout,
} = toRefs(state);

const openTabs = ref(["1"]);

const baseFormRef = ref();

// const emit = defineEmits(["success", "input_updated"]);

const emit = defineEmits<{
  success: [];
  input_updated: [QRDesign];
}>();

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!name.value) {
    return;
  }
  await createQrDesign({
    name: name.value,
    color: color.value,
    background_color: backgroundColor.value,
    block_shape: blockShape.value,
    corner_dot_shape: cornerDotShape.value,
    corner_shape: cornerShape.value,
    error_correction_level: errorCorrectionLevel.value,
    round_block_size_mode: roundBlockSizeMode.value,
    logo: logo.value ?? null,
    logo_punchout_background: logoPunchout.value ?? false,
    redirect_uuid: props.redirectId,
  });
};

// Watch all inputs and emit the input_updated event
watch(
  [
    name,
    color,
    backgroundColor,
    blockShape,
    cornerDotShape,
    cornerShape,
    errorCorrectionLevel,
    logo,
    logoPunchout,
  ],
  () => {
    emit("input_updated", {
      name: name.value,
      color: color.value,
      background_color: backgroundColor.value,
      block_shape: blockShape.value,
      corner_dot_shape: cornerDotShape.value,
      corner_shape: cornerShape.value,
      error_correction_level: errorCorrectionLevel.value,
      round_block_size_mode: roundBlockSizeMode.value,
      logo: logo.value,
      logo_punchout_background: logoPunchout.value,
    });
  }
);

const hasSufficientContranstRatio = computed(() => {
  return getContrastRatio(color.value, backgroundColor.value) >= 3;
});

const handleLogoFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) {
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(target.files[0]);
  reader.onload = () => {
    logo.value = reader.result as string;
  };
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @success="emit('success')"
    :submitFn="submitForm"
    :showSubmitButton="showSubmitButton"
  >
    <tab-nav
      class="qr-design-nav"
      :options="
        [
          includePages.includes('color')
            ? {
                render: $t('Color'),
                id: '1',
                badge: !hasSufficientContranstRatio ? $t('Fix now') : undefined,
              }
            : undefined,

          includePages.includes('shape')
            ? { render: $t('Shape'), id: '2' }
            : undefined,

          includePages.includes('logo')
            ? { render: $t('Logo'), id: '3' }
            : undefined,

          includePages.includes('name')
            ? {
                render: $t('Name'),
                id: '5',
                badge: !name || name.length < 2 ? $t('Required') : undefined,
              }
            : undefined,

          includePages.includes('advanced')
            ? { render: $t('Advanced'), id: '4' }
            : undefined,
        ].filter(Boolean) as selectOption[]
      "
      v-model="openTabs"
    ></tab-nav>
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <fieldset
      v-if="includePages.includes('color')"
      v-show="openTabs.includes('1')"
    >
      <label for="color">{{ $t("Color") }}</label>
      <input id="color" type="color" v-model="color" name="color" required />
      <label for="background_color">{{ $t("Background color") }}</label>
      <input
        id="background_color"
        type="color"
        v-model="backgroundColor"
        name="background_color"
        required
      />
      <div class="input" v-show="!hasSufficientContranstRatio">
        {{
          $t("The contrast ratio is too low. The QR code may not be scannable.")
        }}
      </div>
    </fieldset>
    <fieldset
      v-if="includePages.includes('shape')"
      v-show="openTabs.includes('2')"
    >
      <label for="shape">{{ $t("Shape") }}</label>
      <select name="shape" id="shape" v-model="blockShape" required>
        <option value="circle">{{ $t("Circle") }}</option>
        <option value="rounded">{{ $t("Rounded") }}</option>
        <option value="extra-rounded">{{ $t("Extra Rounded") }}</option>
        <option value="classy">{{ $t("Classy") }}</option>
        <option value="classy-rounded">{{ $t("Classy Rounded") }}</option>
        <option value="square">{{ $t("Square") }}</option>
      </select>

      <label for="cornerDotShape">{{ $t("Corner dot shape") }}</label>
      <!-- Circle or square -->
      <select
        name="cornerDotShape"
        id="cornerDotShape"
        v-model="cornerDotShape"
        required
      >
        <option value="circle">{{ $t("Circle") }}</option>
        <option value="square">{{ $t("Square") }}</option>
      </select>

      <label for="cornerShape">{{ $t("Corner shape") }}</label>
      <select
        name="cornerShape"
        id="cornerShape"
        v-model="cornerShape"
        required
      >
        <option value="circle">{{ $t("Circle") }}</option>
        <option value="rounded">{{ $t("Rounded") }}</option>
        <option value="square">{{ $t("Square") }}</option>
      </select>
    </fieldset>

    <fieldset
      v-if="includePages.includes('logo')"
      v-show="openTabs.includes('3')"
    >
      <label for="logoFile">{{ $t("Logo") }}</label>
      <input
        id="logoFile"
        type="file"
        accept="image/*"
        @change="handleLogoFile"
        name="logoFile"
      />
      <label for="logoSize">{{ $t("Logo size") }}</label>
      <input
        id="logoSize"
        type="number"
        v-model="logoSize"
        name="logoSize"
        min="0"
        max="100"
        required
      />
      <label for="logoPunchout"
        >{{ $t("Logo punchout") }}
        <!-- Radio for yes / no -->
        <input
          id="logoPunchout"
          type="checkbox"
          v-model="logoPunchout"
          name="logoPunchout"
        />
      </label>
    </fieldset>

    <fieldset
      v-if="includePages.includes('advanced')"
      v-show="openTabs.includes('4')"
    >
      <label for="errorCorrectionLevel">{{
        $t("Error correction level")
      }}</label>
      <select
        name="errorCorrectionLevel"
        id="errorCorrectionLevel"
        v-model="errorCorrectionLevel"
        required
      >
        <option value="low">{{ $t("Low") }}</option>
        <option value="medium">{{ $t("Medium") }}</option>
        <option value="quartile">{{ $t("Quartile") }}</option>
        <option value="high">{{ $t("High") }}</option>
      </select>

      <label for="roundBlockSizeMode">{{ $t("Round block size mode") }}</label>
      <select
        name="roundBlockSizeMode"
        id="roundBlockSizeMode"
        v-model="roundBlockSizeMode"
        required
      >
        <option value="margin">{{ $t("Margin") }}</option>
        <option value="enlarge">{{ $t("Enlarge") }}</option>
        <option value="shrink">{{ $t("Shrink") }}</option>
        <option value="none">{{ $t("None") }}</option>
      </select>
    </fieldset>

    <fieldset
      v-if="includePages.includes('name')"
      v-show="openTabs.includes('5')"
    >
      <label for="name">{{ $t("Design Name") }}</label>
      <input
        type="text"
        id="name"
        name="name"
        :placeholder="$t('Design Name')"
        v-model="name"
        minlength="2"
        pattern=".{2,}"
        autofocus
        autocomplete="off"
        required
      />
    </fieldset>

    <!-- </TransitionGroup> -->
    <template #submit="{ isLoading, submit }" v-if="showSubmitButton">
      <base-modal title="Create design" ref="modal" class="full-width">
        <template #trigger="{ openModal }">
          <base-button @click.prevent="openModal" type="submit">
            {{ $t("Create design") }}
          </base-button>
        </template>
        <fieldset>
          <label for="nameModal">{{ $t("Design Name") }}</label>
          <input
            type="text"
            id="nameModal"
            name="name"
            :placeholder="$t('Design Name')"
            v-model="name"
            minlength="2"
            pattern=".{2,}"
            autofocus
            autocomplete="off"
            required
          />
        </fieldset>
        <template #footer>
          <confirms-gate
            :title="$t('Enable custom designs')"
            :description="
              $t(
                'Additional destinations and design changes are free after you subscribe.'
              )
            "
            :allowBackgroundClickToClose="false"
            :gate="['confirmedEmailOrPhone']"
            @confirmed="submit()"
          >
            <base-button :disabled="!name || isLoading" type="submit">{{
              $t("Create design")
            }}</base-button>
          </confirms-gate>
        </template>
      </base-modal>
    </template>
  </base-form>
</template>
