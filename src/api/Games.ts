import type { Creds, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/games";

type getOpts = {
    id?: string | string[];
    name?: string | string[];
    igdb_id?: string | string[];
}

interface Game {
    id: string;
    name: string;
    box_art_url: string;
    igdb_id: string | null;
}

const get = async (options: getOpts, creds: Creds): Promise<Result<Game[]>> => {
    try {
        const params = new URLSearchParams();

        if (options.id) {
            if (typeof options.id === "string")
                params.append("id", options.id);
            else
                options.id.forEach(id => params.append("id", id));
        }

        if (options.name) {
            if (typeof options.name === "string")
                params.append("name", options.name);
            else
                options.name.forEach(name => params.append("name", name));
        }

        if (options.igdb_id) {
            if (typeof options.igdb_id === "string")
                params.append("igdb_id", options.igdb_id);
            else
                options.igdb_id.forEach(igdb_id => params.append("igdb_id", igdb_id));
        }

        if (params.size >= 100)
            return {
                is_success: false,
                error: "Too many query parameters; Twitch API allows a maximum of 100 per request"
            };

        const response = await fetch(`${url}?${params.toString()}`, {
            headers: {
                "Client-Id": creds.clientId,
                "Authorization": `Bearer ${creds.accessToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok)
            return {
                is_success: false,
                error: `Failed to fetch games: ${response.status} ${response.statusText}`
            };

        const data = await response.json() as { data: Game[] };
        return { is_success: true, data: data.data };
    }
    
    catch (e: unknown) {
        return { is_success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

type getTopOpts = {
    first?: number;
    after?: string;
    before?: string;
}

const getTop = async (options: getTopOpts, creds: Creds): Promise<Result<{ data: Game[]; pagination: { cursor: string } }>> => {
    try {
        const params = new URLSearchParams();

        if (options.first)
            params.append("first", options.first.toString());

        if (options.after)
            params.append("after", options.after);

        if (options.before)
            params.append("before", options.before);

        const response = await fetch(`${url}/top?${params.toString()}`, {
            headers: {
                "Client-Id": creds.clientId,
                "Authorization": `Bearer ${creds.accessToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok)
            return {
                is_success: false,
                error: `Failed to fetch top games: ${response.status} ${response.statusText}`
            };

        const data = await response.json() as { data: Game[]; pagination: { cursor: string } };
        return { is_success: true, data };
    }
    
    catch (e: unknown) {
        return { is_success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export default {
    get,
    getTop
}