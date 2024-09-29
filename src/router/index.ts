import { createRouter, createWebHistory } from "vue-router";
import $bus, { eventTypes } from "@/eventBus/events";
import authRoutes from "./authRoutes";

import { ref } from "vue";
import { updateOrCreateMetaTag } from "@m-media/vue3-meta-tags/src/metaTagger";

export const navIsLoading = ref(true);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      meta: {
        // Notice how we pass the translation key rather than the actual string. This is because Vue Router will cache our meta, so if we just passed the translated string it would not update on language change.
        title: "Home",
        scrollPosition: { top: 0, left: 0 },
        expandedFooter: true,
      },
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/pricing",
      name: "pricing",
      meta: {
        // Notice how we pass the translation key rather than the actual string. This is because Vue Router will cache our meta, so if we just passed the translated string it would not update on language change.
        title: "Pricing",
        scrollPosition: { top: 0, left: 0 },
        expandedFooter: true,
      },
      component: () => import("../views/PricingView.vue"),
    },
    {
      path: "/features",
      name: "features",
      meta: {
        // Notice how we pass the translation key rather than the actual string. This is because Vue Router will cache our meta, so if we just passed the translated string it would not update on language change.
        title: "Features",
        scrollPosition: { top: 0, left: 0 },
        expandedFooter: true,
      },
      component: () => import("../views/FeaturesView.vue"),
    },
    {
      path: "/testimonials",
      name: "testimonials",
      meta: {
        // Notice how we pass the translation key rather than the actual string. This is because Vue Router will cache our meta, so if we just passed the translated string it would not update on language change.
        title: "Testimonials",
        scrollPosition: { top: 0, left: 0 },
        expandedFooter: true,
      },
      component: () => import("../views/TestimonialsView.vue"),
    },
    {
      path: "/industries/restaurants",
      name: "industries/restaurants",
      meta: {
        // Notice how we pass the translation key rather than the actual string. This is because Vue Router will cache our meta, so if we just passed the translated string it would not update on language change.
        title: "Restaurants",
        scrollPosition: { top: 0, left: 0 },
        expandedFooter: true,
      },
      component: () => import("../views/RestaurantView.vue"),
    },
    {
      path: "/industries/real-estate",
      name: "industries/real-estate",
      meta: {
        // Notice how we pass the translation key rather than the actual string. This is because Vue Router will cache our meta, so if we just passed the translated string it would not update on language change.
        title: "Real Estate",
        scrollPosition: { top: 0, left: 0 },
        expandedFooter: true,
      },
      component: () => import("../views/RealEstateView.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/Auth/SettingsView.vue"),
      meta: {
        gates: ["auth"],
      },
    },
    {
      path: "/team/settings",
      name: "team/settings",
      component: () => import("../views/Auth/TeamSettingsView.vue"),
      meta: {
        gates: ["auth"],
      },
    },
    {
      path: "/teams/create",
      name: "teams/create",
      meta: {
        gates: ["auth", "confirmedEmailOrPhone"],
      },
      component: () => import("../views/CreateTeamView.vue"),
    },

    {
      path: "/add-payment-method",
      name: "add-payment-method",
      component: () => import("../views/AddPaymentMethodView.vue"),
      meta: {
        gates: ["auth"],
      },
    },
    {
      path: "/about",
      name: "about",
      meta: {
        gates: ["auth", "confirmedPassword"],
      },
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      meta: {
        gates: ["auth"],
      },
      component: () => import("../views/DashboardView.vue"),
    },
    {
      path: "/redirects",
      name: "redirects",
      meta: {
        gates: ["auth"],
      },
      component: () => import("../views/RedirectsView.vue"),
    },
    {
      path: "/redirects/create",
      name: "create-redirect",
      component: () => import("../views/CreateRedirectView.vue"),
    },
    {
      path: "/redirects/:redirectId",
      name: "redirect",
      component: () => import("../views/SingleRedirectView.vue"),
      // Pass the props to the component
      props: true,
      meta: {
        gates: ["auth"],
      },
    },
    {
      path: "/redirects/:redirectId/endpoints/add",
      name: "add-endpoint",
      component: () => import("../views/SimpleAddEndpointView.vue"),
      // Pass the props to the component
      props: true,
    },
    {
      path: "/analytics",
      name: "analytics",
      meta: {
        gates: ["auth", "confirmedEmailOrPhone"],
      },
      component: () => import("../views/AnalyticsView.vue"),
    },
    {
      path: "/429",
      name: "429",
      component: () => import("../views/429View.vue"),
    },
    {
      path: "/errors/link-disabled/payment-required",
      name: "link-disabled-payment-required",
      component: () => import("../views/DisabledRedirectView.vue"),
    },
    {
      path: "/errors/link-disabled/unsafe",
      name: "link-disabled-unsafe",
      component: () => import("../views/UnsafeRedirectView.vue"),
    },
    {
      path: "/warnings/link-nsfw",
      name: "nsfw-redirect",
      component: () => import("../views/NsfwRedirectView.vue"),
      // This path requires a redirectTo query parameter. If it is not present, redirect to the home page.
      beforeEnter(to: any, from: any, next: any) {
        if (to.query.redirectTo) {
          next();
        } else {
          next({ name: "home" });
        }
      },
    },
    {
      path: "/sitemap",
      name: "sitemap",
      component: () => import("../views/SitemapView.vue"),
    },
    // Add a catch-all 404 page
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/404View.vue"),
    },
  ].concat(authRoutes as any),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.meta.scrollPosition) {
      return to.meta.scrollPosition as any;
    } else {
      return { top: 72 };
    }
  },
});

router.afterEach((to, from, failure) => {
  navIsLoading.value = false;
  if (!failure) {
    $bus.$emit(eventTypes.viewed_page, {
      ...to,
      name: document.title,
    });

    updateOrCreateMetaTag(
      "canonical",
      // Current URL
      window.location.href,
      "link",
      "rel",
      "canonical",
      [{ name: "href", value: window.location.href }]
    );
  }
});

export default router;
