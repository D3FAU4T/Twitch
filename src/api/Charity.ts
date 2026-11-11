import type { Creds, HelixBroadcaster, HelixUser, Paginated, PaginationOpts, Result } from "../types/Generic";

type CharityAmount = {
    value: number;
    decimal_places: number;
    currency: string;
};

type CharityCampaign = HelixBroadcaster & {
    id: string;
    charity_name: string;
    charity_description: string;
    charity_logo: string;
    charity_website: string;
    current_amount: CharityAmount;
    target_amount: CharityAmount | null;
};

const getCampaign = async (creds: Creds, broadcaster_id: string): Promise<Result<CharityCampaign>> => {
    const response = await fetch(`https://api.twitch.tv/helix/charity/campaigns?broadcaster_id=${broadcaster_id}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch charity campaign: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as { data: CharityCampaign[] };
    if (!data.data[0])
        return { is_success: false, error: "No charity campaign returned" };

    return { is_success: true, data: data.data[0] };
};

type CharityDonation = HelixUser & {
    id: string;
    campaign_id: string;
    amount: CharityAmount;
};

type GetDonationsOpts = PaginationOpts & {
    broadcaster_id: string;
};

const getDonations = async (creds: Creds, opts: GetDonationsOpts): Promise<Result<Paginated<CharityDonation>>> => {
    const params = new URLSearchParams({ broadcaster_id: opts.broadcaster_id });
    if (opts.first) params.append("first", opts.first.toString());
    if (opts.after) params.append("after", opts.after);

    const response = await fetch(`https://api.twitch.tv/helix/charity/donations?${params.toString()}`, {
        headers: {
            "Client-Id": creds.clientId,
            "Authorization": `Bearer ${creds.accessToken}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        return {
            is_success: false,
            error: `Failed to fetch charity donations: ${response.status} ${response.statusText} - ${error}`
        };
    }

    const data = await response.json() as Paginated<CharityDonation>;
    return { is_success: true, data };
};

export default {
    getCampaign,
    getDonations
};
