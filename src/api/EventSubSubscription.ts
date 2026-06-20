import type { EventSubSubscriptionResponse } from "../types/EventSub";
import type { Creds, Result } from "../types/Generic";
import type { Subscription } from "../types/Subscriptions";

const url = "https://api.twitch.tv/helix/eventsub/subscriptions";

const create = async (options: Creds, data: Subscription): Promise<Result<EventSubSubscriptionResponse>> => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Client-Id': options.clientId,
                'Authorization': `Bearer ${options.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok)
            return {
                is_success: false,
                error: `Failed to create subscription: ${response.status} ${response.statusText}; Refer to https://dev.twitch.tv/docs/api/reference/#create-eventsub-subscription`
            };

        const resData = await response.json() as EventSubSubscriptionResponse;
        return { is_success: true, data: resData };
    }
    
    catch (e: unknown) {
        return { is_success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

const del = async (options: Creds, subscriptionId: string): Promise<Result<void>> => {
    try {
        const response = await fetch(url + `?id=${subscriptionId}`, {
            method: 'DELETE',
            headers: {
                'Client-Id': options.clientId,
                'Authorization': `Bearer ${options.accessToken}`
            }
        });

        if (!response.ok)
            return {
                is_success: false,
                error: `Failed to delete subscription: ${response.status} ${response.statusText}; Refer to https://dev.twitch.tv/docs/api/reference/#delete-eventsub-subscription`
            };

        return { is_success: true, data: undefined };
    }
    
    catch (e: unknown) {
        return { is_success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

const get = async (options: Creds): Promise<Result<EventSubSubscriptionResponse & { pagination: { cursor?: string } }>> => {
    try {
        const response = await fetch(url, {
            headers: {
                'Client-Id': options.clientId,
                'Authorization': `Bearer ${options.accessToken}`
            }
        });

        if (!response.ok)
            return {
                is_success: false,
                error: `Failed to get subscriptions: ${response.status} ${response.statusText}; Refer to https://dev.twitch.tv/docs/api/reference/#get-eventsub-subscriptions`
            };

        const resData = await response.json() as EventSubSubscriptionResponse & { pagination: { cursor?: string } };
        return { is_success: true, data: resData };
    }
    
    catch (e: unknown) {
        return { is_success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export default {
    get,
    create,
    del
}