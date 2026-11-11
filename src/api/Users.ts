import type { Creds, Paginated, PaginationOpts, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/users";

type getOpts = {
    ids: string[];
    names: string[];
};

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
};

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
        };

    const data = await response.json() as { data: User[] };

    return {
        is_success: true,
        data: data.data
    };
};

const put = async (description: string | null, creds: Creds): Promise<Result<User[]>> => {
    const res = await fetch(`${url}?description=${description ? encodeURIComponent(description) : ""}`, {
        method: "PUT",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
    });

    if (!res.ok)
        return {
            is_success: false,
            error: `Failed to update user information: ${res.status} ${res.statusText}`
        };

    const data = await res.json() as { data: User[] };

    return {
        is_success: true,
        data: data.data
    };
};

type BlockedUser = {
    user_id: string;
    user_login: string;
    display_name: string;
};

const getBlockList = async (broadcaster_id: string, creds: Creds, opts?: PaginationOpts): Promise<Result<Paginated<BlockedUser>>> => {
    const params = new URLSearchParams({ broadcaster_id });
    if (opts?.first) params.append("first", opts.first.toString());
    if (opts?.after) params.append("after", opts.after);

    const response = await fetch(`${url}/blocks?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok)
        return {
            is_success: false,
            error: `Failed to fetch blocked users: ${response.status} ${response.statusText}`
        };

    const data = await response.json() as Paginated<BlockedUser>;
    return { is_success: true, data };
};

const block = async (target_user_id: string, creds: Creds, opts?: { source_context?: "chat" | "whisper"; reason?: "harassment" | "spam" | "other" }): Promise<Result<null>> => {
    const params = new URLSearchParams({ target_user_id });
    if (opts?.source_context) params.append("source_context", opts.source_context);
    if (opts?.reason) params.append("reason", opts.reason);

    const response = await fetch(`${url}/blocks?${params.toString()}`, {
        method: "PUT",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok)
        return {
            is_success: false,
            error: `Failed to block user: ${response.status} ${response.statusText}`
        };

    return { is_success: true, data: null };
};

const unblock = async (target_user_id: string, creds: Creds): Promise<Result<null>> => {
    const response = await fetch(`${url}/blocks?target_user_id=${target_user_id}`, {
        method: "DELETE",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok)
        return {
            is_success: false,
            error: `Failed to unblock user: ${response.status} ${response.statusText}`
        };

    return { is_success: true, data: null };
};

export default {
    get,
    put,
    getBlockList,
    block,
    unblock
};
