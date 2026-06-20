import type { Creds, Result } from "../types/Generic";
import type { ShardResponse, ShardUpdateResponse } from "../types/Shards";

const url = "https://api.twitch.tv/helix/eventsub/conduits/shards";

type getParams = Creds & {
    conduit_id: string;
    status?: string;
    after?: string;
}

type updateParams = Creds & {
    conduit_id: string;
    shards: Pick<ShardResponse['data'][number], "id" | "transport">[]
}

const get = async (options: getParams): Promise<Result<ShardResponse>> => {
    try {
        const response = await fetch(`${url}?conduit_id=${options.conduit_id}`, {
            headers: {
                'Client-Id': options.clientId,
                'Authorization': `Bearer ${options.accessToken}`
            }
        });

        if (!response.ok)
            return {
                is_success: false,
                error: `Failed to get conduit shards: ${response.status} ${response.statusText}; Refer to https://dev.twitch.tv/docs/api/reference/#get-conduit-shards`
            };

        const data = await response.json() as ShardResponse;
        return { is_success: true, data };
    }
    
    catch (e: unknown) {
        return { is_success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

const update = async (options: updateParams): Promise<Result<ShardUpdateResponse>> => {
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Client-Id': options.clientId,
                'Authorization': `Bearer ${options.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conduit_id: options.conduit_id,
                shards: options.shards
            })
        });

        if (!response.ok)
            return {
                is_success: false,
                error: `Failed to update conduit shards: ${response.status} ${response.statusText}; Refer to https://dev.twitch.tv/docs/api/reference/#update-conduit-shards`
            };

        const data = await response.json() as ShardUpdateResponse;
        return { is_success: true, data };
    }
    
    catch (e: unknown) {
        return { is_success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export default {
    get,
    update
}