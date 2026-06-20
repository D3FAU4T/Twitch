import type { Creds, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/channels";

type Channel = {
    broadcaster_id: string;
    broadcaster_login: string;
    broadcaster_name: string;
    broadcaster_language: string;
    game_id: string;
    game_name: string;
    title: string;
    delay: number;
    tags: string[];
    content_classification_labels: string[];
    is_branded_content: boolean;
}

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
}

type PatchOpts = {
    game_id: string;
    broadcaster_language: string;
    title: string;
    delay: number;
    tags: string[];
    content_classification_labels: {
        id: string;
        is_enabled: boolean;
    }[];
    is_branded_content: boolean;
}

const patch = async (broadcaster_id: string, creds: Creds, options: Partial<PatchOpts>): Promise<Result<Channel>> => {
    const params = new URLSearchParams({ broadcaster_id });

    const response = await fetch(`${url}?${params.toString()}`, {
        method: "PATCH",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(options)
    });

    if (!response.ok)
        return {
            is_success: false,
            error: `Failed to update channel information: ${response.status} ${response.statusText}`
        };

    const data = await response.json() as { data: Channel };
    return { is_success: true, data: data.data };
}

export default {
    get,
    patch
}