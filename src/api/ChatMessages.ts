import type { Creds } from "../types/Generic";

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

const send = async (options: Creds, params: Omit<SendMessageParams, "broadcaster_id" | "sender_id">  & { broadcaster_id: string; sender_id: string }): Promise<SendMessageResponse> => {
    const response = await fetch("https://api.twitch.tv/helix/chat/messages", {
        method: "POST",
        headers: {
            "Client-Id": options.clientId,
            "Authorization": `Bearer ${options.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send chat message: ${response.status} ${response.statusText} - ${error}`);
    }

    const data = await response.json() as { data: SendMessageResponse[] };
    const result = data.data[0];

    if (!result?.message_id)
        throw new Error("No message_id in response");

    return result;
};

export default { send };
