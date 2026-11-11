import type { Creds, Paginated, PaginationOpts, Result } from "../types/Generic";

type DropEntitlement = {
    id: string;
    benefit_id: string;
    timestamp: string;
    user_id: string;
    game_id: string;
    fulfillment_status: "CLAIMED" | "FULFILLED";
    updated_at: string;
};

type GetDropsEntitlementsOpts = PaginationOpts & {
    id?: string;
    user_id?: string;
    game_id?: string;
    fulfillment_status?: "CLAIMED" | "FULFILLED";
};

const getDropsEntitlements = async (creds: Creds, opts?: GetDropsEntitlementsOpts): Promise<Result<Paginated<DropEntitlement>>> => {
    const params = new URLSearchParams();
    if (opts?.id) params.append("id", opts.id);
    if (opts?.user_id) params.append("user_id", opts.user_id);
    if (opts?.game_id) params.append("game_id", opts.game_id);
    if (opts?.fulfillment_status) params.append("fulfillment_status", opts.fulfillment_status);
    if (opts?.after) params.append("after", opts.after);
    if (opts?.first) params.append("first", opts.first.toString());

    const response = await fetch(`https://api.twitch.tv/helix/entitlements/drops?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch drop entitlements: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<DropEntitlement>;
    return { is_success: true, data };
};

type UpdateDropsEntitlementsOpts = {
    entitlement_ids?: string[];
    fulfillment_status?: "CLAIMED" | "FULFILLED";
};

type DropUpdateStatus = {
    status: "INVALID_ID" | "NOT_FOUND" | "SUCCESS" | "UNAUTHORIZED" | "UPDATE_FAILED";
    entitlement_ids: string[];
};

const updateDropsEntitlements = async (creds: Creds, opts: UpdateDropsEntitlementsOpts): Promise<Result<DropUpdateStatus[]>> => {
    const response = await fetch("https://api.twitch.tv/helix/entitlements/drops", {
        method: "PATCH",
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
            error: `Failed to update drop entitlements: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: DropUpdateStatus[] };
    return { is_success: true, data: data.data };
};

export default {
    getDropsEntitlements,
    updateDropsEntitlements
};
