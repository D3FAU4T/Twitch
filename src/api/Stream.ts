import type { Creds, HelixUser, Paginated, PaginationOpts, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/streams";

interface getOpts {
    user_id: string[];
    user_login: string[];
    game_id: string[];
    type: "all" | "live";
    language: string[];
    first: number;
    before: string;
    after: string;
}

interface Stream extends HelixUser {
    id: string;
    game_id: string;
    game_name: string;
    type: "live" | "";
    title: string;
    viewer_count: number;
    started_at: string;
    language: string;
    thumbnail_url: string;
    tag_ids: never[];
    is_mature: false;
}

const get = async (opt: Partial<getOpts>, creds: Creds): Promise<Result<Stream[]>> => {
    const params = new URLSearchParams();

    if (opt.user_id)
        opt.user_id.forEach(id => params.append("user_id", id));

    if (opt.user_login)
        opt.user_login.forEach(login => params.append("user_login", login));

    if (opt.game_id)
        opt.game_id.forEach(id => params.append("game_id", id));

    if (opt.language)
        opt.language.forEach(lang => params.append("language", lang));

    if (opt.type)
        params.append("type", opt.type);

    if (opt.first)
        params.append("first", opt.first.toString());

    if (opt.before)
        params.append("before", opt.before);

    if (opt.after)
        params.append("after", opt.after);

    const res = await fetch(url + "?" + params.toString(), {
        method: "GET",
        headers: {
            "Client-ID": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!res.ok)
        return {
            is_success: false,
            error: `Failed to fetch streams: ${res.status} ${res.statusText}`
        };

    const data = await res.json() as { data: Stream[]; pagination: { cursor?: string } };

    return {
        is_success: true,
        data: data.data
    };
};

const getStreamKey = async (broadcaster_id: string, creds: Creds): Promise<Result<string>> => {
    const res = await fetch(`${url}/key?broadcaster_id=${broadcaster_id}`, {
        headers: {
            "Client-ID": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!res.ok)
        return {
            is_success: false,
            error: `Failed to fetch stream key: ${res.status} ${res.statusText}`
        };

    const data = await res.json() as { data: { stream_key: string }[] };
    if (!data.data[0])
        return { is_success: false, error: "No stream key returned" };

    return { is_success: true, data: data.data[0].stream_key };
};

const getFollowed = async (user_id: string, creds: Creds, opts?: PaginationOpts): Promise<Result<Paginated<Stream>>> => {
    const params = new URLSearchParams({ user_id });
    if (opts?.first) params.append("first", opts.first.toString());
    if (opts?.after) params.append("after", opts.after);

    const res = await fetch(`${url}/followed?${params.toString()}`, {
        headers: {
            "Client-ID": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!res.ok)
        return {
            is_success: false,
            error: `Failed to fetch followed streams: ${res.status} ${res.statusText}`
        };

    const data = await res.json() as Paginated<Stream>;
    return { is_success: true, data };
};

type StreamMarker = {
    id: string;
    created_at: string;
    description: string;
    position_seconds: number;
    url?: string;
};

const createMarker = async (creds: Creds, opts: { user_id: string; description?: string }): Promise<Result<StreamMarker>> => {
    const res = await fetch(`${url}/markers`, {
        method: "POST",
        headers: {
            "Client-ID": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(opts)
    });

    if (!res.ok)
        return {
            is_success: false,
            error: `Failed to create stream marker: ${res.status} ${res.statusText}`
        };

    const data = await res.json() as { data: StreamMarker[] };
    if (!data.data[0])
        return { is_success: false, error: "No stream marker returned" };

    return { is_success: true, data: data.data[0] };
};

type GetMarkersOpts = PaginationOpts & {
    user_id?: string;
    video_id?: string;
};

const getMarkers = async (creds: Creds, opts: GetMarkersOpts): Promise<Result<Paginated<HelixUser & { videos: { video_id: string; markers: StreamMarker[] }[] }>>> => {
    const params = new URLSearchParams();
    if (opts.user_id) params.append("user_id", opts.user_id);
    if (opts.video_id) params.append("video_id", opts.video_id);
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.before) params.append("before", opts.before);
    if (opts.after) params.append("after", opts.after);

    const res = await fetch(`${url}/markers?${params.toString()}`, {
        headers: {
            "Client-ID": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!res.ok)
        return {
            is_success: false,
            error: `Failed to fetch stream markers: ${res.status} ${res.statusText}`
        };

    const data = await res.json() as Paginated<HelixUser & { videos: { video_id: string; markers: StreamMarker[] }[] }>;
    return { is_success: true, data };
};

export default {
    get,
    getStreamKey,
    getFollowed,
    createMarker,
    getMarkers
};
