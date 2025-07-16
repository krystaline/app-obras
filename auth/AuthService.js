// AuthService.js
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import {msalConfig} from "./AuthConfig";

// Configuración de Microsoft Azure AD

// Para desarrollo en Expo
WebBrowser.maybeCompleteAuthSession();

class AuthService {
    constructor() {
        this.userInfo = null;
        this.accessToken = null;
    }

    async login() {
        try {
            // Generar parámetros para PKCE
            const codeChallenge = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                Math.random().toString(36).substring(2, 15),
                { encoding: Crypto.CryptoEncoding.BASE64URL }
            );

            // Configurar la URL de autorización
            const authUrl = `https://login.microsoftonline.com/${msalConfig.TENANT_ID}/oauth2/v2.0/authorize`;

            const redirectUri = AuthSession.makeRedirectUri({
                useProxy: true, // Usar proxy de Expo para desarrollo
            });

            console.log('Redirect URI:', redirectUri);

            // Configurar la sesión de autenticación
            const request = new AuthSession.AuthRequest({
                clientId: msalConfig.CLIENT_ID,
                scopes: msalConfig.scopes,
                responseType: AuthSession.ResponseType.Code,
                redirectUri: redirectUri,
                codeChallenge: codeChallenge,
                codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
                additionalParameters: {},
                extraParams: {
                    prompt: 'select_account',
                },
            });

            // Realizar la autenticación
            const result = await request.promptAsync({
                authorizationEndpoint: authUrl,
                useProxy: true,
            });

            if (result.type === 'success') {
                // Intercambiar el código por tokens
                const tokenResult = await this.exchangeCodeForToken(
                    result.params.code,
                    redirectUri,
                    codeChallenge
                );

                if (tokenResult.access_token) {
                    this.accessToken = tokenResult.access_token;
                    await this.fetchUserInfo();
                    return { success: true, userInfo: this.userInfo };
                }
            }

            return { success: false, error: 'Authentication failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async exchangeCodeForToken(code, redirectUri, codeVerifier) {
        const tokenUrl = `https://login.microsoftonline.com/${msalConfig.TENANT_ID}/oauth2/v2.0/token`;

        const body = new URLSearchParams({
            client_id: msalConfig.CLIENT_ID,
            code: code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            code_verifier: codeVerifier,
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });

        return await response.json();
    }

    async fetchUserInfo() {
        if (!this.accessToken) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                this.userInfo = await response.json();
                return this.userInfo;
            } else {
                throw new Error('Failed to fetch user info');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    }

    async logout() {
        this.userInfo = null;
        this.accessToken = null;

        // Opcional: Cerrar sesión en Microsoft también
        const logoutUrl = `https://login.microsoftonline.com/${msalConfig.TENANT_ID}/oauth2/v2.0/logout`;
        await WebBrowser.openBrowserAsync(logoutUrl);

        return true;
    }

    getUserInfo() {
        return this.userInfo;
    }

    isLoggedIn() {
        return this.accessToken !== null && this.userInfo !== null;
    }
}

export default new AuthService();