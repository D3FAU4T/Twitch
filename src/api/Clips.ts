import type { Creds, Paginated, PaginationOpts, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/clips";

type Clip = {
    id: string;
    url: string;
    embed_url: string;
    broadcaster_id: string;
    broadcaster_name: string;
    creator_id: string;
    creator_name: string;
    video_id: string;
    game_id: string;
    language: string;
    title: string;
    view_count: number;
    created_at: string;
    thumbnail_url: string;
    duration: number;
    vod_offset: number | null;
    is_featured: boolean;
};

const create = async (creds: Creds, opts: { broadcaster_id: string; has_delay?: boolean }): Promise<Result<{ id: string; edit_url: string }>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id });
    if (opts.has_delay !== undefined) params.append("has_delay", opts.has_delay.toString());

    const response = await fetch(`${url}?${params.toString()}`, {
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
            error: `Failed to create clip: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: { id: string; edit_url: string }[] };
    if (!data.data[0])
        return { is_success: false, error: "No clip returned" };

    return { is_success: true, data: data.data[0] };
};

type GetClipsOpts = PaginationOpts & {
    broadcaster_id?: string;
    game_id?: string;
    id?: string[];
    started_at?: string;
    ended_at?: string;
    is_featured?: boolean;
};

const get = async (creds: Creds, opts: GetClipsOpts): Promise<Result<Paginated<Clip>>> => {
    const params = new URLSearchParams();
    if (opts.broadcaster_id) params.append("broadcaster_id", opts.broadcaster_id);
    if (opts.game_id) params.append("game_id", opts.game_id);
    if (opts.id) opts.id.forEach((id) => params.append("id", id));
    if (opts.started_at) params.append("started_at", opts.started_at);
    if (opts.ended_at) params.append("ended_at", opts.ended_at);
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.before) params.append("before", opts.before);
    if (opts.after) params.append("after", opts.after);
    if (opts.is_featured !== undefined) params.append("is_featured", opts.is_featured.toString());

    const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch clips: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<Clip>;
    return { is_success: true, data };
};

export default {
    create,
    get
};
