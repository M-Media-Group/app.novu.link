import type { UnifiedError } from "./apiServiceErrorHandler.js";
import type { HttpClient } from "./clients/genericHttpClient.js";
import { EventBus } from "type-safe-event-bus";

let baseUrl: string | null = null;

let internalClient: HttpClient | null = null;

let $bus: EventBus | null = null;

declare module "type-safe-event-bus" {
    export interface EventTypesPayloads {
        enabled_analytics: undefined;
        disabled_analytics: undefined;
        went_offline: undefined;
        came_online: undefined;
        logged_in: undefined;
        logged_out: undefined;
        sent_reset_password_email: undefined;
        reset_password: undefined;
        confirmed_password: undefined;
        updated_user: undefined;
        registered: undefined;
        created_personal_access_token: undefined;
        deleted_personal_access_token: undefined;
        added_payment_method: undefined;

        created_team: undefined;
        changed_team: number;
        updated_team: number;
        set_active_team: undefined;
        confirmed_willingness_to_start_subscription: undefined;
        started_subscription: undefined;
        unsubscribed: undefined;
        created_redirect: undefined;
        created_endpoint: undefined;
        deleted_endpoint: number;
        updated_redirect: string;
        updated_endpoint: number;
        created_alert: undefined;
        deleted_redirect: string;
        sent_otp: undefined;
        confirmed_otp: undefined;
        created_qr_design: undefined;
        updated_qr_design: undefined;
        deleted_qr_design: undefined;
        created_webhook: undefined;
        updated_webhook: undefined;
        deleted_webhook: undefined;
        updated_alert: undefined;
        deleted_alert: undefined;
        created_analytics_integration: undefined;
        updated_analytics_integration: undefined;
        deleted_analytics_integration: undefined;
        created_product_order: undefined;
        http_error: Partial<UnifiedError>;
    }
}

export function configureApiClient(client: HttpClient, baseURL: string, eventBus?: EventBus) {
    internalClient = client;
    baseUrl = baseURL;
    $bus = eventBus || null;
}

export function getApiClient(): HttpClient {
    if (!internalClient) {
        throw new Error("API client not configured. Call configureApiClient() first.");
    }
    return internalClient;
}

export function getBaseUrl(): string {
    if (!baseUrl) {
        throw new Error("Base URL not configured. Call configureApiClient() first.");
    }
    return baseUrl;
}

export function getEventBus(): EventBus | null {
    if (!$bus) {
        console.error("Event bus not configured. Call configureApiClient() first.");
        return null;
    }
    return $bus;
}

export default $bus;