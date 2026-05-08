import type { Subscription } from "./Subscriptions";

type SubscriptionType = Subscription["type"];

interface ChannelChatMessageBadge {
    set_id: string;
    id: string;
    info: string;
}

interface ChannelChatMessageCheermote {
    prefix: string;
    bits: number;
    tier: number;
}

interface ChannelChatMessageEmote {
    id: string;
    emote_set_id: string;
    owner_id?: string;
    format?: string[];
}

interface ChannelChatMessageMention {
    user_id: string;
    user_login: string;
    user_name: string;
}

interface ChannelChatMessageFragment {
    type: "text" | "cheermote" | "emote" | "mention";
    text: string;
    cheermote: ChannelChatMessageCheermote | null;
    emote: ChannelChatMessageEmote | null;
    mention: ChannelChatMessageMention | null;
}

interface ChannelChatMessageBody {
    text: string;
    fragments: ChannelChatMessageFragment[];
}

interface ChannelChatMessageReply {
    parent_message_id: string;
    parent_message_body: string;
    parent_user_id: string;
    parent_user_login: string;
    parent_user_name: string;
    thread_message_id: string;
    thread_user_id: string;
    thread_user_login: string;
    thread_user_name: string;
}

interface ChannelChatMessageEvent {
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    source_broadcaster_user_id: string | null;
    source_broadcaster_user_login: string | null;
    source_broadcaster_user_name: string | null;
    chatter_user_id: string;
    chatter_user_login: string;
    chatter_user_name: string;
    message_id: string;
    source_message_id: string | null;
    is_source_only: boolean | null;
    message: ChannelChatMessageBody;
    color: string | null;
    badges: ChannelChatMessageBadge[];
    source_badges: ChannelChatMessageBadge[] | null;
    message_type: string;
    cheer: {
        bits: number;
    } | null;
    reply: ChannelChatMessageReply | null;
    channel_points_custom_reward_id: string | null;
    channel_points_animation_id: string | null;
}

interface ChannelFollowEvent {
    user_id: string;
    user_login: string;
    user_name: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    followed_at: string;
}

interface EventSubEventMap {
    "channel.chat.message": ChannelChatMessageEvent;
    "channel.follow": ChannelFollowEvent;
}

type EventSubEvent<T extends SubscriptionType> = T extends keyof EventSubEventMap
    ? EventSubEventMap[T]
    : unknown;

export interface EventSubMessage<T extends SubscriptionType = SubscriptionType> {
    metadata: {
        message_id: string;
        message_type: 'session_welcome' | 'session_keepalive' | 'notification' | 'session_reconnect' | 'revocation';
        message_timestamp: string;
        subscription_type?: T;
        subscription_version?: string;
    };
    payload: {
        session?: {
            id: string;
            status: string;
            connected_at: string;
            keepalive_timeout_seconds: number;
            reconnect_url?: string;
        };
        subscription?: EventSubSubscription<T>;
        event?: EventSubEvent<T>;
    };
}

export type EventSubSubscription<T extends SubscriptionType = SubscriptionType> = Extract<Subscription, { type: T }> & {
    id: string;
    status: string;
    created_at: string;
    cost?: number;
};

export interface EventSubSubscriptionResponse {
    data: EventSubSubscription[];
    total: number;
    total_cost: number;
    max_total_cost: number;
}

export interface EventSubNotification<T extends SubscriptionType = SubscriptionType> {
    subscription: EventSubSubscription<T>;
    event: EventSubEvent<T>;
    metadata: EventSubMessage<T>["metadata"];
}