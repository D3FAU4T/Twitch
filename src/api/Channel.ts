import type { Creds, HelixBroadcaster, HelixUser, Paginated, PaginationOpts, Result, TotalPaginated } from "../types/Generic";

const url = "https://api.twitch.tv/helix/channels";

type Channel = HelixBroadcaster & {
    broadcaster_language: string;
    game_id: string;
    game_name: string;
    title: string;
    delay: number;
    tags: string[];
    content_classification_labels: string[];
    is_branded_content: boolean;
};

const get = async (broadcaster_id: string, creds: Creds): Promise<Result<Channel[]>> => {
    const params = new URLSearchParams({ broadcaster_id });
    const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok)
        return {
            is_success: false,
            error: `Failed to fetch channel information: ${response.status} ${response.statusText}`
        };

    const data = await response.json() as { data: Channel[] };
    return { is_success: true, data: data.data };
};

type PatchOpts = Partial<Pick<Channel, "game_id" | "broadcaster_language" | "title" | "delay" | "tags" | "is_branded_content">> & {
    content_classification_labels?: {
        id: string;
        is_enabled: boolean;
    }[];
};

const patch = async (broadcaster_id: string, creds: Creds, options: PatchOpts): Promise<Result<null>> => {
    const params = new URLSearchParams({ broadcaster_id });
    const response = await fetch(`${url}?${params.toString()}`, {
        method: "PATCH",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(options)
    });

    if (!response.ok)
        return {
            is_success: false,
            error: `Failed to update channel information: ${response.status} ${response.statusText}`
        };

    return { is_success: true, data: null };
};

type ChannelEditor = {
    user_id: string;
    user_name: string;
    created_at: string;
};

const getEditors = async (broadcaster_id: string, creds: Creds): Promise<Result<ChannelEditor[]>> => {
    const response = await fetch(`${url}/editors?broadcaster_id=${broadcaster_id}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok)
        return {
            is_success: false,
            error: `Failed to fetch channel editors: ${response.status} ${response.statusText}`
        };

    const data = await response.json() as { data: ChannelEditor[] };
    return { is_success: true, data: data.data };
};

type ChannelFollower = HelixUser & {
    followed_at: string;
};

type GetFollowersOpts = PaginationOpts & {
    broadcaster_id: string;
    user_id?: string;
};

const getFollowers = async (opts: GetFollowersOpts, creds: Creds): Promise<Result<TotalPaginated<ChannelFollower>>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id });
    if (opts.user_id) params.append("user_id", opts.user_id);
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);

    const response = await fetch(`${url}/followers?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok)
        return {
            is_success: false,
            error: `Failed to fetch channel followers: ${response.status} ${response.statusText}`
        };

    const data = await response.json() as TotalPaginated<ChannelFollower>;
    return { is_success: true, data };
};

type FollowedChannel = HelixBroadcaster & {
    followed_at: string;
};

type GetFollowedOpts = PaginationOpts & {
    user_id: string;
    broadcaster_id?: string;
};

const getFollowedChannels = async (opts: GetFollowedOpts, creds: Creds): Promise<Result<TotalPaginated<FollowedChannel>>> => {
    const params = new URLSearchParams({ user_id: opts.user_id });
    if (opts.broadcaster_id) params.append("broadcaster_id", opts.broadcaster_id);
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);

    const response = await fetch(`${url}/followed?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok)
        return {
            is_success: false,
            error: `Failed to fetch followed channels: ${response.status} ${response.statusText}`
        };

    const data = await response.json() as TotalPaginated<FollowedChannel>;
    return { is_success: true, data };
};

type ChannelVIP = HelixUser;

const getVIPs = async (broadcaster_id: string, creds: Creds, opts?: PaginationOpts): Promise<Result<Paginated<ChannelVIP>>> => {
    const params = new URLSearchParams({ broadcaster_id });
    if (opts?.first) params.append("first", opts.first.toString());
    if (opts?.after) params.append("after", opts.after);

    const response = await fetch(`${url}/vips?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok)
        return {
            is_success: false,
            error: `Failed to fetch channel VIPs: ${response.status} ${response.statusText}`
        };

    const data = await response.json() as Paginated<ChannelVIP>;
    return { is_success: true, data };
};

export default {
    get,
    patch,
    getEditors,
    getFollowers,
    getFollowedChannels,
    getVIPs
};
