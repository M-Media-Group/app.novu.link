<script setup lang="ts">
import CreateRedirect from "@/forms/CreateRedirect.vue";
import CardElement from "@/components/CardElement.vue";
import { useI18n } from "vue-i18n";
import { provide, ref, watch } from "vue";
import image from "@/assets/undraw_online_payments_re_y8f2.svg";

const { locale } = useI18n();

const featureData = ref([] as any[]);
const faqData = ref([] as any[]);

const pricingData = ref([] as any[]);

// Load the features from the correct locale
const loadData = (dataset = "features", localeToUse = locale.value) => {
  return import(`@/data/${dataset}/${localeToUse}.json`).then(
    (module) => module.default
  );
};

watch(
  locale,
  async (newLocale) => {
    featureData.value = await loadData("features", newLocale);
    faqData.value = await loadData("faqs", newLocale);
    pricingData.value = await loadData("pricing", newLocale);
  },
  {
    immediate: true,
  }
);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

provide("showExpandedFooter", true);
</script>

<template>
  <section id="externalLinks" class="two-column-grid hero-section">
    <hgroup>
      <h1>{{ $t("Pricing that scales with you") }}</h1>
      <p>
        {{ $t(`Cancel anytime. Start for free, no credit card required.`) }}
      </p>
      <create-redirect
        :autofocus="false"
        :showNameInput="false"
        :inline="true"
      ></create-redirect>
    </hgroup>

    <img :src="image" alt="Link shortener" />
  </section>

  <section id="pricing">
    <hgroup>
      <h2>{{ $t("Pricing") }}</h2>
      <p>
        {{ $t("Billed anually. Cancel anytime") }}
      </p>
    </hgroup>
    <div class="three-column-grid">
      <card-element v-for="pricing in pricingData" :key="pricing.id">
        <hgroup>
          <h3>{{ pricing.name }}</h3>
          <p>{{ pricing.price }}</p>
        </hgroup>
        <p>{{ pricing.description }}</p>
        <ul>
          <li v-for="feature in pricing.features" :key="feature.id">
            <p>{{ feature }}</p>
          </li>
        </ul>
        <!-- Scroll to top button "Get started" -->
        <button type="button" @click="scrollToTop">
          {{ $t("Get started") }}
        </button>
      </card-element>
    </div>
  </section>

  <section id="features">
    <h2>{{ $t("Features") }}</h2>
    <table>
      <thead>
        <tr>
          <th>{{ $t("Feature") }}</th>
          <th>{{ $t("Basic") }}</th>
          <th>{{ $t("Tiny Tinkerer") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="feature in featureData" :key="feature.id">
          <td>
            {{ feature.name }}
            <span :data-tooltip="feature.description">?</span>
          </td>
          <td>{{ feature.min_subscription === 0 ? $t("Yes") : "-" }}</td>
          <td>{{ feature.min_subscription >= 0 ? $t("Yes") : "-" }}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section id="faq" class="two-column-grid">
    <h2>{{ $t("FAQ") }}</h2>
    <!-- For FAQ we will use a details -->
    <div>
      <details v-for="faq in faqData" :key="faq.id">
        <summary>{{ faq.question }}</summary>
        <p>{{ faq.answer }}</p>
      </details>
    </div>
  </section>

  <!-- Get started section -->
  <section id="getStarted">
    <hgroup>
      <h2>{{ $t("Get started") }}</h2>
      <p>
        {{
          $t(
            "Permanent QR codes exist as long as we’re around, and we don’t plan on going anywhere anytime soon."
          )
        }}
      </p>
    </hgroup>
    <card-element>
      <create-redirect :autofocus="false"></create-redirect>
    </card-element>
  </section>
</template>
<style scoped>
h2 {
  font-size: 300%;
}
h3 {
  font-size: 200%;
}
hgroup h2 + p {
  font-size: 300%;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  list-style-type: none;
  margin-bottom: calc(var(--pico-spacing) * 3);
}

section:not(.hero-section) {
  margin-bottom: calc(var(--pico-spacing) * 3);
}

img {
  border-radius: var(--pico-border-radius);
}

.tab-nav button {
  font-size: 300%;
}

.tab-nav {
  margin-bottom: var(--pico-spacing);
}

#faq {
  grid-template-columns: 1fr 3fr;
}

#faq summary {
  font-size: 120%;
  line-height: unset;
}

#faq details[open] > summary {
  margin-bottom: unset;
}

/* The second article in #pricing */
#pricing > div > :nth-child(2) {
  scale: 1.05;
  border-top-color: var(--pico-primary-color);
  border-top: calc(var(--pico-border-width) * 4) solid var(--pico-primary);
  border-radius: var(--pico-border-radius);
}
</style>
