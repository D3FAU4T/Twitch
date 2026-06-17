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

type headerAuth = {
    "Client-Id": string;
    AuthWithoutBearer: string;
}

const get = async (broadcaster_id: string, header: headerAuth) => {
    const params = new URLSearchParams({ broadcaster_id });
    const response = await fetch(`${url}?${params.toString()}`, {
        headers: header
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch channel information: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { data: Channel[] };

    return data.data;
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

const patch = async (broadcaster_id: string, options: Partial<PatchOpts>, header: headerAuth) => {
    const params = new URLSearchParams({ broadcaster_id });

    const response = await fetch(`${url}?${params.toString()}`, {
        method: "PATCH",
        headers: {
            ...header,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(options)
    });

    if (!response.ok) {
        throw new Error(`Failed to update channel information: ${response.status} ${response.statusText}`);
    }
}

export default {
    get,
    patch
}