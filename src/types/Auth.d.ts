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

export interface AuthorizationCodeGrantFlow {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: "bearer"
}