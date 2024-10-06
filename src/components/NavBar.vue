<script setup lang="ts">
import { useTeamStore } from "@/stores/team";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";

const user = useUserStore();
const team = useTeamStore();

const detailsElement = ref();
const teamDetailsElement = ref();

const isOpen = ref(false);

const appName = import.meta.env.VITE_APP_NAME;

const blur = () => {
  isOpen.value = false;
  detailsElement.value?.removeAttribute("open");
  teamDetailsElement.value?.removeAttribute("open");
};
</script>
<template>
  <nav v-show="!isOpen" aria-label="Primary">
    <ul>
      <li>
        <router-link
          :to="user?.isAuthenticated ? '/dashboard' : '/'"
          aria-roledescription="logo"
          aria-label="Click the logo to go home"
          ><strong>{{ appName }}</strong></router-link
        >
      </li>
    </ul>
    <ul>
      <li>
        <base-button @click="blur()" to="/redirects/create">
          {{ $t("New magic link") }}
        </base-button>
      </li>
      <li v-if="!user?.isAuthenticated">
        <router-link to="/login">{{ $t("Login") }}</router-link>
      </li>
      <li>
        <base-button
          class="outline"
          @click="isOpen = !isOpen"
          aria-label="Open the menu"
        >
          <span aria-hidden="true">☰</span>
        </base-button>
      </li>
    </ul>
  </nav>
  <aside v-show="isOpen" class="container">
    <nav aria-label="Aside">
      <ul>
        <template v-if="user?.isAuthenticated">
          <!-- The users team settings -->
          <li :aria-busy="user.isLoading">
            <details
              ref="teamDetailsElement"
              v-show="!user.isLoading"
              class="dropdown"
            >
              <summary :aria-busy="user.isLoading">
                {{ team.activeTeam?.name ?? $t("Your Team") }}
              </summary>
              <ul @click="blur()">
                <li>
                  <router-link to="/team/settings">{{
                    $t("Team Settings")
                  }}</router-link>
                </li>
                <li>
                  <router-link to="/teams/create">{{
                    $t("Create New Team")
                  }}</router-link>
                </li>
                <!-- Divider -->
                <li>
                  <hr />
                </li>
                <!-- Switch teams section -->

                <li v-for="singleTeam in team.teams" :key="singleTeam.id">
                  <a href="#" @click.prevent="team.switchTeam(singleTeam.id)"
                    >{{ singleTeam.name ?? $t("Your Team") }}
                    {{
                      singleTeam.id === team.activeTeam?.id ? " (Active)" : ""
                    }}
                  </a>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <router-link to="/dashboard" @click="blur()">{{
              $t("Dashboard")
            }}</router-link>
          </li>
          <li>
            <router-link to="/redirects" @click="blur()">{{
              $t("Magic links")
            }}</router-link>
          </li>
          <li>
            <router-link to="/analytics" @click="blur()">{{
              $t("Analytics")
            }}</router-link>
          </li>

          <li>
            <router-link to="/products" @click="blur()">{{
              $t("Shop QR Products")
            }}</router-link>
          </li>

          <li :aria-busy="user.isLoading">
            <details
              ref="detailsElement"
              v-show="!user.isLoading"
              class="dropdown"
            >
              <summary :aria-busy="user.isLoading">
                {{ user.user?.name ?? $t("My Account") }}
              </summary>
              <ul @click="blur()">
                <li>
                  <router-link to="/settings">{{ $t("Settings") }}</router-link>
                </li>
                <li>
                  <router-link to="/logout">{{ $t("Logout") }}</router-link>
                </li>
              </ul>
            </details>
          </li>
        </template>
        <template v-else>
          <li>
            <router-link to="/" @click="blur()">{{ $t("Home") }}</router-link>
          </li>
          <li>
            <router-link to="/features" @click="blur()">{{
              $t("Features")
            }}</router-link>
          </li>
          <li>
            <router-link to="/pricing" @click="blur()">{{
              $t("Pricing")
            }}</router-link>
          </li>
          <li>
            <router-link to="/products" @click="blur()">{{
              $t("Shop QR Products")
            }}</router-link>
          </li>
          <li>
            <router-link to="/login" @click="blur()">{{
              $t("Login")
            }}</router-link>
          </li>
          <li>
            <router-link to="/sign-up" @click="blur()">{{
              $t("Sign up")
            }}</router-link>
          </li>
        </template>
        <li>
          <base-button @click="blur()" to="/redirects/create">
            {{ $t("New magic link") }}
          </base-button>
        </li>
      </ul>
    </nav>
    <base-button
      @click="isOpen = !isOpen"
      aria-label="Close the menu"
      class="outline close"
    >
      <span aria-hidden="true">✖</span>
    </base-button>
  </aside>
</template>

<style scoped>
aside {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--pico-background-color);
  z-index: 100;

  > nav > ul {
    display: flex;
    flex-direction: column;

    margin-top: 4rem;

    > li {
      width: 100%;

      &:has(details) {
        padding: 0;
      }

      > details,
      > button,
      [role="button"] {
        width: 100%;
        margin: 0;
        > summary {
          margin-bottom: 0;
          background: transparent;
          border: none;
        }
      }
    }

    summary {
      margin-bottom: 0.5rem;
    }
  }
}

.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.dropdown summary {
  margin-bottom: 0;
}
</style>
