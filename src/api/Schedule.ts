import type { Creds, HelixBroadcaster, Paginated, PaginationOpts, Result } from "../types/Generic";

const url = "https://api.twitch.tv/helix/schedule";

type ScheduleSegment = {
    id: string;
    start_time: string;
    end_time: string;
    title: string;
    canceled_until: string | null;
    category: { id: string; name: string } | null;
    is_recurring: boolean;
};

type ChannelSchedule = HelixBroadcaster & {
    segments: ScheduleSegment[] | null;
    vacation: { start_time: string; end_time: string } | null;
};

type GetScheduleOpts = PaginationOpts & {
    broadcaster_id: string;
    id?: string[];
    start_time?: string;
};

const getSchedule = async (creds: Creds, opts: GetScheduleOpts): Promise<Result<Paginated<ChannelSchedule>>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id });
    if (opts.id) opts.id.forEach((id) => params.append("id", id));
    if (opts.start_time) params.append("start_time", opts.start_time);
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
            error: `Failed to fetch schedule: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<ChannelSchedule>;
    return { is_success: true, data };
};

const getCalendar = async (creds: Creds, broadcaster_id: string): Promise<Result<string>> => {
    const response = await fetch(`${url}/icalendar?broadcaster_id=${broadcaster_id}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch calendar: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.text();
    return { is_success: true, data };
};

type UpdateSettingsOpts = {
    broadcaster_id: string;
    is_vacation_enabled?: boolean;
    vacation_start_time?: string;
    vacation_end_time?: string;
    timezone?: string;
};

const updateSettings = async (creds: Creds, opts: UpdateSettingsOpts): Promise<Result<null>> => {
    const { broadcaster_id, ...params } = opts;
    const query = new URLSearchParams({ broadcaster_id });
    if (params.is_vacation_enabled !== undefined) query.append("is_vacation_enabled", params.is_vacation_enabled.toString());
    if (params.vacation_start_time) query.append("vacation_start_time", params.vacation_start_time);
    if (params.vacation_end_time) query.append("vacation_end_time", params.vacation_end_time);
    if (params.timezone) query.append("timezone", params.timezone);

    const response = await fetch(`${url}/settings?${query.toString()}`, {
        method: "PATCH",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to update schedule settings: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
};

type CreateSegmentOpts = {
    broadcaster_id: string;
    start_time: string;
    timezone: string;
    is_recurring?: boolean;
    duration?: string;
    category_id?: string;
    title?: string;
};

const createSegment = async (creds: Creds, opts: CreateSegmentOpts): Promise<Result<ScheduleSegment>> => {
    const { broadcaster_id, ...body } = opts;
    const response = await fetch(`${url}/segment?broadcaster_id=${broadcaster_id}`, {
        method: "POST",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to create schedule segment: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: ChannelSchedule };
    const segment = data.data.segments?.[0];
    if (!segment)
        return { is_success: false, error: "No schedule segment returned" };

    return { is_success: true, data: segment };
};

type UpdateSegmentOpts = {
    broadcaster_id: string;
    id: string;
    is_canceled?: boolean;
} & Partial<Omit<CreateSegmentOpts, "broadcaster_id" | "is_recurring">>;

const updateSegment = async (creds: Creds, opts: UpdateSegmentOpts): Promise<Result<ScheduleSegment>> => {
    const { broadcaster_id, id, ...body } = opts;
    const response = await fetch(`${url}/segment?broadcaster_id=${broadcaster_id}&id=${id}`, {
        method: "PATCH",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to update schedule segment: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: ChannelSchedule };
    const segment = data.data.segments?.[0];
    if (!segment)
        return { is_success: false, error: "No schedule segment returned" };

    return { is_success: true, data: segment };
};

const deleteSegment = async (creds: Creds, opts: { broadcaster_id: string; id: string }): Promise<Result<null>> => {
    const response = await fetch(`${url}/segment?broadcaster_id=${opts.broadcaster_id}&id=${opts.id}`, {
        method: "DELETE",
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to delete schedule segment: ${response.status} ${response.statusText} - ${error}`
        };
    }

    return { is_success: true, data: null };
};

export default {
    getSchedule,
    getCalendar,
    updateSettings,
    createSegment,
    updateSegment,
    deleteSegment
};
