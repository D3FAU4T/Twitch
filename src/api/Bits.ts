import type { Creds, HelixBroadcaster, HelixUser, Paginated, PaginationOpts, Result } from "../types/Generic";

type BitsLeaderboardEntry = HelixUser & {
    rank: number;
    score: number;
};

type GetLeaderboardOpts = {
    count?: number;
    period?: "day" | "week" | "month" | "year" | "all";
    started_at?: string;
    user_id?: string;
};

const getLeaderboard = async (creds: Creds, opts?: GetLeaderboardOpts): Promise<Result<{ data: BitsLeaderboardEntry[]; date_range: { started_at: string; ended_at: string }; total: number }>> => {
    const params = new URLSearchParams();
    if (opts?.count) params.append("count", opts.count.toString());
    if (opts?.period) params.append("period", opts.period);
    if (opts?.started_at) params.append("started_at", opts.started_at);
    if (opts?.user_id) params.append("user_id", opts.user_id);

    const response = await fetch(`https://api.twitch.tv/helix/bits/leaderboard?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch bits leaderboard: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: BitsLeaderboardEntry[]; date_range: { started_at: string; ended_at: string }; total: number };
    return { is_success: true, data };
};

type CheermoteTier = {
    min_bits: number;
    id: string;
    color: string;
    images: {
        dark: { animated: Record<string, string>; static: Record<string, string> };
        light: { animated: Record<string, string>; static: Record<string, string> };
    };
    can_cheer: boolean;
    show_in_bits_card: boolean;
};

type Cheermote = {
    prefix: string;
    tiers: CheermoteTier[];
    type: "global_first_party" | "global_third_party" | "channel_custom" | "display_only" | "sponsored";
    order: number;
    last_updated: string;
    is_charitable: boolean;
};

const getCheermotes = async (creds: Creds, broadcaster_id?: string): Promise<Result<Cheermote[]>> => {
    const params = new URLSearchParams();
    if (broadcaster_id) params.append("broadcaster_id", broadcaster_id);

    const response = await fetch(`https://api.twitch.tv/helix/bits/cheermotes?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch cheermotes: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: Cheermote[] };
    return { is_success: true, data: data.data };
};

type ExtensionTransaction = HelixBroadcaster & HelixUser & {
    id: string;
    timestamp: string;
    product_type: "BITS_IN_EXTENSION";
    product_data: {
        domain: string;
        sku: string;
        cost: { amount: number; type: string };
        inDevelopment: boolean;
        displayName: string;
        expiration: string;
        broadcast: boolean;
    };
};

type GetExtensionTransactionsOpts = PaginationOpts & {
    extension_id: string;
    id?: string[];
};

const getExtensionTransactions = async (creds: Creds, opts: GetExtensionTransactionsOpts): Promise<Result<Paginated<ExtensionTransaction>>> => {
    const params = new URLSearchParams({ extension_id: opts.extension_id });
    if (opts.id) opts.id.forEach((id) => params.append("id", id));
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);

    const response = await fetch(`https://api.twitch.tv/helix/extensions/transactions?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch extension transactions: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<ExtensionTransaction>;
    return { is_success: true, data };
};

export default {
    getLeaderboard,
    getCheermotes,
    getExtensionTransactions
};
