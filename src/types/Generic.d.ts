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