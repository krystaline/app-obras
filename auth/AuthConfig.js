
export const msalConfig = {
    auth: {
        clientId: '7562f532-b3df-4051-841b-a5c6bbf51300',
        authority: 'https://login.microsoftonline.com/d0fbdbb8-b41b-4c4a-af4a-1ef369dcccaa',
    },
    cache: {
        cacheLocation: 'localStorage',
    },
};

export const loginRequest = {
    scopes: ['User.Read', 'profile', 'openid', 'email'],
};