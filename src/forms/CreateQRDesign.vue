<script setup lang="ts">
import { type PropType, type Ref, computed, ref, watch } from "vue";
import BaseForm from "./BaseForm.vue";
import TabNav from "@/components/TabNav.vue";
import type { HexColor, QRDesign } from "@/types/qrDesign";
import type { selectOption } from "@/types/listItem";
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from "@/components/BaseButton.vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import { apiService } from "@/services/apiClient";

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

const $bus = useEventsBus();

const isLoading = ref(false);

const modal = ref();

const name = ref("") as Ref<QRDesign["name"]>;
const color = ref("#000000") as Ref<HexColor>;
const backgroundColor = ref("#ffffff") as Ref<HexColor>;
const blockShape = ref("square") as Ref<QRDesign["block_shape"]>;
const cornerDotShape = ref("square") as Ref<QRDesign["corner_dot_shape"]>;
const cornerShape = ref("square") as Ref<QRDesign["corner_shape"]>;
const errorCorrectionLevel = ref("medium") as Ref<
  QRDesign["error_correction_level"]
>;
const roundBlockSizeMode = ref("margin") as Ref<
  QRDesign["round_block_size_mode"]
>;

const logo = ref(null) as Ref<QRDesign["logo"]>;
const logoSize = ref(0) as Ref<QRDesign["logo_size"]>;
const logoPunchout = ref(true) as Ref<QRDesign["logo_punchout_background"]>;

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
  await apiService.post("/api/v1/qr-designs", {
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
    redirect_uuid: props.redirectId,
  });

  $bus.$emit(eventTypes.created_qr_design);
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

const getContrastRatio = (color1: HexColor, color2: HexColor) => {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  return (
    (Math.max(luminance1, luminance2) + 0.05) /
    (Math.min(luminance1, luminance2) + 0.05)
  );
};

const getLuminance = (color: HexColor) => {
  const rgb = hexToRgb(color);
  const srgb = rgb.map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

const hexToRgb = (hex: HexColor) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(
    shorthandRegex,
    (m, r, g, b) => r + r + g + g + b + b
  ) as HexColor;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error("Invalid hex color");
  }

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
};

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
