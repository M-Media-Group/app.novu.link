<script setup lang="ts">
import CreateRedirect from "@/forms/CreateRedirect.vue";
import CardElement from "@/components/CardElement.vue";
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";
import image from "@/assets/undraw_share_link.svg";
import TabNav from "@/components/TabNav.vue";

const { locale } = useI18n();

const featureData = ref([] as any[]);
const testimonialData = ref([] as any[]);
const faqData = ref([] as any[]);
const goodPointsData = ref([] as any[]);
const painPointsData = ref([] as any[]);
const pricingData = ref([] as any[]);
const featuresByGroupData = ref([] as any[]);

const openTabs = ref(["1"]);

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
    featuresByGroupData.value = await loadData("featuresByGroup", newLocale);
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

const computeTabOptions = (featuresByGroupData: any[]) => {
  return featuresByGroupData.map((group) => ({
    render: group.name,
    id: group.id,
  }));
};

/**
 *
 * @param asset - the asset to get
 */
const assetUrl = (asset: string, extension = "png") =>
  new URL(
    `../assets/${asset}`,

    import.meta.url
  ).href;
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
      <create-redirect
        :autofocus="false"
        :showNameInput="false"
        :inline="true"
      ></create-redirect>
    </hgroup>

    <img :src="image" alt="Link shortener" />
  </section>

  <section id="testimonials">
    <hgroup>
      <h2>{{ $t("What our customers say") }}</h2>
      <p>
        {{ $t("Across industries, our magic links are making a difference") }}
      </p>
    </hgroup>
    <ul class="two-column-grid">
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
    <tab-nav
      :options="computeTabOptions(featuresByGroupData)"
      v-model="openTabs"
    >
    </tab-nav>

    <ul>
      <li
        v-for="goodPoint in featuresByGroupData"
        :key="goodPoint.id"
        v-show="openTabs.includes(`${goodPoint.id}`)"
        class="two-column-grid three-two-grid"
      >
        <div>
          <hgroup>
            <h3>{{ goodPoint.title }}</h3>
          </hgroup>
          <p>{{ goodPoint.description }}</p>
        </div>
        <img :src="assetUrl(goodPoint.image)" alt="Novu.Link demo" />
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
      <create-redirect :autofocus="false"></create-redirect>
    </card-element>
  </section>
</template>
<style scoped>
.hero-section,
.three-two-grid {
  grid-template-columns: 3fr 2fr;
}
.hero-section hgroup > p {
  margin-bottom: var(--pico-spacing);
}
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
</style>
