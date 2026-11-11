import type { Creds, Result } from "../types/Generic";

type AdSchedule = {
    snooze_count: number;
    snooze_refresh_at: string;
    next_ad_at: string;
    duration: number;
    last_ad_at: string;
    preroll_free_time: number;
};

const getSchedule = async (creds: Creds, broadcaster_id: string): Promise<Result<AdSchedule>> => {
    const response = await fetch(`https://api.twitch.tv/helix/channels/ads?broadcaster_id=${broadcaster_id}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch ad schedule: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: AdSchedule[] };
    if (!data.data[0])
        return { is_success: false, error: "No ad schedule returned" };

    return { is_success: true, data: data.data[0] };
};

type SnoozeResult = Pick<AdSchedule, "snooze_count" | "snooze_refresh_at" | "next_ad_at">;

const snooze = async (creds: Creds, broadcaster_id: string): Promise<Result<SnoozeResult>> => {
    const response = await fetch(`https://api.twitch.tv/helix/channels/ads/snooze?broadcaster_id=${broadcaster_id}`, {
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
            error: `Failed to snooze ad: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: SnoozeResult[] };
    if (!data.data[0])
        return { is_success: false, error: "No snooze data returned" };

    return { is_success: true, data: data.data[0] };
};

type CommercialResult = {
    length: number;
    message: string;
    retry_after: number;
};

const startCommercial = async (creds: Creds, opts: { broadcaster_id: string; length: 30 | 60 | 90 | 120 | 150 | 180 }): Promise<Result<CommercialResult>> => {
    const response = await fetch("https://api.twitch.tv/helix/channels/commercial", {
        method: "POST",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(opts)
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to start commercial: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: CommercialResult[] };
    if (!data.data[0])
        return { is_success: false, error: "No commercial data returned" };

    return { is_success: true, data: data.data[0] };
};

export default {
    getSchedule,
    snooze,
    startCommercial
};
