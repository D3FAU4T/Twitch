import type { Creds, Result } from "../types/Generic";

interface Conduit {
    id: string;
    shard_count: number
}

const url = "https://api.twitch.tv/helix/eventsub/conduits";

const get = async (options: Creds): Promise<Result<Conduit[]>> => {
    try {
        const response = await fetch(url, {
            headers: {
                'Client-Id': options.clientId,
                'Authorization': `Bearer ${options.accessToken}`
            }
        });

        if (response.status === 401)
            return {
                is_success: false,
                error: "401 Unauthenticated: Authorization header required with an app access token."
            };

        if (!response.ok)
            return {
                is_success: false,
                error: `${response.status} ${response.statusText}`
            };

        const data = (await response.json() as { data: Conduit[] }).data;
        return { is_success: true, data };
    }

    catch (e: unknown) {
        return { is_success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

const create = async (options: Creds & { shard_count: number }): Promise<Result<Conduit[]>> => {
    try {
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
            return {
                is_success: false,
                error: "401 Unauthenticated: Authorization header required with an app access token."
            };

        else if (response.status === 400)
            return {
                is_success: false,
                error: "400 Bad Request: Invalid shard count"
            };

        else if (response.status === 429)
            return {
                is_success: false,
                error: "429 Too Many Requests: Conduit limit reached"
            };

        else if (response.status === 200) {
            const data = (await response.json() as { data: Conduit[] }).data;
            return { is_success: true, data };
        }

        else return {
            is_success: false,
            error: `${response.status} ${response.statusText}`
        };
    }

    catch (e: unknown) {
        return { is_success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

const update = async (options: Creds & { conduit_id: string, shard_count: number }): Promise<Result<Conduit[]>> => {
    try {
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
            return {
                is_success: false,
                error: "401 Unauthenticated: Authorization header required with an app access token."
            };

        else if (response.status === 400)
            return {
                is_success: false,
                error: "400 Bad Request: Invalid shard count; id query parameter is required"
            };

        else if (response.status === 404)
            return {
                is_success: false,
                error: "404 Not Found: Conduit not found"
            };

        else if (response.status === 200) {
            const data = (await response.json() as { data: Conduit[] }).data;
            return { is_success: true, data };
        }

        else return {
            is_success: false,
            error: `${response.status} ${response.statusText}`
        };
    }

    catch (e: unknown) {
        return { is_success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

const del = async (options: Creds & { conduit_id: string }): Promise<Result<void>> => {
    try {
        const response = await fetch(`${url}?id=${options.conduit_id}`, {
            method: 'DELETE',
            headers: {
                'Client-Id': options.clientId,
                'Authorization': `Bearer ${options.accessToken}`
            }
        });

        if (response.status === 401)
            return {
                is_success: false,
                error: "401 Unauthenticated: Authorization header required with an app access token."
            };

        else if (response.status === 400)
            return {
                is_success: false,
                error: "400 Bad Request: id query parameter is required"
            };

        else if (response.status === 404)
            return {
                is_success: false,
                error: "404 Not Found: Conduit not found; Conduit's owner must match the client ID in access token"
            };

        else if (response.status === 204)
            return { is_success: true, data: undefined };

        else return {
            is_success: false,
            error: `${response.status} ${response.statusText}`
        };
    }

    catch (e: unknown) {
        return { is_success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export default {
    get,
    create,
    update,
    del
};