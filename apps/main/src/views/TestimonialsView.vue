<script setup lang="ts">
import CreateRedirect from "@/forms/CreateRedirect.vue";
import CardElement from "@/components/CardElement.vue";
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";
import image from "@/assets/undraw_intense_feeling_ft-9-s.svg";
import { loadData } from "@novulink/helpers/dataLoader";

const { locale } = useI18n();

const testimonialData = ref<Awaited<ReturnType<typeof loadData>> | []>([]);

watch(
  locale,
  async (newLocale) => {
    testimonialData.value = await loadData("testimonials", newLocale);
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <section
    id="externalLinks"
    class="two-column-grid hero-section"
  >
    <hgroup>
      <h1>{{ $t("Customers love us") }}</h1>
      <p>
        {{
          $t(
            "We help people across industries solve a multitude of linking problems in the physical and digital world. Here's what they have to say."
          )
        }}
      </p>

      <label>{{ $t("Try for yourself") }}</label>
      <create-redirect
        :autofocus="false"
        :show-name-input="false"
        :inline="true"
        :show-label="false"
      />
    </hgroup>

    <img
      :src="image"
      alt="Link shortener"
    >
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
        v-for="testimonial in testimonialData"
        :key="(testimonial.id as number)"
      >
        <hgroup>
          <h3>{{ testimonial.name }}</h3>
          <p v-if="testimonial.subtitle">
            {{ testimonial.subtitle }}
          </p>
        </hgroup>
        <p>{{ testimonial.description }}</p>
      </li>
    </ul>
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
      <create-redirect :autofocus="false" />
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
