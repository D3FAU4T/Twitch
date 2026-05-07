import type { clientCredentialGrantFlowError, ClientCredentialsGrantFlow } from "../types/Auth";
import { type Scopes } from "../types/Scopes";

const clientCredentialGrantFlow = async (clientId: string, clientSecret: string) => {
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

const validate = async (accessToken: string) => {
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        console.error(`Failed to validate access token: ${response.status} ${response.statusText}`);
        console.error(await response.text());
    }

    return await response.json() as {
        client_id: string;
        expires_in: number;
        scopes: Scopes[];
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

export default { clientCredentialGrantFlow, validate, revoke };