import type { Creds, Result } from "../types/Generic";

interface SendMessageParams {
    broadcaster_id: string;
    sender_id: string;
    message: string;
    reply_parent_message_id?: string;
}

interface SendMessageResponse {
    message_id: string;
    is_sent: boolean;
}

const send = async (creds: Creds, params: Omit<SendMessageParams, "broadcaster_id" | "sender_id">  & { broadcaster_id: string; sender_id: string }): Promise<Result<SendMessageResponse>> => {
    const response = await fetch("https://api.twitch.tv/helix/chat/messages", {
        method: "POST",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to send chat message: ${response.status} ${response.statusText} - ${error}`
        }
    }

    const data = await response.json() as { data: SendMessageResponse[] };
    const result = data.data[0];

    if (!result?.message_id)
        throw new Error("No message_id in response");

    return { is_success: true, data: result };
};

export type announceParams = {
    broadcaster_id: string;
    moderator_id: string;
    message: string;
    for_source_only?: boolean;
    color?: "blue" | "green" | "orange" | "purple" | "primary";
}

const announce = async (creds: Creds, params: announceParams): Promise<Result<null>> => {
    const response = await fetch("https://api.twitch.tv/helix/chat/announcements", {
        method: "POST",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to send chat announcement: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
}


export default { send, announce };