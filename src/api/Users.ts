import type { Creds, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/users";

type getOpts = {
    ids: string[];
    names: string[];
}

type User = {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: "affiliate" | "partner";
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email: string;
    created_at: string;
}

const get = async (opts: Partial<getOpts>, creds: Creds): Promise<Result<User[]>> => {
    const params = new URLSearchParams();

    if (opts.ids) {
        opts.ids.forEach((id) => params.append("id", id));
    }

    if (opts.names) {
        opts.names.forEach((name) => params.append("login", name));
    }

    const response = await fetch(url + "?" + params.toString(), {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok)
        return {
            is_success: false,
            error: `Failed to fetch user information: ${response.status} ${response.statusText}`
        }

    const data = await response.json() as { data: User[] };

    return {
        is_success: true,
        data: data.data
    };
}

export default { get };