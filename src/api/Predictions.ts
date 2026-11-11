import type { Creds, HelixBroadcaster, HelixUser, Paginated, PaginationOpts, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/predictions";

type Predictor = HelixUser & {
    channel_points_used: number;
    channel_points_won: number | null;
};

type PredictionOutcome = {
    id: string;
    title: string;
    users: number;
    channel_points: number;
    color: string;
    top_predictors: Predictor[] | null;
};

type Prediction = HelixBroadcaster & {
    id: string;
    title: string;
    winning_outcome_id: string | null;
    outcomes: PredictionOutcome[];
    prediction_window: number;
    status: "ACTIVE" | "RESOLVED" | "CANCELED" | "LOCKED";
    created_at: string;
    ended_at: string | null;
    locked_at: string | null;
};

type GetPredictionsOpts = PaginationOpts & {
    broadcaster_id: string;
    id?: string[];
};

const get = async (creds: Creds, opts: GetPredictionsOpts): Promise<Result<Paginated<Prediction>>> => {
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
            error: `Failed to fetch predictions: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<Prediction>;
    return { is_success: true, data };
};

type CreatePredictionOpts = Pick<Prediction, "broadcaster_id" | "title" | "prediction_window"> & {
    outcomes: { title: string }[];
};

const create = async (creds: Creds, opts: CreatePredictionOpts): Promise<Result<Prediction>> => {
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
            error: `Failed to create prediction: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: Prediction[] };
    if (!data.data[0])
        return { is_success: false, error: "No prediction returned" };

    return { is_success: true, data: data.data[0] };
};

type EndPredictionOpts = Pick<Prediction, "broadcaster_id" | "id"> & {
    status: "RESOLVED" | "CANCELED" | "LOCKED";
    winning_outcome_id?: string;
};

const end = async (creds: Creds, opts: EndPredictionOpts): Promise<Result<Prediction>> => {
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
            error: `Failed to end prediction: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: Prediction[] };
    if (!data.data[0])
        return { is_success: false, error: "No prediction returned" };

    return { is_success: true, data: data.data[0] };
};

export default {
    get,
    create,
    end
};
