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

type headerAuth = {
    "Client-Id": string;
    AuthWithoutBearer: string;
}

const get = async (options: getOpts, header: headerAuth) => {
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

    if (params.size >= 100) {
        throw new RangeError("Too many query parameters; Twitch API allows a maximum of 100 per request");
    }

    const response = await fetch(`${url}?${params.toString()}`, {
        headers: header
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { data: Game[] };

    return data.data;
}

type getTopOpts = {
    first?: number;
    after?: string;
    before?: string;
}

const getTop = async (options: getTopOpts, header: headerAuth) => {
    const params = new URLSearchParams();

    if (options.first) {
        params.append("first", options.first.toString());
    }

    if (options.after) {
        params.append("after", options.after);
    }

    if (options.before) {
        params.append("before", options.before);
    }

    const response = await fetch(`${url}/top?${params.toString()}`, {
        headers: header
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch top games: ${response.status} ${response.statusText}`);
    }

    return await response.json() as { data: Game[]; pagination: { cursor: string } };
}

export default {
    get,
    getTop
}