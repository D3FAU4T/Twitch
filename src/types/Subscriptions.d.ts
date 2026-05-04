interface WebSocketTransport {
    method: "websocket";
    session_id: string;
}

interface WebhookTransport {
    method: "webhook";
    callback: string;
    secret: string;
}

interface ConduitTransport {
    method: "conduit";
    conduit_id: string;
}

interface BaseSubscription {
    transport: WebSocketTransport | WebhookTransport | ConduitTransport;
}

type ToBroadcaster = { to_broadcaster_user_id: string };
type Broadcaster   = { broadcaster_user_id: string };
type Moderator     = { moderator_user_id: string };
type Client        = { client_id: string };
type Reward        = { reward_id: string };
type User          = { user_id: string };

interface EventRegistry {
    "automod.message.hold": { version: "1" | "2"; condition: Broadcaster & Moderator };
    "automod.message.update": { version: "1" | "2"; condition: Broadcaster & Moderator };
    "automod.settings.update": { version: "1"; condition: Broadcaster & Moderator };
    "automod.terms.update": { version: "1"; condition: Broadcaster & Moderator };
    "channel.bits.use": { version: "1"; condition: Broadcaster };
    "channel.update": { version: "2"; condition: Broadcaster };
    "channel.follow": { version: "2"; condition: Broadcaster & Moderator };
    "channel.ad_break.begin": { version: "1"; condition: Broadcaster };
    "channel.chat.clear": { version: "1"; condition: Broadcaster & User };
    "channel.chat.clear_user_messages": { version: "1"; condition: Broadcaster & User };
    "channel.chat.message": { version: "1"; condition: Broadcaster & User };
    "channel.chat.message_delete": { version: "1"; condition: Broadcaster & User };
    "channel.chat.notification": { version: "1"; condition: Broadcaster & User };
    "channel.chat_settings.update": { version: "1"; condition: Broadcaster & User };
    "channel.chat.user_message_hold": { version: "1"; condition: Broadcaster & User };
    "channel.chat.user_message_update": { version: "1"; condition: Broadcaster & User };
    "channel.subscribe": { version: "1"; condition: Broadcaster };
    "channel.subscription.end": { version: "1"; condition: Broadcaster };
    "channel.subscription.gift": { version: "1"; condition: Broadcaster };
    "channel.subscription.message": { version: "1"; condition: Broadcaster };
    "channel.cheer": { version: "1"; condition: Broadcaster };
    "channel.raid": { version: "1"; condition: ToBroadcaster };
    "channel.ban": { version: "1"; condition: Broadcaster };
    "channel.unban": { version: "1"; condition: Broadcaster };
    "channel.unban_request.create": { version: "1"; condition: Broadcaster & Moderator };
    "channel.unban_request.resolve": { version: "1"; condition: Broadcaster & Moderator };
    "channel.moderate": { version: "1" | "2"; condition: Broadcaster & Moderator };
    "channel.moderator.add": { version: "1"; condition: Broadcaster };
    "channel.moderator.remove": { version: "1"; condition: Broadcaster };
    "channel.guest_star_session.begin": { version: "beta"; condition: Broadcaster & Moderator };
    "channel.guest_star_session.end": { version: "beta"; condition: Broadcaster & Moderator };
    "channel.guest_star_guest.update": { version: "beta"; condition: Broadcaster & Moderator };
    "channel.guest_star_settings.update": { version: "beta"; condition: Broadcaster & Moderator };
    "channel.channel_points_automatic_reward_redemption.add": { version: "1" | "2"; condition: Broadcaster };
    "channel.channel_points_custom_reward.add": { version: "1"; condition: Broadcaster };
    "channel.channel_points_custom_reward.update": { version: "1"; condition: Broadcaster & Reward };
    "channel.channel_points_custom_reward.remove": { version: "1"; condition: Broadcaster & Reward };
    "channel.channel_points_custom_reward_redemption.add": { version: "1"; condition: Broadcaster & Reward };
    "channel.channel_points_custom_reward_redemption.update": { version: "1"; condition: Broadcaster & Reward };
    "channel.custom_power_up_redemption.add": { version: "1"; condition: Broadcaster & Reward };
    "channel.poll.begin": { version: "1"; condition: Broadcaster };
    "channel.poll.progress": { version: "1"; condition: Broadcaster };
    "channel.poll.end": { version: "1"; condition: Broadcaster };
    "channel.prediction.begin": { version: "1"; condition: Broadcaster };
    "channel.prediction.progress": { version: "1"; condition: Broadcaster };
    "channel.prediction.lock": { version: "1"; condition: Broadcaster };
    "channel.prediction.end": { version: "1"; condition: Broadcaster };
    "channel.suspicious_user.update": { version: "1"; condition: Broadcaster & Moderator };
    "channel.suspicious_user.message": { version: "1"; condition: Broadcaster & Moderator };
    "channel.vip.add": { version: "1"; condition: Broadcaster };
    "channel.vip.remove": { version: "1"; condition: Broadcaster };
    "channel.warning.acknowledge": { version: "1"; condition: Broadcaster & Moderator };
    "channel.warning.send": { version: "1"; condition: Broadcaster & Moderator };
    "channel.hype_train.begin": { version: "2"; condition: Broadcaster };
    "channel.hype_train.progress": { version: "2"; condition: Broadcaster };
    "channel.hype_train.end": { version: "2"; condition: Broadcaster };
    "channel.charity_campaign.donate": { version: "1"; condition: Broadcaster };
    "channel.charity_campaign.start": { version: "1"; condition: Broadcaster };
    "channel.charity_campaign.progress": { version: "1"; condition: Broadcaster };
    "channel.charity_campaign.stop": { version: "1"; condition: Broadcaster };
    "channel.shared_chat.begin": { version: "1"; condition: Broadcaster };
    "channel.shared_chat.update": { version: "1"; condition: Broadcaster };
    "channel.shared_chat.end": { version: "1"; condition: Broadcaster };
    "channel.shield_mode.begin": { version: "1"; condition: Broadcaster & Moderator };
    "channel.shield_mode.end": { version: "1"; condition: Broadcaster & Moderator };
    "channel.shoutout.create": { version: "1"; condition: Broadcaster & Moderator };
    "channel.shoutout.receive": { version: "1"; condition: Broadcaster & Moderator };
    "conduit.shard.disabled": { version: "1"; condition: Client };
    "drop.entitlement.grant": { version: "1"; condition: { organization_id: string; category_id: string; campaign_id: string; } };
    "extension.bits_transaction.create": { version: "1"; condition: { extension_client_id: string; } };
    "channel.goal.begin": { version: "1"; condition: Broadcaster };
    "channel.goal.progress": { version: "1"; condition: Broadcaster };
    "channel.goal.end": { version: "1"; condition: Broadcaster };
    "stream.online": { version: "1"; condition: Broadcaster };
    "stream.offline": { version: "1"; condition: Broadcaster };
    "user.authorization.grant": { version: "1"; condition: Client };
    "user.authorization.revoke": { version: "1"; condition: Client };
    "user.update": { version: "1"; condition: User };
    "user.whisper.message": { version: "1"; condition: User };
}

type SubscriptionBuilder<T extends keyof EventRegistry> = BaseSubscription & {
    type: T;
    version: EventRegistry[T]["version"];
    condition: EventRegistry[T]["condition"];
}

export type Subscription = {
    [K in keyof EventRegistry]: SubscriptionBuilder<K>
}[keyof EventRegistry];