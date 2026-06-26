import type { Creds, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/videos";

type getOptsBase = {
    period: "all" | "day" | "week" | "month";
    sort: "time" | "trending" | "views";
    type: "all" | "upload" | "archive" | "highlight";
    first: string;
}

type getOptsUserId = Partial<getOptsBase> & {
    user_id: string;
    after?: string;
    before?: string;
}

type getOptsGameId = Partial<getOptsBase> & {
    game_id: string;
    language?: string;
}

type getOptsId = {
    id: string;
}

interface VideoBase {
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    title: string;
    description: string;
    created_at: string;
    published_at: string;
    url: string;
    thumbnail_url: string;
    viewable: "public",
    view_count: number;
    language: string;
    type: "upload" | "archive" | "highlight";
    duration: string;
    muted_segments: {
        duration: number;
        offset: number;
    }[] | null;
}

interface VideoArchive extends VideoBase {
    stream_id: string;
    type: "archive";
}

interface VideoRegular extends VideoBase {
    stream_id: null;
}

type Video = VideoArchive | VideoRegular;

const get = async (opt: getOptsUserId | getOptsGameId | getOptsId, creds: Creds): Promise<Result<Video[]>> => {

    const params = new URLSearchParams(opt);

    const res = await fetch(url + '?' + params.toString(), {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!res.ok)
        return {
            is_success: false,
            error: `Failed to fetch videos: ${res.status} ${res.statusText}`
        }

    const data = await res.json() as { data: Video[], pagination: { cursor?: string } };

    return {
        is_success: true,
        data: data.data
    }
}

const del = async (videoId: string[], creds: Creds): Promise<Result<string[]>> => {
    const params = new URLSearchParams();
    videoId.forEach(id => params.append("id", id));

    const res = await fetch(url + '?' + params.toString(), {
        method: "DELETE",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!res.ok)
        return {
            is_success: false,
            error: `Failed to delete videos: ${res.status} ${res.statusText}`
        }

    const data = await res.json() as { data: string[] };

    return {
        is_success: true,
        data: data.data
    }
}

export default {
    get,
    del
}