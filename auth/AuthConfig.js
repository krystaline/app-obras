export const msalConfig = {
    CLIENT_ID: '7562f532-b3df-4051-841b-a5c6bbf51300',
    TENANT_ID: 'd0fbdbb8-b41b-4c4a-af4a-1ef369dcccaa',
    REDIRECT_URI: 'appobras://redirect',
    AUTHORITY: 'https://login.microsoftonline.com/d0fbdbb8-b41b-4c4a-af4a-1ef369dcccaa',
    discovery: {
        authorizationEndpoint: `https://login.microsoftonline.com/d0fbdbb8-b41b-4c4a-af4a-1ef369dcccaa/oauth2/v2.0/authorize`,
        tokenEndpoint: `https://login.microsoftonline.com/d0fbdbb8-b41b-4c4a-af4a-1ef369dcccaa/oauth2/v2.0/token`,
    },
    cache: {
        cacheLocation: 'localStorage',
    },
    scopes: ['User.Read', 'profile', 'openid', 'email'],
};

