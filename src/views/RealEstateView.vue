<script setup lang="ts">
import CreateRedirect from "@/forms/CreateRedirect.vue";
import CardElement from "@/components/CardElement.vue";
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";
import image from "@/assets/undraw_buy_house_re_8xq7-2.svg";
import TabNav from "@/components/TabNav.vue";
import { assetUrl, loadData } from "@/helpers/dataLoader";

const { locale } = useI18n();

const featureData = ref([] as any[]);
const testimonialData = ref([] as any[]);
const faqData = ref([] as any[]);
const goodPointsData = ref([] as any[]);
const painPointsData = ref([] as any[]);
const pricingData = ref([] as any[]);
const featuresByGroupData = ref([] as any[]);

const openTabs = ref(["1"]);

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
</script>

<template>
  <section id="externalLinks" class="two-column-grid hero-section">
    <hgroup>
      <h1>{{ $t("Track property engagement with advanced QR codes") }}</h1>
      <p>
        {{
          $t(
            `Learn who is interacting with your property listings on display. Get insights into what is working and what isn't.`
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
    <ul class="three-column-grid">
      <li
        v-for="testimonial in testimonialData
          .filter((item) => item.industry === 'real_estate')
          .slice(0, 3)"
        :key="testimonial.id"
      >
        <hgroup>
          <h3>{{ testimonial.name }}</h3>
          <p v-if="testimonial.subtitle">{{ testimonial.subtitle }}</p>
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
        <summary>{{ faq.name }}</summary>
        <p>{{ faq.description }}</p>
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
