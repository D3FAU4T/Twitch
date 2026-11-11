import type { Creds, HelixUser, PaginationOpts, Result, TotalPaginated } from "../types/Generic";

interface SendMessageParams {
    broadcaster_id: string;
    sender_id: string;
    message: string;
    reply_parent_message_id?: string;
}

interface SendMessageResponse {
    message_id: string;
    is_sent: boolean;
}

const send = async (creds: Creds, params: SendMessageParams): Promise<Result<SendMessageResponse>> => {
    const response = await fetch("https://api.twitch.tv/helix/chat/messages", {
        method: "POST",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to send chat message: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: SendMessageResponse[] };
    const result = data.data[0];

    if (!result?.message_id)
        throw new Error("No message_id in response");

    return { is_success: true, data: result };
};

export type announceParams = {
    broadcaster_id: string;
    moderator_id: string;
    message: string;
    for_source_only?: boolean;
    color?: "blue" | "green" | "orange" | "purple" | "primary";
};

const announce = async (creds: Creds, params: announceParams): Promise<Result<null>> => {
    const response = await fetch("https://api.twitch.tv/helix/chat/announcements", {
        method: "POST",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to send chat announcement: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
};

type Chatter = HelixUser;

type GetChattersOpts = PaginationOpts & {
    broadcaster_id: string;
    moderator_id: string;
};

const getChatters = async (creds: Creds, opts: GetChattersOpts): Promise<Result<TotalPaginated<Chatter>>> => {
    const params = new URLSearchParams({
        broadcaster_id: opts.broadcaster_id,
        moderator_id: opts.moderator_id
    });
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);

    const response = await fetch(`https://api.twitch.tv/helix/chat/chatters?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch chatters: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as TotalPaginated<Chatter>;
    return { is_success: true, data };
};

type ChatSettings = {
    broadcaster_id: string;
    slow_mode: boolean;
    slow_mode_wait_time: number | null;
    follower_mode: boolean;
    follower_mode_duration: number | null;
    subscriber_mode: boolean;
    emote_mode: boolean;
    unique_chat_mode: boolean;
    non_moderator_chat_delay: boolean;
    non_moderator_chat_delay_duration: number | null;
};

const getSettings = async (creds: Creds, opts: { broadcaster_id: string; moderator_id?: string }): Promise<Result<ChatSettings>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id });
    if (opts.moderator_id) params.append("moderator_id", opts.moderator_id);

    const response = await fetch(`https://api.twitch.tv/helix/chat/settings?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch chat settings: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: ChatSettings[] };
    if (!data.data[0])
        return { is_success: false, error: "No chat settings returned" };

    return { is_success: true, data: data.data[0] };
};

const updateSettings = async (
    creds: Creds,
    opts: { broadcaster_id: string; moderator_id: string } & Partial<Omit<ChatSettings, "broadcaster_id">>
): Promise<Result<ChatSettings>> => {
    const { broadcaster_id, moderator_id, ...body } = opts;
    const params = new URLSearchParams({ broadcaster_id, moderator_id });

    const response = await fetch(`https://api.twitch.tv/helix/chat/settings?${params.toString()}`, {
        method: "PATCH",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to update chat settings: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: ChatSettings[] };
    if (!data.data[0])
        return { is_success: false, error: "No chat settings returned" };

    return { is_success: true, data: data.data[0] };
};

type Emote = {
    id: string;
    name: string;
    images: { url_1x: string; url_2x: string; url_4x: string };
    tier?: string;
    emote_type?: string;
    emote_set_id?: string;
    format: string[];
    scale: string[];
    theme_mode: string[];
};

const getChannelEmotes = async (creds: Creds, broadcaster_id: string): Promise<Result<Emote[]>> => {
    const response = await fetch(`https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${broadcaster_id}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch channel emotes: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: Emote[] };
    return { is_success: true, data: data.data };
};

const getGlobalEmotes = async (creds: Creds): Promise<Result<Emote[]>> => {
    const response = await fetch("https://api.twitch.tv/helix/chat/emotes/global", {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch global emotes: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: Emote[] };
    return { is_success: true, data: data.data };
};

type BadgeVersion = {
    id: string;
    image_url_1x: string;
    image_url_2x: string;
    image_url_4x: string;
    title: string;
    description: string;
    click_action: string | null;
    click_url: string | null;
};

type BadgeSet = {
    set_id: string;
    versions: BadgeVersion[];
};

const getChannelBadges = async (creds: Creds, broadcaster_id: string): Promise<Result<BadgeSet[]>> => {
    const response = await fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${broadcaster_id}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch channel badges: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: BadgeSet[] };
    return { is_success: true, data: data.data };
};

const getGlobalBadges = async (creds: Creds): Promise<Result<BadgeSet[]>> => {
    const response = await fetch("https://api.twitch.tv/helix/chat/badges/global", {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch global badges: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: BadgeSet[] };
    return { is_success: true, data: data.data };
};

type ShoutoutOpts = {
    from_broadcaster_id: string;
    to_broadcaster_id: string;
    moderator_id: string;
};

const shoutout = async (creds: Creds, opts: ShoutoutOpts): Promise<Result<null>> => {
    const params = new URLSearchParams({
        from_broadcaster_id: opts.from_broadcaster_id,
        to_broadcaster_id: opts.to_broadcaster_id,
        moderator_id: opts.moderator_id
    });

    const response = await fetch(`https://api.twitch.tv/helix/chat/shoutouts?${params.toString()}`, {
        method: "POST",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to send shoutout: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
};

export default {
    send,
    announce,
    getChatters,
    getSettings,
    updateSettings,
    getChannelEmotes,
    getGlobalEmotes,
    getChannelBadges,
    getGlobalBadges,
    shoutout
};
