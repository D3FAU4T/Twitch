import type { Creds, Result } from "../types/Generic";

const send = async (creds: Creds, opts: { from_user_id: string; to_user_id: string; message: string }): Promise<Result<null>> => {
    const params = new URLSearchParams({
        from_user_id: opts.from_user_id,
        to_user_id: opts.to_user_id
    });

    const response = await fetch(`https://api.twitch.tv/helix/whispers?${params.toString()}`, {
        method: "POST",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: opts.message })
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to send whisper: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
};

export default {
    send
};
