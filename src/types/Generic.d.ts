export interface Creds {
    clientId: string;
    accessToken: string;
}

type SuccessResult<T> = {
    is_success: true;
    data: T;
}

type ErrorResult<T> = {
    is_success: false;
    error: T;
}

export type Result<T, E = unknown> = SuccessResult<T> | ErrorResult<E>;

export type Paginated<T> = {
    data: T[];
    pagination?: { cursor?: string };
};

export type TotalPaginated<T> = Paginated<T> & {
    total: number;
};

export interface PaginationOpts {
    first?: number;
    after?: string;
    before?: string;
}

export interface HelixUser {
    user_id: string;
    user_login: string;
    user_name: string;
}

export interface HelixBroadcaster {
    broadcaster_id: string;
    broadcaster_login: string;
    broadcaster_name: string;
}

export interface HelixModerator {
    moderator_id: string;
    moderator_login: string;
    moderator_name: string;
}
