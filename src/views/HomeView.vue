<script setup lang="ts">
import CreateRedirect from "@/forms/CreateRedirect.vue";
import CardElement from "@/components/CardElement.vue";
import { useI18n } from "vue-i18n";
import { onMounted, provide, ref, watch } from "vue";
import image from "@/assets/undraw_share_link.svg";
import TabNav from "@/components/TabNav.vue";
import { assetUrl, loadData } from "@/helpers/dataLoader";
import type { QRDesign } from "@/types/qrDesign";
import { getQrDesignLogos } from "@/repositories/qrdesign/qrdesignRepository";

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

const logos = ref<QRDesign[]>([]);

onMounted(async () => {
  logos.value = (await getQrDesignLogos()) ?? [];
});

provide("showExpandedFooter", true);
</script>

<template>
  <section
    id="externalLinks"
    class="two-column-grid hero-section fulscreen-width-container"
  >
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
        :buttonClasses="['contrast']"
      ></create-redirect>
    </hgroup>

    <img :src="image" alt="Link shortener" />
    <div>
      <small>🔐 {{ $t("Trusted to link to:") }}</small>
      <div class="image-scroller">
        <img
          v-for="logo in logos"
          :key="logo.id"
          :src="logo.logo!"
          alt="Logo"
          loading="lazy"
        />
      </div>
    </div>
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
        v-for="testimonial in testimonialData.slice(0, 3)"
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

  <section id="goodPoints" class="fulscreen-width-container" data-theme="light">
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

  <section id="features" class="fulscreen-width-container">
    <h2>{{ $t("Features") }}</h2>
    <table>
      <thead>
        <tr>
          <th>{{ $t("Feature") }}</th>
          <th>{{ $t("Free") }}</th>
          <th>{{ $t("Tiny Tinkerer") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="feature in featureData" :key="feature.id">
          <td>
            {{ feature.name }}
            <br />
            <small class="muted">{{ feature.description }}</small>
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
  <section id="getStarted" class="fulscreen-width-container" data-theme="dark">
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

div.image-scroller {
  overflow-x: auto;
  display: flex;
  height: 40px;

  gap: var(--pico-spacing);
  > img {
    flex: 1;
    height: 40px;
    object-fit: contain;
    aspect-ratio: 1;
    margin: 0 auto;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.hero-b {
  /* margin-left: calc(var(--pico-spacing) * -1);
  padding-left: 3rem;
  padding-right: 3rem; */
  background-color: var(--pico-primary);
  margin-top: -1rem;

  --pico-color: var(--pico-primary-inverse);
  --pico-muted-color: var(--pico-color);

  & [data-theme="dark"] {
    --pico-color: var(--pico-primary-inverse);
    --pico-muted-color: var(--pico-color);
  }

  & small {
    color: var(--pico-muted-color);
  }
}

#testimonials {
  & li {
    margin-bottom: 0;
  }
}

section {
  padding-top: calc(
    var(--pico-block-spacing-vertical) * 3 + var(--pico-spacing)
  );
}

#faq,
#pricing {
  padding-top: 0;
}

#features {
  background-color: var(--pico-contrast);
  color: var(--pico-contrast-inverse);
  & *:not(input, button, code, small) {
    color: var(--pico-contrast-inverse);
  }

  & table,
  td,
  th {
    background-color: var(--pico-contrast);
  }
}

#goodPoints,
#getStarted {
  background: var(--pico-mark-background-color);
}

#features,
#getStarted {
  padding-bottom: calc(var(--pico-spacing) * 3);
}

#goodPoints {
  --pico-muted-color: var(--pico-contrast);
}

#getStarted {
  margin-bottom: 0;

  & p {
    color: var(--pico-h2-color);
  }
}

/* The first section */
section:first-of-type {
  padding-top: var(--pico-block-spacing-vertical);
}
</style>
