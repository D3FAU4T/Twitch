import type { Creds } from "../types/Generic";

interface Conduit {
    id: string;
    shard_count: number
}

const url = "https://api.twitch.tv/helix/eventsub/conduits";

const get = async (options: Creds) => {
    const response = await fetch(url, {
        headers: {
            'Client-Id': options.clientId,
            'Authorization': `Bearer ${options.accessToken}`
        }
    });

    if (response.status === 401) {
        throw new Error("401 Unauthenticated: Authorization header required with an app access token.");
    }

    return (await response.json() as { data: Conduit[] }).data;
}

const create = async (options: Creds & { shard_count: number }) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Client-Id': options.clientId,
            'Authorization': `Bearer ${options.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shard_count: options.shard_count })
    });

    if (response.status === 401)
        throw new Error("401 Unauthenticated: Authorization header required with an app access token.");

    else if (response.status === 400) {
        throw new RangeError(`400 Bad Request: Invalid shard count`);
    }

    else if (response.status === 429)
        throw new Error("429 Too Many Requests: Conduit limit reached");

    else if (response.status === 200)
        return (await response.json() as { data: Conduit[] }).data;

    else
        throw new Error(`${response.status} ${response.statusText}`);
}

const update = async (options: Creds & { conduit_id: string, shard_count: number }) => {
    const response = await fetch(`${url}?id=${options.conduit_id}`, {
        method: 'PATCH',
        headers: {
            'Client-Id': options.clientId,
            'Authorization': `Bearer ${options.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: options.conduit_id, shard_count: options.shard_count })
    });

    if (response.status === 401)
        throw new Error("401 Unauthenticated: Authorization header required with an app access token.");

    else if (response.status === 400)
        throw new RangeError("400 Bad Request: Invalid shard count; id query parameter is required");

    else if (response.status === 404)
        throw new Error("404 Not Found: Conduit not found");

    else if (response.status === 200)
        return (await response.json() as { data: Conduit[] }).data;

    else
        throw new Error(`${response.status} ${response.statusText}`);
}

const del = async (options: Creds & { conduit_id: string }) => {
    const response = await fetch(`${url}?id=${options.conduit_id}`, {
        method: 'DELETE',
        headers: {
            'Client-Id': options.clientId,
            'Authorization': `Bearer ${options.accessToken}`
        }
    });

    if (response.status === 401)
        throw new Error("401 Unauthenticated: Authorization header required with an app access token.");

    else if (response.status === 400)
        throw new RangeError("400 Bad Request: id query parameter is required");

    else if (response.status === 404)
        throw new Error("404 Not Found: Conduit not found; Conduit's owner must match the client ID in access token");

    else if (response.status === 204)
        return;

    else
        throw new Error(`${response.status} ${response.statusText}`);
}

export default {
    get,
    create,
    update,
    del
};