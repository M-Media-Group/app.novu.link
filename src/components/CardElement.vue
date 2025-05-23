<script setup lang="ts">
import type { PropType } from "vue";
import type { RouteLocationRaw } from "vue-router";
import BaseBadge from "./BaseBadge.vue";
import { Transition } from "vue";

defineProps({
  /** The title of the card */
  title: {
    type: String,
    required: false,
  },
  /** The subtitle of the card */
  subtitle: {
    type: String,
    required: false,
  },
  /** The images to display in the card */
  images: {
    // Images is an array of images, each image contains src and alt
    type: Array as PropType<{ src: string; alt: string }[]>,
    required: false,
  },
  /** Where the card should navigate to. If not set, the card is not clickable */
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    required: false,
  },
  /** The heading level to use, between 1 and 6. This has no effect if the title is not set or the header slot is used. */
  titleHeadingLevel: {
    type: Number,
    required: false,
    default: 3,
    validator: (value: number) => value >= 1 && value <= 6,
  },
  /** If the card should render as a skeleton loader */
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** An array of badges to display next to the title */
  badges: {
    type: Array as PropType<string[]>,
    required: false,
  },
});
</script>

<template>
  <!-- @todo the animation breaks with component, need to fix. It works when article is direct child or when <template> (from Vue) is used, but not with <component>, even with an :is to a Vue template -->
  <component
    v-if="!loading"
    :is="to ? 'router-link' : Transition"
    :to="to ? to : undefined"
  >
    <article v-bind="$attrs">
      <div class="images overflow-auto" v-if="images" tabindex="0">
        <img
          v-for="image in images"
          :src="image.src"
          :alt="image.alt"
          :key="image.alt"
          loading="lazy"
        />
      </div>

      <header v-if="title || subtitle || $slots.headerActions || $slots.header">
        <slot name="header">
          <hgroup>
            <component :is="`h${titleHeadingLevel}`" v-if="title"
              >{{ title }}
              <template v-if="badges && badges.length">
                <base-badge v-for="badge in badges" :key="badge">{{
                  badge
                }}</base-badge>
              </template>
            </component>
            <p v-if="subtitle">{{ subtitle }}</p>
          </hgroup>
          <div class="actions" v-if="$slots.headerActions">
            <!-- @slot This is the slot for the header actions - which is on the right side of the card in the header. -->
            <slot name="headerActions" />
          </div>
        </slot>
      </header>

      <slot />

      <footer v-if="$slots.footer">
        <slot name="footer" />
      </footer>
    </article>
  </component>
  <article v-else v-bind="$attrs">
    <div class="images" v-if="images?.length">
      <div class="gl-animate-skeleton-loader" style="height: 100%"></div>
    </div>
    <header v-if="title || subtitle || $slots.headerActions || $slots.header">
      <div style="width: 100%">
        <div
          class="gl-animate-skeleton-loader"
          v-if="title"
          style="height: 24px"
        ></div>
        <div
          class="gl-animate-skeleton-loader"
          v-if="subtitle"
          style="width: 40%"
        ></div>
      </div>
      <div
        class="gl-animate-skeleton-loader actions"
        v-if="$slots.headerActions"
        style="width: 10%; height: 27px"
      ></div>
    </header>
    <template v-if="$slots.default">
      <div class="gl-animate-skeleton-loader"></div>
      <div class="gl-animate-skeleton-loader" style="width: 95%"></div>
    </template>
    <footer v-if="$slots.footer">
      <div class="gl-animate-skeleton-loader" style="width: 10%"></div>
    </footer>
  </article>
</template>
