import type { Subscription } from "./Subscriptions";

type Shard = Pick<Subscription, "transport"> & {
    id: string;
    status: "enabled" | "webhook_callback_verification_pending" | "webhook_callback_verification_failed" | "notification_failures_exceeded" | "websocket_disconnected" | "websocket_failed_ping_pong" | "websocket_received_inbound_traffic" | "websocket_internal_error" | "websocket_network_timeout" | "websocket_network_error" | "websocket_failed_to_reconnect";
}

export interface ShardResponse {
    data: Shard[];
    pagination: {};
}

export interface ShardUpdateResponse {
    data: Shard[];
    errors: {
        id: string;
        message: string;
        code: string;
    }[]
}