import type { Creds, Paginated, PaginationOpts, Result } from "../types/Generic";

type BaseAnalytics = {
    URL: string;
    type: string;
    date_range: { started_at: string; ended_at: string };
};

type ExtensionAnalytics = BaseAnalytics & {
    extension_id: string;
};

type BaseAnalyticsOpts = PaginationOpts & {
    type?: string;
    started_at?: string;
    ended_at?: string;
};

type GetExtensionAnalyticsOpts = BaseAnalyticsOpts & {
    extension_id?: string;
};

const getExtensionAnalytics = async (creds: Creds, opts?: GetExtensionAnalyticsOpts): Promise<Result<Paginated<ExtensionAnalytics>>> => {
    const params = new URLSearchParams();
    if (opts?.extension_id) params.append("extension_id", opts.extension_id);
    if (opts?.type) params.append("type", opts.type);
    if (opts?.started_at) params.append("started_at", opts.started_at);
    if (opts?.ended_at) params.append("ended_at", opts.ended_at);
    if (opts?.first) params.append("first", opts.first.toString());
    if (opts?.after) params.append("after", opts.after);

    const response = await fetch(`https://api.twitch.tv/helix/analytics/extensions?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch extension analytics: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<ExtensionAnalytics>;
    return { is_success: true, data };
};

type GameAnalytics = BaseAnalytics & {
    game_id: string;
};

type GetGameAnalyticsOpts = BaseAnalyticsOpts & {
    game_id?: string;
};

const getGameAnalytics = async (creds: Creds, opts?: GetGameAnalyticsOpts): Promise<Result<Paginated<GameAnalytics>>> => {
    const params = new URLSearchParams();
    if (opts?.game_id) params.append("game_id", opts.game_id);
    if (opts?.type) params.append("type", opts.type);
    if (opts?.started_at) params.append("started_at", opts.started_at);
    if (opts?.ended_at) params.append("ended_at", opts.ended_at);
    if (opts?.first) params.append("first", opts.first.toString());
    if (opts?.after) params.append("after", opts.after);

    const response = await fetch(`https://api.twitch.tv/helix/analytics/games?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch game analytics: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<GameAnalytics>;
    return { is_success: true, data };
};

export default {
    getExtensionAnalytics,
    getGameAnalytics
};
