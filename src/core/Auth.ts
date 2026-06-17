import type { 
    AuthorizationCodeGrantFlow,
    clientCredentialGrantFlowError, 
    ClientCredentialsGrantFlow,
} from "../types/Auth";

import type { Scopes } from "../types/Scopes";

const clientCredentialGrantFlow = async (
    { clientId, clientSecret }: {clientId: string; clientSecret: string }
) => {
    const token = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials'
        })
    });

    return await token.json() as ClientCredentialsGrantFlow | clientCredentialGrantFlowError;
}

const authorizationCodeGrantFlow = async (
    { clientId, clientSecret, code, redirectUri }: {clientId: string; clientSecret: string; code: string; redirectUri: string }
) => {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
        })
    });

    return await response.json() as AuthorizationCodeGrantFlow | clientCredentialGrantFlowError;
}

const refreshTokenFlow = async (
    { clientId, clientSecret, refreshToken }: {clientId: string; clientSecret: string; refreshToken: string }
) => {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        })
    });

    return await response.json() as AuthorizationCodeGrantFlow | clientCredentialGrantFlowError;
}

const validate = async (accessToken: string) => {
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
        headers: {
            'Authorization': `OAuth ${accessToken}` 
        }
    });

    if (!response.ok) {
        console.error(`Failed to validate access token: ${response.status} ${response.statusText}`);
        console.error(await response.text());
        return null;
    }

    return await response.json() as {
        client_id: string;
        expires_in: number;
        scopes: Scopes[];
        login?: string; 
        user_id?: string;
    }
}

const revoke = async (clientId: string, accessToken: string) => {
    const response = await fetch('https://id.twitch.tv/oauth2/revoke', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: clientId,
            token: accessToken
        })
    });

    if (!response.ok) {
        const err = await response.json() as {
            status: number;
            message: string;
        }

        throw new Error(`Failed to revoke access token: ${err.status} ${err.message}`);
    }
}

export default { 
    clientCredentialGrantFlow, 
    authorizationCodeGrantFlow, 
    refreshTokenFlow, 
    validate, 
    revoke 
};