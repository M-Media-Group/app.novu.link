<script setup lang="ts">
import { type RouteRecordNormalized, useRouter } from "vue-router";

const router = useRouter();

const allRoutes = router.getRoutes();

const doesRouteIncludeGate = (route: RouteRecordNormalized, gate: string) =>
  (route.meta?.gates as string[])?.includes(gate);

const nonAuthedRoutes = allRoutes.filter(
  (route) => !doesRouteIncludeGate(route, "auth")
);
</script>
<template>
  <div>
    <h1>Sitemap</h1>
    <h2>Public</h2>
    <ul>
      <li v-for="route in nonAuthedRoutes" :key="route.path">
        <router-link :to="route.path">{{
          route.meta.title ?? route.name
        }}</router-link>
      </li>
    </ul>
  </div>
</template>
