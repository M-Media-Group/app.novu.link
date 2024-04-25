<script setup lang="ts">
import CreateRedirect from "@/forms/CreateRedirect.vue";
import CardElement from "@/components/CardElement.vue";
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";

const { t, locale } = useI18n();

const featureData = ref([] as any[]);
const testimonialData = ref([] as any[]);
const faqData = ref([] as any[]);
const goodPointsData = ref([] as any[]);
const painPointsData = ref([] as any[]);

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
  },
  {
    immediate: true,
  }
);
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

  <section id="testimonials">
    <h2>{{ $t("What our customers say") }}</h2>
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

  <section id="painPoints">
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

  <section id="goodPoints">
    <h2>{{ $t("How Novu.Link does even more") }}</h2>
    <ul>
      <li v-for="goodPoint in goodPointsData" :key="goodPoint.id">
        <hgroup>
          <h3>{{ goodPoint.name }}</h3>
        </hgroup>
        <p>{{ goodPoint.description }}</p>
      </li>
    </ul>
  </section>

  <section id="features">
    <h2>{{ $t("Features") }}</h2>
    <ul>
      <li v-for="feature in featureData" :key="feature.id">
        <hgroup>
          <h3>{{ feature.name }}</h3>
          <p>{{ feature.min_subscription === 0 ? "Free" : "Pro" }}</p>
        </hgroup>
        <p>{{ feature.description }}</p>
      </li>
    </ul>
  </section>

  <section id="faq">
    <h2>{{ $t("FAQ") }}</h2>
    <!-- For FAQ we will use a details -->
    <details v-for="faq in faqData" :key="faq.id">
      <summary>{{ faq.question }}</summary>
      <p>{{ faq.answer }}</p>
    </details>
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
</style>
