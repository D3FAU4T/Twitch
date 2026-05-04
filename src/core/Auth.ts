import type { clientCredentialGrantFlowError, ClientCredentialsGrantFlow } from "../types/Auth";

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

export default { clientCredentialGrantFlow };