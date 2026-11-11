import type { Creds, HelixBroadcaster, HelixUser, Result } from "../types/Generic";

type TeamUser = HelixUser;

type ChannelTeam = HelixBroadcaster & {
    id: string;
    background_image_url: string | null;
    banner: string | null;
    created_at: string;
    updated_at: string;
    info: string;
    thumbnail_url: string;
    team_name: string;
    team_display_name: string;
};

type Team = ChannelTeam & {
    users: TeamUser[];
};

const getChannelTeams = async (creds: Creds, broadcaster_id: string): Promise<Result<ChannelTeam[]>> => {
    const response = await fetch(`https://api.twitch.tv/helix/teams/channel?broadcaster_id=${broadcaster_id}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch channel teams: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: ChannelTeam[] };
    return { is_success: true, data: data.data };
};

const getTeam = async (creds: Creds, opts: { id?: string; name?: string }): Promise<Result<Team>> => {
    const params = new URLSearchParams();
    if (opts.id) params.append("id", opts.id);
    if (opts.name) params.append("name", opts.name);

    const response = await fetch(`https://api.twitch.tv/helix/teams?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch team: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: Team[] };
    if (!data.data[0])
        return { is_success: false, error: "No team returned" };

    return { is_success: true, data: data.data[0] };
};

export default {
    getChannelTeams,
    getTeam
};
