import type { Creds, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/raids";

type RaidResult = {
    created_at: string;
    is_mature: boolean;
};

const start = async (creds: Creds, opts: { from_broadcaster_id: string; to_broadcaster_id: string }): Promise<Result<RaidResult>> => {
    const params = new URLSearchParams({
        from_broadcaster_id: opts.from_broadcaster_id,
        to_broadcaster_id: opts.to_broadcaster_id
    });

    const response = await fetch(`${url}?${params.toString()}`, {
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
            error: `Failed to start raid: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: RaidResult[] };
    if (!data.data[0])
        return { is_success: false, error: "No raid data returned" };

    return { is_success: true, data: data.data[0] };
};

const cancel = async (creds: Creds, broadcaster_id: string): Promise<Result<null>> => {
    const response = await fetch(`${url}?broadcaster_id=${broadcaster_id}`, {
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
            error: `Failed to cancel raid: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
};

export default {
    start,
    cancel
};
