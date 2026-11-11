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

type V1<C> = { version: "1"; condition: C };
type V2<C> = { version: "2"; condition: C };
type Beta<C> = { version: "beta"; condition: C };
type V1Broadcaster = V1<Broadcaster>;
type V1BroadcasterMod = V1<Broadcaster & Moderator>;
type V1BroadcasterUser = V1<Broadcaster & User>;
type V1BroadcasterReward = V1<Broadcaster & Reward>;

interface EventRegistry {
    "automod.message.hold": { version: "1" | "2"; condition: Broadcaster & Moderator };
    "automod.message.update": { version: "1" | "2"; condition: Broadcaster & Moderator };
    "automod.settings.update": V1BroadcasterMod;
    "automod.terms.update": V1BroadcasterMod;
    "channel.bits.use": V1Broadcaster;
    "channel.update": V2<Broadcaster>;
    "channel.follow": V2<Broadcaster & Moderator>;
    "channel.ad_break.begin": V1Broadcaster;
    "channel.chat.clear": V1BroadcasterUser;
    "channel.chat.clear_user_messages": V1BroadcasterUser;
    "channel.chat.message": V1BroadcasterUser;
    "channel.chat.message_delete": V1BroadcasterUser;
    "channel.chat.notification": V1BroadcasterUser;
    "channel.chat_settings.update": V1BroadcasterUser;
    "channel.chat.user_message_hold": V1BroadcasterUser;
    "channel.chat.user_message_update": V1BroadcasterUser;
    "channel.subscribe": V1Broadcaster;
    "channel.subscription.end": V1Broadcaster;
    "channel.subscription.gift": V1Broadcaster;
    "channel.subscription.message": V1Broadcaster;
    "channel.cheer": V1Broadcaster;
    "channel.raid": V1<ToBroadcaster>;
    "channel.ban": V1Broadcaster;
    "channel.unban": V1Broadcaster;
    "channel.unban_request.create": V1BroadcasterMod;
    "channel.unban_request.resolve": V1BroadcasterMod;
    "channel.moderate": { version: "1" | "2"; condition: Broadcaster & Moderator };
    "channel.moderator.add": V1Broadcaster;
    "channel.moderator.remove": V1Broadcaster;
    "channel.guest_star_session.begin": Beta<Broadcaster & Moderator>;
    "channel.guest_star_session.end": Beta<Broadcaster & Moderator>;
    "channel.guest_star_guest.update": Beta<Broadcaster & Moderator>;
    "channel.guest_star_settings.update": Beta<Broadcaster & Moderator>;
    "channel.channel_points_automatic_reward_redemption.add": { version: "1" | "2"; condition: Broadcaster };
    "channel.channel_points_custom_reward.add": V1Broadcaster;
    "channel.channel_points_custom_reward.update": V1BroadcasterReward;
    "channel.channel_points_custom_reward.remove": V1BroadcasterReward;
    "channel.channel_points_custom_reward_redemption.add": V1BroadcasterReward;
    "channel.channel_points_custom_reward_redemption.update": V1BroadcasterReward;
    "channel.custom_power_up_redemption.add": V1BroadcasterReward;
    "channel.poll.begin": V1Broadcaster;
    "channel.poll.progress": V1Broadcaster;
    "channel.poll.end": V1Broadcaster;
    "channel.prediction.begin": V1Broadcaster;
    "channel.prediction.progress": V1Broadcaster;
    "channel.prediction.lock": V1Broadcaster;
    "channel.prediction.end": V1Broadcaster;
    "channel.suspicious_user.update": V1BroadcasterMod;
    "channel.suspicious_user.message": V1BroadcasterMod;
    "channel.vip.add": V1Broadcaster;
    "channel.vip.remove": V1Broadcaster;
    "channel.warning.acknowledge": V1BroadcasterMod;
    "channel.warning.send": V1BroadcasterMod;
    "channel.hype_train.begin": V2<Broadcaster>;
    "channel.hype_train.progress": V2<Broadcaster>;
    "channel.hype_train.end": V2<Broadcaster>;
    "channel.charity_campaign.donate": V1Broadcaster;
    "channel.charity_campaign.start": V1Broadcaster;
    "channel.charity_campaign.progress": V1Broadcaster;
    "channel.charity_campaign.stop": V1Broadcaster;
    "channel.shared_chat.begin": V1Broadcaster;
    "channel.shared_chat.update": V1Broadcaster;
    "channel.shared_chat.end": V1Broadcaster;
    "channel.shield_mode.begin": V1BroadcasterMod;
    "channel.shield_mode.end": V1BroadcasterMod;
    "channel.shoutout.create": V1BroadcasterMod;
    "channel.shoutout.receive": V1BroadcasterMod;
    "conduit.shard.disabled": V1<Client>;
    "drop.entitlement.grant": V1<{ organization_id: string; category_id: string; campaign_id: string }>;
    "extension.bits_transaction.create": V1<{ extension_client_id: string }>;
    "channel.goal.begin": V1Broadcaster;
    "channel.goal.progress": V1Broadcaster;
    "channel.goal.end": V1Broadcaster;
    "stream.online": V1Broadcaster;
    "stream.offline": V1Broadcaster;
    "user.authorization.grant": V1<Client>;
    "user.authorization.revoke": V1<Client>;
    "user.update": V1<User>;
    "user.whisper.message": V1<User>;
}

type SubscriptionBuilder<T extends keyof EventRegistry> = BaseSubscription & {
    type: T;
    version: EventRegistry[T]["version"];
    condition: EventRegistry[T]["condition"];
};

export type Subscription = {
    [K in keyof EventRegistry]: SubscriptionBuilder<K>;
}[keyof EventRegistry];
