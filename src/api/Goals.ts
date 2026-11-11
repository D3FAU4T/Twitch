import type { Creds, HelixBroadcaster, Result } from "../types/Generic";

type CreatorGoal = HelixBroadcaster & {
    id: string;
    type: "follow" | "subscription" | "subscription_count" | "new_subscription" | "new_subscription_count";
    description: string;
    current_amount: number;
    target_amount: number;
    created_at: string;
};

const get = async (creds: Creds, broadcaster_id: string): Promise<Result<CreatorGoal[]>> => {
    const response = await fetch(`https://api.twitch.tv/helix/goals?broadcaster_id=${broadcaster_id}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch creator goals: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: CreatorGoal[] };
    return { is_success: true, data: data.data };
};

export default {
    get
};
