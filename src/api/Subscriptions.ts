import type { Creds, HelixBroadcaster, HelixUser, PaginationOpts, Result, TotalPaginated } from "../types/Generic";

const url = "https://api.twitch.tv/helix/subscriptions";

type BroadcasterSubscription = HelixBroadcaster & HelixUser & {
    gifter_id: string;
    gifter_login: string;
    gifter_name: string;
    is_gift: boolean;
    tier: string;
    plan_name: string;
};

type GetBroadcasterSubscriptionsOpts = PaginationOpts & {
    broadcaster_id: string;
    user_id?: string[];
};

const getBroadcasterSubscriptions = async (
    creds: Creds,
    opts: GetBroadcasterSubscriptionsOpts
): Promise<Result<TotalPaginated<BroadcasterSubscription> & { points: number }>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id });
    if (opts.user_id) opts.user_id.forEach((id) => params.append("user_id", id));
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);
    if (opts.before) params.append("before", opts.before);

    const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch subscriptions: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as TotalPaginated<BroadcasterSubscription> & { points: number };
    return { is_success: true, data };
};

type UserSubscription = HelixBroadcaster & Pick<BroadcasterSubscription, "is_gift" | "tier"> & Partial<Pick<BroadcasterSubscription, "gifter_id" | "gifter_login" | "gifter_name">>;

const checkUserSubscription = async (
    creds: Creds,
    opts: { broadcaster_id: string; user_id: string }
): Promise<Result<UserSubscription>> => {
    const params = new URLSearchParams({
        broadcaster_id: opts.broadcaster_id,
        user_id: opts.user_id
    });

    const response = await fetch(`${url}/user?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to check user subscription: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: UserSubscription[] };
    if (!data.data[0])
        return { is_success: false, error: "No subscription data returned" };

    return { is_success: true, data: data.data[0] };
};

export default {
    getBroadcasterSubscriptions,
    checkUserSubscription
};
