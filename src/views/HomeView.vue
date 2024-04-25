<script setup lang="ts">
import CreateRedirect from "@/forms/CreateRedirect.vue";
import CardElement from "@/components/CardElement.vue";
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";
import NewNovuLinkDemo from "@/assets/CroppedNovuLinkDemo.gif";

const { locale } = useI18n();

const featureData = ref([] as any[]);
const testimonialData = ref([] as any[]);
const faqData = ref([] as any[]);
const goodPointsData = ref([] as any[]);
const painPointsData = ref([] as any[]);
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
    testimonialData.value = await loadData("testimonials", newLocale);
    faqData.value = await loadData("faqs", newLocale);
    goodPointsData.value = await loadData("goodPoints", newLocale);
    painPointsData.value = await loadData("painPoints", newLocale);
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
</script>

<template>
  <section id="externalLinks" class="two-column-grid hero-section">
    <hgroup>
      <h1>{{ $t("Solve QR codes forever") }}</h1>
      <p>
        {{
          $t(
            `The hardest thing with QR codes and links is changing them after they're printed. We've fixed that.`
          )
        }}
      </p>
    </hgroup>
    <card-element>
      <create-redirect :autofocus="false"></create-redirect>
    </card-element>
  </section>

  <section id="testimonials" class="two-column-grid">
    <hgroup>
      <h2>{{ $t("What our customers say") }}</h2>
      <p>
        {{ $t("Across industries, our magic links are making a difference") }}
      </p>
    </hgroup>
    <ul>
      <li v-for="testimonial in testimonialData" :key="testimonial.id">
        <hgroup>
          <h3>{{ testimonial.name }}</h3>
          <p v-if="testimonial.jobTitle">{{ testimonial.jobTitle }}</p>
        </hgroup>
        <p>{{ testimonial.description }}</p>
      </li>
    </ul>
  </section>

  <section id="goodPoints">
    <hgroup>
      <h2>{{ $t("How Novu.Link does even more") }}</h2>
      <p>
        {{
          $t(
            "We've taken the best parts of QR codes and made them even better."
          )
        }}
      </p>
    </hgroup>
    <div class="two-column-grid">
      <img :src="NewNovuLinkDemo" alt="Novu.Link demo" />
      <ul>
        <li v-for="goodPoint in goodPointsData" :key="goodPoint.id">
          <hgroup>
            <h3>{{ goodPoint.name }}</h3>
          </hgroup>
          <p>{{ goodPoint.description }}</p>
        </li>
      </ul>
    </div>
  </section>

  <section id="painPoints" class="two-column-grid">
    <h2>{{ $t("Situations Novu.Link saves you from") }}</h2>
    <ul>
      <li v-for="painPoint in painPointsData" :key="painPoint.id">
        <hgroup>
          <h3>{{ painPoint.name }}</h3>
        </hgroup>
        <p>{{ painPoint.description }}</p>
      </li>
    </ul>
  </section>

  <section id="pricing">
    <hgroup>
      <h2>{{ $t("Pricing") }}</h2>
      <p>
        {{ $t("Billed anually. Cancel anytime") }}
      </p>
    </hgroup>
    <ul class="three-column-grid">
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
    </ul>
  </section>

  <section id="features">
    <h2>{{ $t("Features") }}</h2>
    <ul class="two-column-grid">
      <li v-for="feature in featureData" :key="feature.id">
        <hgroup>
          <h3>{{ feature.name }}</h3>
          <p>{{ feature.min_subscription === 0 ? "Free" : "Pro" }}</p>
        </hgroup>
        <p>{{ feature.description }}</p>
      </li>
    </ul>
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
      <create-redirect :autofocus="true"></create-redirect>
    </card-element>
  </section>
</template>
<style scoped>
.hero-section {
  grid-template-columns: 3fr 2fr;
}
h2 {
  font-size: 300%;
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
</style>
