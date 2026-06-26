import type { Creds, Result } from "../types/Generic";

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

interface Stream {
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_id: string;
    game_name: string;
    type: "live" | "";
    title: string;
    viewer_count: number;
    started_at: string;
    language: string;
    thumbnail_url: string;
    
    /**
     * @deprecated This field is deprecated and will return empty array
     */
    tag_ids: never[];
    /**
     * @deprecated This field is deprecated and will return false
     */
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
        }

    const data = await res.json() as { data: Stream[], pagination: { cursor?: string } };

    return {
        is_success: true,
        data: data.data
    }
}

export default {
    get
}