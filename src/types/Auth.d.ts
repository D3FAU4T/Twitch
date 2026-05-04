export interface ClientCredentialsGrantFlow {
    access_token: string;
    expires_in: number;
    token_type: "bearer";
}

export interface clientCredentialGrantFlowError {
    error: string;
    status: number;
    message: string;
}