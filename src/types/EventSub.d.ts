import type { Subscription } from "./Subscriptions";

type SubscriptionType = Subscription["type"];

export interface BroadcasterUser {
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
}

export interface BaseUser {
    user_id: string;
    user_login: string;
    user_name: string;
}

export interface ModeratorUser {
    moderator_user_id: string;
    moderator_user_login: string;
    moderator_user_name: string;
}

export interface ChatterUser {
    chatter_user_id: string;
    chatter_user_login: string;
    chatter_user_name: string;
}

export interface TargetUser {
    target_user_id: string;
    target_user_login: string;
    target_user_name: string;
}

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

interface ChannelChatMessageMention extends BaseUser {}

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

export interface ChannelChatMessageEvent extends BroadcasterUser, ChatterUser {
    source_broadcaster_user_id: string | null;
    source_broadcaster_user_login: string | null;
    source_broadcaster_user_name: string | null;
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

export interface ChannelFollowEvent extends BaseUser, BroadcasterUser {
    followed_at: string;
}

export interface ChannelPointsCustomRewardRedemptionBase extends BroadcasterUser, BaseUser {
    id: string;
    user_input: string;
    reward: {
        id: string;
        title: string;
        cost: number;
        prompt: string;
    };
    redeemed_at: string;
}

export interface StreamOnlineEvent extends BroadcasterUser {
    id: string;
    type: "live" | "rerun";
    started_at: string;
}

export interface StreamOfflineEvent extends BroadcasterUser {}

export interface ShoutoutReceiveEvent extends BroadcasterUser {
    from_broadcaster_user_id: string;
    from_broadcaster_user_name: string;
    from_broadcaster_user_login: string;
    viewer_count: number;
    started_at: string;
}

export interface ShoutoutCreateEvent extends BroadcasterUser, ModeratorUser {
    to_broadcaster_user_id: string;
    to_broadcaster_user_name: string;
    to_broadcaster_user_login: string;
    started_at: string;
    viewer_count: number;
    cooldown_ends_at: string;
    target_cooldown_ends_at: string;
}

export interface AutomodMessageHoldEvent extends BroadcasterUser, BaseUser {
    message_id: string;
    message: ChannelChatMessageBody;
    held_at: string;
    reason?: "automod" | "blocked_term";
    automod?: {
        category: string;
        level: number;
        boundaries: { start_pos: number; end_pos: number }[];
    };
    blocked_term?: {
        terms: { term_id: string; boundary: { start_pos: number; end_pos: number } }[];
    };
}

export interface AutomodMessageUpdateEvent extends BroadcasterUser, ModeratorUser, BaseUser {
    message_id: string;
    message: ChannelChatMessageBody;
    status: "approved" | "denied" | "expired";
    held_at: string;
}

export interface AutomodSettingsUpdateEvent extends BroadcasterUser, ModeratorUser {
    overall_level: number | null;
    disability: number;
    aggression: number;
    sexuality_sex_or_gender: number;
    misogyny: number;
    bullying: number;
    swearing: number;
    race_ethnicity_or_religion: number;
    sex_based_terms: number;
}

export interface AutomodTermsUpdateEvent extends BroadcasterUser, ModeratorUser {
    action: "add_permitted" | "remove_permitted" | "add_blocked" | "remove_blocked";
    list: "permitted" | "blocked";
    terms: string[];
    from_automod: boolean;
}

export interface ChannelBitsUseEvent extends BroadcasterUser, BaseUser {
    bits: number;
    type: "cheer" | "power_up";
    power_up?: {
        type: string;
        emote?: ChannelChatMessageEmote;
        message_id?: string;
    };
}

export interface ChannelUpdateEvent extends BroadcasterUser {
    title: string;
    language: string;
    category_id: string;
    category_name: string;
    content_classification_labels: string[];
}

export interface ChannelAdBreakBeginEvent extends BroadcasterUser {
    duration_seconds: number;
    started_at: string;
    is_automatic: boolean;
    requester_user_id: string;
    requester_user_login: string;
    requester_user_name: string;
}

export interface ChannelChatClearEvent extends BroadcasterUser {}

export interface ChannelChatClearUserMessagesEvent extends BroadcasterUser, TargetUser {}

export interface ChannelChatMessageDeleteEvent extends BroadcasterUser, TargetUser {
    message_id: string;
}

export interface ChannelChatNotificationEvent extends BroadcasterUser, ChatterUser {
    chatter_is_anonymous: boolean;
    color: string;
    badges: ChannelChatMessageBadge[];
    system_message: string;
    message_id: string;
    message: ChannelChatMessageBody;
    notice_type:
        | "sub"
        | "resub"
        | "sub_gift"
        | "community_sub_gift"
        | "gift_paid_upgrade"
        | "prime_paid_upgrade"
        | "raid"
        | "unraid"
        | "pay_it_forward"
        | "announcement"
        | "bits_badge_tier"
        | "charity_donation"
        | "shared_chat_sub"
        | "shared_chat_resub"
        | "shared_chat_sub_gift"
        | "shared_chat_community_sub_gift";
    sub?: {
        sub_tier: "1000" | "2000" | "3000" | "Prime";
        is_prime: boolean;
        duration_months: number;
    };
    resub?: {
        sub_tier: "1000" | "2000" | "3000" | "Prime";
        is_prime: boolean;
        duration_months: number;
        streak_months: number | null;
        cumulative_months: number;
        giver_user_id: string | null;
        giver_user_name: string | null;
        giver_user_login: string | null;
    };
    sub_gift?: {
        duration_months: number;
        cumulative_total: number | null;
        recipient_user_id: string;
        recipient_user_name: string;
        recipient_user_login: string;
        sub_tier: "1000" | "2000" | "3000";
        community_gift_id: string | null;
    };
    community_sub_gift?: {
        id: string;
        total: number;
        sub_tier: "1000" | "2000" | "3000";
        cumulative_total: number | null;
    };
    announcement?: {
        color: "PRIMARY" | "BLUE" | "GREEN" | "ORANGE" | "PURPLE";
    };
    raid?: BaseUser & {
        viewer_count: number;
        profile_image_url: string;
    };
    charity_donation?: {
        charity_name: string;
        amount: ChannelCharityCampaignAmount;
    };
}

export interface ChannelChatSettingsUpdateEvent extends BroadcasterUser {
    emote_mode: boolean;
    follower_mode: boolean;
    follower_mode_duration_minutes: number | null;
    slow_mode: boolean;
    slow_mode_wait_time_seconds: number | null;
    subscriber_mode: boolean;
    unique_chat_mode: boolean;
}

export interface ChannelChatUserMessageHoldEvent extends BroadcasterUser, BaseUser {
    message_id: string;
    message: ChannelChatMessageBody;
}

export interface ChannelChatUserMessageUpdateEvent extends ChannelChatUserMessageHoldEvent {
    status: "approved" | "denied" | "invalid";
}

export interface ChannelSubscribeEvent extends BaseUser, BroadcasterUser {
    tier: "1000" | "2000" | "3000";
    is_gift: boolean;
}

export interface ChannelSubscriptionEndEvent extends ChannelSubscribeEvent {}

export interface ChannelSubscriptionGiftEvent extends BroadcasterUser {
    user_id: string | null;
    user_login: string | null;
    user_name: string | null;
    total: number;
    tier: "1000" | "2000" | "3000";
    cumulative_total: number | null;
    is_anonymous: boolean;
}

export interface ChannelSubscriptionMessageEvent extends BaseUser, BroadcasterUser {
    tier: "1000" | "2000" | "3000";
    message: ChannelChatMessageBody;
    cumulative_months: number;
    streak_months: number | null;
    duration_months: number;
}

export interface ChannelCheerEvent extends BroadcasterUser {
    is_anonymous: boolean;
    user_id: string | null;
    user_login: string | null;
    user_name: string | null;
    message: string;
    bits: number;
}

export interface ChannelRaidEvent {
    from_broadcaster_user_id: string;
    from_broadcaster_user_login: string;
    from_broadcaster_user_name: string;
    to_broadcaster_user_id: string;
    to_broadcaster_user_login: string;
    to_broadcaster_user_name: string;
    viewers: number;
}

export interface ChannelBanEvent extends BaseUser, BroadcasterUser, ModeratorUser {
    reason: string | null;
    banned_at: string;
    ends_at: string | null;
    is_permanent: boolean;
}

export interface ChannelUnbanEvent extends BaseUser, BroadcasterUser, ModeratorUser {}

export interface ChannelUnbanRequestCreateEvent extends BroadcasterUser, BaseUser {
    id: string;
    text: string;
    created_at: string;
}

export interface ChannelUnbanRequestResolveEvent extends BroadcasterUser, ModeratorUser, BaseUser {
    id: string;
    resolution_text: string;
    status: "approved" | "denied";
}

export interface ChannelModerateEvent extends BroadcasterUser, ModeratorUser {
    action: string;
    followers?: { follow_duration_minutes: number };
    slow?: { wait_time_seconds: number };
    vip?: BaseUser;
    unvip?: BaseUser;
    mod?: BaseUser;
    unmod?: BaseUser;
    ban?: BaseUser & { reason: string | null };
    unban?: BaseUser;
    timeout?: BaseUser & { reason: string | null; expires_at: string };
    untimeout?: BaseUser;
    clear?: Record<string, never>;
    delete?: BaseUser & { message_id: string; message_body: string };
}

export interface ChannelModeratorAddEvent extends BroadcasterUser, BaseUser {}

export interface ChannelModeratorRemoveEvent extends ChannelModeratorAddEvent {}

export interface ChannelGuestStarSessionBeginEvent extends BroadcasterUser, ModeratorUser {
    session_id: string;
    started_at: string;
}

export interface ChannelGuestStarSessionEndEvent extends ChannelGuestStarSessionBeginEvent {
    ended_at: string;
}

export interface ChannelGuestStarGuestUpdateEvent extends BroadcasterUser, ModeratorUser {
    session_id: string;
    guest_user_id: string;
    guest_user_login: string;
    guest_user_name: string;
    slot_id: string;
    state: "ready" | "invited" | "accepted" | "queued" | "live" | "backstage" | "removed";
}

export interface ChannelGuestStarSettingsUpdateEvent extends BroadcasterUser, ModeratorUser {
    is_moderator_send_live_enabled: boolean;
    slot_count: number;
    is_browser_source_audio_enabled: boolean;
    group_layout: "tiled" | "screenshare" | "spotlight";
}

export interface ChannelPointsAutomaticRewardRedemptionAddEvent extends BroadcasterUser, BaseUser {
    id: string;
    reward: {
        type: "single_message_bypass_sub_mode" | "send_highlighted_message" | "random_sub_emote_unlock" | "chosen_sub_emote_unlock" | "chosen_modified_sub_emote_unlock" | "message_effect";
        cost: number;
        unlocked_emote?: ChannelChatMessageEmote;
    };
    message: ChannelChatMessageBody;
    user_input?: string;
    redeemed_at: string;
}

export interface ChannelPointsCustomRewardEvent extends BroadcasterUser {
    id: string;
    is_enabled: boolean;
    cost: number;
    title: string;
    prompt: string;
    is_user_input_required: boolean;
    max_per_stream_setting: { is_enabled: boolean; max_per_stream: number };
    max_per_user_per_stream_setting: { is_enabled: boolean; max_per_user_per_stream: number };
    global_cooldown_setting: { is_enabled: boolean; global_cooldown_seconds: number };
    is_paused: boolean;
    is_in_stock: boolean;
    default_image: { url_1x: string; url_2x: string; url_4x: string };
    image: { url_1x: string; url_2x: string; url_4x: string } | null;
    should_redemptions_skip_request_queue: boolean;
    redemptions_redeemed_current_stream: number | null;
    cooldown_expires_at: string | null;
}

export interface ChannelCustomPowerUpRedemptionAddEvent extends BroadcasterUser, BaseUser {
    id: string;
    power_up_reward_id: string;
    power_up_id: string;
    cost: number;
    redeemed_at: string;
}

export interface ChannelPollChoice {
    id: string;
    title: string;
    bits_votes: number;
    channel_points_votes: number;
    votes: number;
}

export interface ChannelPollBeginEvent extends BroadcasterUser {
    id: string;
    title: string;
    choices: ChannelPollChoice[];
    bits_voting: { is_enabled: boolean; amount_per_vote: number };
    channel_points_voting: { is_enabled: boolean; amount_per_vote: number };
    started_at: string;
    ends_at: string;
}

export interface ChannelPollEndEvent extends ChannelPollBeginEvent {
    status: "completed" | "archived" | "terminated";
}

export interface ChannelPredictionOutcome {
    id: string;
    title: string;
    color: string;
    users: number;
    channel_points: number;
    top_predictors: (BaseUser & {
        channel_points_won: number | null;
        channel_points_used: number;
    })[];
}

export interface ChannelPredictionBeginEvent extends BroadcasterUser {
    id: string;
    title: string;
    outcomes: ChannelPredictionOutcome[];
    started_at: string;
    locks_at: string;
}

export interface ChannelPredictionLockEvent extends ChannelPredictionBeginEvent {
    locked_at: string;
}

export interface ChannelPredictionEndEvent extends ChannelPredictionBeginEvent {
    winning_outcome_id: string | null;
    status: "resolved" | "canceled";
    ended_at: string;
}

export interface ChannelSuspiciousUserUpdateEvent extends BroadcasterUser, ModeratorUser, BaseUser {
    low_trust_status: "none" | "active_monitoring" | "restricted";
}

export interface ChannelSuspiciousUserMessageEvent extends BroadcasterUser, BaseUser {
    low_trust_status: "none" | "active_monitoring" | "restricted";
    shared_ban_channel_ids: string[];
    types: ("manual" | "ban_evader_detector" | "shared_channel_ban")[];
    ban_evasion_evaluation: string;
    message: {
        message_id: string;
        text: string;
        fragments: ChannelChatMessageFragment[];
    };
}

export interface ChannelVipAddEvent extends BaseUser, BroadcasterUser {}

export interface ChannelVipRemoveEvent extends ChannelVipAddEvent {}

export interface ChannelWarningAcknowledgeEvent extends BroadcasterUser, BaseUser {}

export interface ChannelWarningSendEvent extends BroadcasterUser, ModeratorUser, BaseUser {
    reason: string | null;
    chat_rules_cited: string[] | null;
}

export interface ChannelHypeTrainContribution extends BaseUser {
    total: number;
    type: "bits" | "subscription" | "other";
}

export interface ChannelHypeTrainBeginEvent extends BroadcasterUser {
    id: string;
    total: number;
    progress: number;
    goal: number;
    top_contributions: ChannelHypeTrainContribution[];
    last_contribution: ChannelHypeTrainContribution;
    level: number;
    started_at: string;
    expires_at: string;
}

export interface ChannelHypeTrainEndEvent extends Omit<ChannelHypeTrainBeginEvent, "progress" | "goal" | "last_contribution" | "expires_at"> {
    ended_at: string;
    cooldown_ends_at: string;
}

export interface ChannelCharityCampaignAmount {
    value: number;
    decimal_places: number;
    currency: string;
}

export interface ChannelCharityCampaignStartEvent extends BroadcasterUser {
    id: string;
    charity_name: string;
    charity_description: string;
    charity_logo: string;
    charity_website: string;
    current_amount: ChannelCharityCampaignAmount;
    target_amount: ChannelCharityCampaignAmount | null;
}

export interface ChannelCharityCampaignDonateEvent extends BroadcasterUser, BaseUser, Omit<ChannelCharityCampaignStartEvent, "current_amount" | "target_amount"> {
    campaign_id: string;
    amount: ChannelCharityCampaignAmount;
}

export interface ChannelCharityCampaignStopEvent extends ChannelCharityCampaignStartEvent {
    stopped_at: string;
}

export interface ChannelSharedChatParticipant extends BroadcasterUser {}

export interface ChannelSharedChatBeginEvent extends BroadcasterUser {
    session_id: string;
    host_broadcaster_user_id: string;
    host_broadcaster_user_login: string;
    host_broadcaster_user_name: string;
    participants: ChannelSharedChatParticipant[];
}

export interface ChannelSharedChatEndEvent extends Omit<ChannelSharedChatBeginEvent, "participants"> {}

export interface ChannelShieldModeBeginEvent extends BroadcasterUser, ModeratorUser {
    started_at: string;
}

export interface ChannelShieldModeEndEvent extends BroadcasterUser, ModeratorUser {
    ended_at: string;
}

export interface ConduitShardDisabledEvent {
    conduit_id: string;
    shard_id: string;
}

export interface DropEntitlementGrantEvent {
    id: string;
    data: (BaseUser & {
        organization_id: string;
        category_id: string;
        category_name: string;
        campaign_id: string;
        entitlement_id: string;
        benefit_id: string;
        created_at: string;
    })[];
}

export interface ExtensionBitsTransactionCreateEvent extends BroadcasterUser, BaseUser {
    id: string;
    extension_client_id: string;
    product: {
        name: string;
        sku: string;
        bits: number;
        in_development: boolean;
    };
}

export interface ChannelGoalBeginEvent extends BroadcasterUser {
    id: string;
    type: "follow" | "subscription" | "subscription_count" | "new_subscription" | "new_subscription_count";
    description: string;
    current_amount: number;
    target_amount: number;
    started_at: string;
}

export interface ChannelGoalEndEvent extends ChannelGoalBeginEvent {
    ended_at: string;
}

export interface UserAuthorizationGrantEvent extends BaseUser {
    client_id: string;
}

export interface UserAuthorizationRevokeEvent extends Omit<UserAuthorizationGrantEvent, "user_login" | "user_name"> {
    user_login: string | null;
    user_name: string | null;
}

export interface UserUpdateEvent extends BaseUser {
    email?: string;
    email_verified?: boolean;
    description: string;
}

export interface UserWhisperMessageEvent {
    from_user_id: string;
    from_user_login: string;
    from_user_name: string;
    to_user_id: string;
    to_user_login: string;
    to_user_name: string;
    whisper_id: string;
    whisper: {
        text: string;
    };
}

export interface EventSubEventMap {
    "automod.message.hold": AutomodMessageHoldEvent;
    "automod.message.update": AutomodMessageUpdateEvent;
    "automod.settings.update": AutomodSettingsUpdateEvent;
    "automod.terms.update": AutomodTermsUpdateEvent;
    "channel.bits.use": ChannelBitsUseEvent;
    "channel.update": ChannelUpdateEvent;
    "channel.follow": ChannelFollowEvent;
    "channel.ad_break.begin": ChannelAdBreakBeginEvent;
    "channel.chat.clear": ChannelChatClearEvent;
    "channel.chat.clear_user_messages": ChannelChatClearUserMessagesEvent;
    "channel.chat.message": ChannelChatMessageEvent;
    "channel.chat.message_delete": ChannelChatMessageDeleteEvent;
    "channel.chat.notification": ChannelChatNotificationEvent;
    "channel.chat_settings.update": ChannelChatSettingsUpdateEvent;
    "channel.chat.user_message_hold": ChannelChatUserMessageHoldEvent;
    "channel.chat.user_message_update": ChannelChatUserMessageUpdateEvent;
    "channel.subscribe": ChannelSubscribeEvent;
    "channel.subscription.end": ChannelSubscriptionEndEvent;
    "channel.subscription.gift": ChannelSubscriptionGiftEvent;
    "channel.subscription.message": ChannelSubscriptionMessageEvent;
    "channel.cheer": ChannelCheerEvent;
    "channel.raid": ChannelRaidEvent;
    "channel.ban": ChannelBanEvent;
    "channel.unban": ChannelUnbanEvent;
    "channel.unban_request.create": ChannelUnbanRequestCreateEvent;
    "channel.unban_request.resolve": ChannelUnbanRequestResolveEvent;
    "channel.moderate": ChannelModerateEvent;
    "channel.moderator.add": ChannelModeratorAddEvent;
    "channel.moderator.remove": ChannelModeratorRemoveEvent;
    "channel.guest_star_session.begin": ChannelGuestStarSessionBeginEvent;
    "channel.guest_star_session.end": ChannelGuestStarSessionEndEvent;
    "channel.guest_star_guest.update": ChannelGuestStarGuestUpdateEvent;
    "channel.guest_star_settings.update": ChannelGuestStarSettingsUpdateEvent;
    "channel.channel_points_automatic_reward_redemption.add": ChannelPointsAutomaticRewardRedemptionAddEvent;
    "channel.channel_points_custom_reward.add": ChannelPointsCustomRewardEvent;
    "channel.channel_points_custom_reward.update": ChannelPointsCustomRewardEvent;
    "channel.channel_points_custom_reward.remove": ChannelPointsCustomRewardEvent;
    "channel.channel_points_custom_reward_redemption.add": ChannelPointsCustomRewardRedemptionBase & { status: "unfulfilled" | "unknown" };
    "channel.channel_points_custom_reward_redemption.update": ChannelPointsCustomRewardRedemptionBase & { status: "fulfilled" | "cancelled" };
    "channel.custom_power_up_redemption.add": ChannelCustomPowerUpRedemptionAddEvent;
    "channel.poll.begin": ChannelPollBeginEvent;
    "channel.poll.progress": ChannelPollBeginEvent;
    "channel.poll.end": ChannelPollEndEvent;
    "channel.prediction.begin": ChannelPredictionBeginEvent;
    "channel.prediction.progress": ChannelPredictionBeginEvent;
    "channel.prediction.lock": ChannelPredictionLockEvent;
    "channel.prediction.end": ChannelPredictionEndEvent;
    "channel.suspicious_user.update": ChannelSuspiciousUserUpdateEvent;
    "channel.suspicious_user.message": ChannelSuspiciousUserMessageEvent;
    "channel.vip.add": ChannelVipAddEvent;
    "channel.vip.remove": ChannelVipRemoveEvent;
    "channel.warning.acknowledge": ChannelWarningAcknowledgeEvent;
    "channel.warning.send": ChannelWarningSendEvent;
    "channel.hype_train.begin": ChannelHypeTrainBeginEvent;
    "channel.hype_train.progress": ChannelHypeTrainBeginEvent;
    "channel.hype_train.end": ChannelHypeTrainEndEvent;
    "channel.charity_campaign.donate": ChannelCharityCampaignDonateEvent;
    "channel.charity_campaign.start": ChannelCharityCampaignStartEvent;
    "channel.charity_campaign.progress": ChannelCharityCampaignStartEvent;
    "channel.charity_campaign.stop": ChannelCharityCampaignStopEvent;
    "channel.shared_chat.begin": ChannelSharedChatBeginEvent;
    "channel.shared_chat.update": ChannelSharedChatBeginEvent;
    "channel.shared_chat.end": ChannelSharedChatEndEvent;
    "channel.shield_mode.begin": ChannelShieldModeBeginEvent;
    "channel.shield_mode.end": ChannelShieldModeEndEvent;
    "channel.shoutout.create": ShoutoutCreateEvent;
    "channel.shoutout.receive": ShoutoutReceiveEvent;
    "conduit.shard.disabled": ConduitShardDisabledEvent;
    "drop.entitlement.grant": DropEntitlementGrantEvent;
    "extension.bits_transaction.create": ExtensionBitsTransactionCreateEvent;
    "channel.goal.begin": ChannelGoalBeginEvent;
    "channel.goal.progress": ChannelGoalBeginEvent;
    "channel.goal.end": ChannelGoalEndEvent;
    "stream.online": StreamOnlineEvent;
    "stream.offline": StreamOfflineEvent;
    "user.authorization.grant": UserAuthorizationGrantEvent;
    "user.authorization.revoke": UserAuthorizationRevokeEvent;
    "user.update": UserUpdateEvent;
    "user.whisper.message": UserWhisperMessageEvent;
}

export type EventSubEvent<T extends SubscriptionType> = T extends keyof EventSubEventMap
    ? EventSubEventMap[T]
    : unknown;

export interface EventSubMessage<T extends SubscriptionType = SubscriptionType> {
    metadata: {
        message_id: string;
        message_type: "session_welcome" | "session_keepalive" | "notification" | "session_reconnect" | "revocation";
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
