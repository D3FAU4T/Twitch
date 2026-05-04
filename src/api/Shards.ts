import type { Creds } from "../types/Generic";
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

const get = async (options: getParams) => {
    const response = await fetch(`${url}?conduit_id=${options.conduit_id}`, {
        headers: {
            'Client-Id': options.clientId,
            'Authorization': `Bearer ${options.accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}; Refer to https://dev.twitch.tv/docs/api/reference/#get-conduit-shards`);
    }

    return await response.json() as ShardResponse;
}

const update = async (options: updateParams) => {
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

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}; Refer to https://dev.twitch.tv/docs/api/reference/#update-conduit-shards`);
    }

    return await response.json() as ShardUpdateResponse;
}

export default {
    get,
    update
}