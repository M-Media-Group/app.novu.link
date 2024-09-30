<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import type { PropType } from "vue";
import type { Webhook } from "@/types/redirect";
import CreateWebhook from "@/forms/CreateWebhook.vue";

defineProps({
  redirectId: {
    type: String,
    required: true,
  },
  webhooks: {
    type: Array as PropType<Webhook[] | null>,
    required: false,
    default: () => [],
  },
  subscribed: {
    type: Boolean,
    required: false,
    default: false,
  },
  isLoading: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
<template>
  <template v-if="isLoading">
    <card-element :loading="isLoading">
      <hgroup>
        <h3></h3>
      </hgroup>
    </card-element>
  </template>
  <template v-else>
    <card-element
      :loading="isLoading"
      :title="$t('Your webhooks')"
      :subtitle="$t('Send data to your server when a QR code is scanned')"
      :badges="!subscribed ? [$t('Pro')] : []"
      v-if="webhooks && webhooks.length > 0"
    >
      <section
        v-for="webhook in webhooks"
        :key="webhook.id"
        aria-labelledby="webhook-{{ webhook.id }}"
        :class="{ disabled: !subscribed }"
      >
        <h4 id="webhook-{{ webhook.id }}">{{ webhook.url }}</h4>
        <details>
          <summary>{{ $t("View details") }}</summary>
          <div>
            <p>
              <strong>{{ $t("Secret") }}:</strong> {{ webhook.secret }}
            </p>
            <h4>{{ $t("Events") }}</h4>
            <ul>
              <li v-for="event in webhook.event_types" :key="event">
                {{ event }}
              </li>
            </ul>
          </div>
        </details>
      </section>
    </card-element>
  </template>

  <card-element
    :loading="isLoading"
    :title="$t('Webhooks')"
    :subtitle="$t('Send data to your server when a QR code is scanned')"
    :badges="!subscribed ? [$t('Pro')] : []"
  >
    <create-webhook :redirectId="redirectId" />
  </card-element>
</template>
