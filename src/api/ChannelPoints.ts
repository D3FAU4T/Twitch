import type { Creds, HelixBroadcaster, HelixUser, Paginated, PaginationOpts, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/channel_points/custom_rewards";

type CustomReward = HelixBroadcaster & {
    id: string;
    title: string;
    prompt: string;
    cost: number;
    image: { url_1x: string; url_2x: string; url_4x: string } | null;
    default_image: { url_1x: string; url_2x: string; url_4x: string };
    background_color: string;
    is_enabled: boolean;
    is_user_input_required: boolean;
    max_per_stream_setting: { is_enabled: boolean; max_per_stream: number };
    max_per_user_per_stream_setting: { is_enabled: boolean; max_per_user_per_stream: number };
    global_cooldown_setting: { is_enabled: boolean; global_cooldown_seconds: number };
    is_paused: boolean;
    is_in_stock: boolean;
    should_redemptions_skip_request_queue: boolean;
    redemptions_redeemed_current_stream: number | null;
    cooldown_expires_at: string | null;
};

type GetCustomRewardsOpts = {
    broadcaster_id: string;
    id?: string[];
    only_manageable_rewards?: boolean;
};

const getCustomRewards = async (creds: Creds, opts: GetCustomRewardsOpts): Promise<Result<CustomReward[]>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id });
    if (opts.id) opts.id.forEach((id) => params.append("id", id));
    if (opts.only_manageable_rewards !== undefined) params.append("only_manageable_rewards", opts.only_manageable_rewards.toString());

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
            error: `Failed to fetch custom rewards: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: CustomReward[] };
    return { is_success: true, data: data.data };
};

type CreateCustomRewardOpts = {
    broadcaster_id: string;
    title: string;
    cost: number;
    prompt?: string;
    is_enabled?: boolean;
    background_color?: string;
    is_user_input_required?: boolean;
    is_max_per_stream_enabled?: boolean;
    max_per_stream?: number;
    is_max_per_user_per_stream_enabled?: boolean;
    max_per_user_per_stream?: number;
    is_global_cooldown_enabled?: boolean;
    global_cooldown_seconds?: number;
    should_redemptions_skip_request_queue?: boolean;
};

const createCustomReward = async (creds: Creds, opts: CreateCustomRewardOpts): Promise<Result<CustomReward>> => {
    const { broadcaster_id, ...body } = opts;
    const response = await fetch(`${url}?broadcaster_id=${broadcaster_id}`, {
        method: "POST",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to create custom reward: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: CustomReward[] };
    if (!data.data[0])
        return { is_success: false, error: "No reward returned" };

    return { is_success: true, data: data.data[0] };
};

const updateCustomReward = async (
    creds: Creds,
    opts: { broadcaster_id: string; id: string } & Partial<Omit<CreateCustomRewardOpts, "broadcaster_id">> & { is_paused?: boolean }
): Promise<Result<CustomReward>> => {
    const { broadcaster_id, id, ...body } = opts;
    const response = await fetch(`${url}?broadcaster_id=${broadcaster_id}&id=${id}`, {
        method: "PATCH",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to update custom reward: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: CustomReward[] };
    if (!data.data[0])
        return { is_success: false, error: "No reward returned" };

    return { is_success: true, data: data.data[0] };
};

const deleteCustomReward = async (creds: Creds, opts: { broadcaster_id: string; id: string }): Promise<Result<null>> => {
    const response = await fetch(`${url}?broadcaster_id=${opts.broadcaster_id}&id=${opts.id}`, {
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
            error: `Failed to delete custom reward: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
};

type RewardRedemption = HelixBroadcaster & HelixUser & {
    id: string;
    user_input: string;
    status: "UNFULFILLED" | "FULFILLED" | "CANCELED";
    redeemed_at: string;
    reward: {
        id: string;
        title: string;
        prompt: string;
        cost: number;
    };
};

type GetRedemptionsOpts = PaginationOpts & {
    broadcaster_id: string;
    reward_id: string;
    status?: "UNFULFILLED" | "FULFILLED" | "CANCELED";
    id?: string[];
    sort?: "OLDEST" | "NEWEST";
};

const getRedemptions = async (creds: Creds, opts: GetRedemptionsOpts): Promise<Result<Paginated<RewardRedemption>>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id, reward_id: opts.reward_id });
    if (opts.status) params.append("status", opts.status);
    if (opts.id) opts.id.forEach((id) => params.append("id", id));
    if (opts.sort) params.append("sort", opts.sort);
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);

    const response = await fetch(`${url}/redemptions?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch redemptions: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<RewardRedemption>;
    return { is_success: true, data };
};

type UpdateRedemptionStatusOpts = Pick<GetRedemptionsOpts, "broadcaster_id" | "reward_id"> & {
    id: string[];
    status: "FULFILLED" | "CANCELED";
};

const updateRedemptionStatus = async (creds: Creds, opts: UpdateRedemptionStatusOpts): Promise<Result<RewardRedemption[]>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id, reward_id: opts.reward_id });
    opts.id.forEach((id) => params.append("id", id));

    const response = await fetch(`${url}/redemptions?${params.toString()}`, {
        method: "PATCH",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: opts.status })
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to update redemption status: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: RewardRedemption[] };
    return { is_success: true, data: data.data };
};

export default {
    getCustomRewards,
    createCustomReward,
    updateCustomReward,
    deleteCustomReward,
    getRedemptions,
    updateRedemptionStatus
};
