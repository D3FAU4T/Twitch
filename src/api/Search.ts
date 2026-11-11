import type { Creds, Paginated, PaginationOpts, Result } from "../types/Generic";

type SearchCategory = {
    id: string;
    name: string;
    box_art_url: string;
};

type SearchChannel = {
    broadcaster_language: string;
    broadcaster_login: string;
    display_name: string;
    game_id: string;
    game_name: string;
    id: string;
    is_live: boolean;
    tag_ids: never[];
    tags: string[];
    thumbnail_url: string;
    title: string;
    started_at: string;
};

type SearchOpts = PaginationOpts & {
    query: string;
};

const categories = async (creds: Creds, opts: SearchOpts): Promise<Result<Paginated<SearchCategory>>> => {
    const params = new URLSearchParams({ query: opts.query });
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);

    const response = await fetch(`https://api.twitch.tv/helix/search/categories?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to search categories: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<SearchCategory>;
    return { is_success: true, data };
};

const channels = async (creds: Creds, opts: SearchOpts & { live_only?: boolean }): Promise<Result<Paginated<SearchChannel>>> => {
    const params = new URLSearchParams({ query: opts.query });
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);
    if (opts.live_only !== undefined) params.append("live_only", opts.live_only.toString());

    const response = await fetch(`https://api.twitch.tv/helix/search/channels?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to search channels: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<SearchChannel>;
    return { is_success: true, data };
};

export default {
    categories,
    channels
};
