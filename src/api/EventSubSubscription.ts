import type { EventSubSubscriptionResponse } from "../types/EventSub";
import type { Creds } from "../types/Generic";
import type { Subscription } from "../types/Subscriptions";

const url = "https://api.twitch.tv/helix/eventsub/subscriptions";

const create = async (options: Creds, data: Subscription) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Client-Id': options.clientId,
            'Authorization': `Bearer ${options.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`Failed to create subscription: ${response.status} ${response.statusText}; Refer to https://dev.twitch.tv/docs/api/reference/#create-eventsub-subscription`);
    }

    return await response.json() as EventSubSubscriptionResponse;
}

const del = async (options: Creds, subscriptionId: string) => {
    const response = await fetch(url + `?id=${subscriptionId}`, {
        method: 'DELETE',
        headers: {
            'Client-Id': options.clientId,
            'Authorization': `Bearer ${options.accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to delete subscription: ${response.status} ${response.statusText}; Refer to https://dev.twitch.tv/docs/api/reference/#delete-eventsub-subscription`);
    }
}

const get = async (options: Creds) => {
    const response = await fetch(url, {
        headers: {
            'Client-Id': options.clientId,
            'Authorization': `Bearer ${options.accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to get subscriptions: ${response.status} ${response.statusText}; Refer to https://dev.twitch.tv/docs/api/reference/#get-eventsub-subscriptions`);
    }

    return await response.json() as EventSubSubscriptionResponse & { pagination: {} };
}

export default {
    get,
    create,
    del
}