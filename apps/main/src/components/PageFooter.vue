<script setup lang="ts">
import i18n, { SUPPORT_LOCALES, setI18nLanguage } from "@/locales/i18n";
import theme, { setTheme } from "@/themes/useTheme";

const appName = import.meta.env.VITE_APP_NAME;

const handleLocaleChange = (locale: string) => {
  setI18nLanguage(i18n, locale);
};
</script>
<template>
  <footer>
    <ul>
      <li>{{ appName }}</li>
      <li>
        <select
          name="dark-mode"
          aria-label="Dark Mode toggle"
          :value="theme"
          @change="setTheme(($event.target as HTMLSelectElement).value)"
        >
          <option value="system">
            {{ $t("Auto") }}
          </option>
          <option value="light">
            {{ $t("Light") }}
          </option>
          <option value="dark">
            {{ $t("Dark") }}
          </option>
        </select>
      </li>
      <li>
        <select
          v-model="$i18n.locale"
          name="locales"
          aria-label="locale"
          @change="
            handleLocaleChange(($event.target as HTMLSelectElement).value)
          "
        >
          <option
            v-for="locale in SUPPORT_LOCALES"
            :key="`locale-${locale}`"
            :value="locale"
          >
            {{ $t(locale) }}
          </option>
        </select>
      </li>
    </ul>
  </footer>
</template>
