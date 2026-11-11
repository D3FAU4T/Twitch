import type { Creds, Paginated, PaginationOpts, Result } from "../types/Generic";

type HypeTrainEvent = {
    id: string;
    event_type: string;
    event_timestamp: string;
    version: string;
    event_data: {
        id: string;
        broadcaster_id: string;
        cooldown_end_time: string;
        expires_at: string;
        goal: number;
        level: number;
        started_at: string;
        top_contributions: { total: number; type: "BITS" | "SUBS"; user: string }[];
        total: number;
        last_contribution: { total: number; type: "BITS" | "SUBS"; user: string };
    };
};

type GetHypeTrainOpts = PaginationOpts & {
    broadcaster_id: string;
};

const get = async (creds: Creds, opts: GetHypeTrainOpts): Promise<Result<Paginated<HypeTrainEvent>>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id });
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);

    const response = await fetch(`https://api.twitch.tv/helix/hypetrain/events?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch hype train events: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<HypeTrainEvent>;
    return { is_success: true, data };
};

export default {
    get
};
