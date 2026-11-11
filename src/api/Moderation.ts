import type { Creds, HelixBroadcaster, HelixModerator, HelixUser, Paginated, PaginationOpts, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/moderation";

type BannedUser = HelixUser & HelixModerator & {
    expires_at: string;
    created_at: string;
    reason: string;
};

type GetBannedOpts = PaginationOpts & {
    broadcaster_id: string;
    user_id?: string[];
};

const getBannedUsers = async (creds: Creds, opts: GetBannedOpts): Promise<Result<Paginated<BannedUser>>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id });
    if (opts.user_id) opts.user_id.forEach((id) => params.append("user_id", id));
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);
    if (opts.before) params.append("before", opts.before);

    const response = await fetch(`${url}/banned?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch banned users: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<BannedUser>;
    return { is_success: true, data };
};

type BanUserOpts = {
    broadcaster_id: string;
    moderator_id: string;
    data: {
        user_id: string;
        duration?: number;
        reason?: string;
    };
};

const ban = async (creds: Creds, opts: BanUserOpts): Promise<Result<{ broadcaster_id: string; moderator_id: string; user_id: string; created_at: string; end_time: string | null }>> => {
    const params = new URLSearchParams({
        broadcaster_id: opts.broadcaster_id,
        moderator_id: opts.moderator_id
    });

    const response = await fetch(`${url}/bans?${params.toString()}`, {
        method: "POST",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: opts.data })
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to ban user: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: { broadcaster_id: string; moderator_id: string; user_id: string; created_at: string; end_time: string | null }[] };
    if (!data.data[0])
        return { is_success: false, error: "No ban result returned" };

    return { is_success: true, data: data.data[0] };
};

const unban = async (creds: Creds, opts: { broadcaster_id: string; moderator_id: string; user_id: string }): Promise<Result<null>> => {
    const params = new URLSearchParams({
        broadcaster_id: opts.broadcaster_id,
        moderator_id: opts.moderator_id,
        user_id: opts.user_id
    });

    const response = await fetch(`${url}/bans?${params.toString()}`, {
        method: "DELETE",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to unban user: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
};

type UnbanRequest = HelixBroadcaster & HelixModerator & HelixUser & {
    id: string;
    text: string;
    status: "pending" | "approved" | "denied" | "acknowledged" | "canceled";
    created_at: string;
    resolved_at: string | null;
    resolution_text: string | null;
};

type GetUnbanRequestsOpts = PaginationOpts & {
    broadcaster_id: string;
    moderator_id: string;
    status: UnbanRequest["status"];
    user_id?: string;
};

const getUnbanRequests = async (creds: Creds, opts: GetUnbanRequestsOpts): Promise<Result<Paginated<UnbanRequest>>> => {
    const params = new URLSearchParams({
        broadcaster_id: opts.broadcaster_id,
        moderator_id: opts.moderator_id,
        status: opts.status
    });
    if (opts.user_id) params.append("user_id", opts.user_id);
    if (opts.after) params.append("after", opts.after);
    if (opts.first) params.append("first", opts.first.toString());

    const response = await fetch(`${url}/unban_requests?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch unban requests: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<UnbanRequest>;
    return { is_success: true, data };
};

type ResolveUnbanRequestOpts = Pick<GetUnbanRequestsOpts, "broadcaster_id" | "moderator_id"> & {
    unban_request_id: string;
    status: "approved" | "denied";
    resolution_text?: string;
};

const resolveUnbanRequest = async (creds: Creds, opts: ResolveUnbanRequestOpts): Promise<Result<UnbanRequest>> => {
    const params = new URLSearchParams({
        broadcaster_id: opts.broadcaster_id,
        moderator_id: opts.moderator_id,
        unban_request_id: opts.unban_request_id,
        status: opts.status
    });
    if (opts.resolution_text) params.append("resolution_text", opts.resolution_text);

    const response = await fetch(`${url}/unban_requests?${params.toString()}`, {
        method: "PATCH",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to resolve unban request: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: UnbanRequest[] };
    if (!data.data[0])
        return { is_success: false, error: "No unban request returned" };

    return { is_success: true, data: data.data[0] };
};

type ModeratorUser = HelixUser;

const getModerators = async (creds: Creds, opts: PaginationOpts & { broadcaster_id: string; user_id?: string[] }): Promise<Result<Paginated<ModeratorUser>>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id });
    if (opts.user_id) opts.user_id.forEach((id) => params.append("user_id", id));
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);

    const response = await fetch(`${url}/moderators?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch moderators: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<ModeratorUser>;
    return { is_success: true, data };
};

const addModerator = async (creds: Creds, opts: { broadcaster_id: string; user_id: string }): Promise<Result<null>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id, user_id: opts.user_id });
    const response = await fetch(`${url}/moderators?${params.toString()}`, {
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
            error: `Failed to add moderator: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
};

const removeModerator = async (creds: Creds, opts: { broadcaster_id: string; user_id: string }): Promise<Result<null>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id, user_id: opts.user_id });
    const response = await fetch(`${url}/moderators?${params.toString()}`, {
        method: "DELETE",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to remove moderator: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
};

type ShieldModeStatus = HelixModerator & {
    is_active: boolean;
    last_activated_at: string;
};

const getShieldMode = async (creds: Creds, opts: { broadcaster_id: string; moderator_id: string }): Promise<Result<ShieldModeStatus>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id, moderator_id: opts.moderator_id });
    const response = await fetch(`${url}/shield_mode?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to get shield mode: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: ShieldModeStatus[] };
    if (!data.data[0])
        return { is_success: false, error: "No shield mode data returned" };

    return { is_success: true, data: data.data[0] };
};

const updateShieldMode = async (creds: Creds, opts: { broadcaster_id: string; moderator_id: string; is_active: boolean }): Promise<Result<ShieldModeStatus>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id, moderator_id: opts.moderator_id });
    const response = await fetch(`${url}/shield_mode?${params.toString()}`, {
        method: "PUT",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_active: opts.is_active })
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to update shield mode: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: ShieldModeStatus[] };
    if (!data.data[0])
        return { is_success: false, error: "No shield mode data returned" };

    return { is_success: true, data: data.data[0] };
};

const warnUser = async (creds: Creds, opts: { broadcaster_id: string; moderator_id: string; data: { user_id: string; reason: string } }): Promise<Result<{ broadcaster_id: string; user_id: string; moderator_id: string; reason: string }>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id, moderator_id: opts.moderator_id });
    const response = await fetch(`${url}/warnings?${params.toString()}`, {
        method: "POST",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: opts.data })
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to warn user: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: { broadcaster_id: string; user_id: string; moderator_id: string; reason: string }[] };
    if (!data.data[0])
        return { is_success: false, error: "No warning result returned" };

    return { is_success: true, data: data.data[0] };
};

const deleteChatMessages = async (creds: Creds, opts: { broadcaster_id: string; moderator_id: string; message_id?: string }): Promise<Result<null>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id, moderator_id: opts.moderator_id });
    if (opts.message_id) params.append("message_id", opts.message_id);

    const response = await fetch(`${url}/chat?${params.toString()}`, {
        method: "DELETE",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to delete chat messages: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
};

export default {
    getBannedUsers,
    ban,
    unban,
    getUnbanRequests,
    resolveUnbanRequest,
    getModerators,
    addModerator,
    removeModerator,
    getShieldMode,
    updateShieldMode,
    warnUser,
    deleteChatMessages
};
