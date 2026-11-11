import type { Creds, HelixBroadcaster, Paginated, PaginationOpts, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/polls";

type PollChoice = {
    id: string;
    title: string;
    votes: number;
    channel_points_votes: number;
    bits_votes: number;
};

type Poll = HelixBroadcaster & {
    id: string;
    title: string;
    choices: PollChoice[];
    bits_voting_enabled: boolean;
    bits_per_vote: number;
    channel_points_voting_enabled: boolean;
    channel_points_per_vote: number;
    status: "ACTIVE" | "COMPLETED" | "TERMINATED" | "ARCHIVED" | "MODERATED" | "INVALID";
    duration: number;
    started_at: string;
    ended_at: string | null;
};

type GetPollsOpts = PaginationOpts & {
    broadcaster_id: string;
    id?: string[];
};

const get = async (creds: Creds, opts: GetPollsOpts): Promise<Result<Paginated<Poll>>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id });
    if (opts.id) opts.id.forEach((id) => params.append("id", id));
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);

    const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch polls: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<Poll>;
    return { is_success: true, data };
};

type CreatePollOpts = Pick<Poll, "broadcaster_id" | "title" | "duration"> & {
    choices: { title: string }[];
    channel_points_voting_enabled?: boolean;
    channel_points_per_vote?: number;
};

const create = async (creds: Creds, opts: CreatePollOpts): Promise<Result<Poll>> => {
    const response = await fetch(url, {
        method: "POST",
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
            error: `Failed to create poll: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: Poll[] };
    if (!data.data[0])
        return { is_success: false, error: "No poll returned" };

    return { is_success: true, data: data.data[0] };
};

type EndPollOpts = Pick<Poll, "broadcaster_id" | "id"> & {
    status: "TERMINATED" | "ARCHIVED";
};

const end = async (creds: Creds, opts: EndPollOpts): Promise<Result<Poll>> => {
    const response = await fetch(url, {
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
            error: `Failed to end poll: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: Poll[] };
    if (!data.data[0])
        return { is_success: false, error: "No poll returned" };

    return { is_success: true, data: data.data[0] };
};

export default {
    get,
    create,
    end
};
