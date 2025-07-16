import * as SecureStore from 'expo-secure-store';
import {msalConfig} from "./AuthConfig";
import * as AuthSession from "expo-auth-session";

const saveTokens = async (accessToken, refreshToken, expiresIn) => {
    try {
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);

        await SecureStore.setItemAsync('accessTokenExpiration', String(Date.now() + expiresIn * 1000));
    } catch (error) {
        console.log(error);
    }
}

const getTokens = async () => {
    try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const accessTokenExpiration = await SecureStore.getItemAsync('accessTokenExpiration');

        if (accessToken && refreshToken && accessTokenExpiration) {
            const expirationTime = parseInt(accessTokenExpiration, 10);
            if (Date.now() < expirationTime) {
                return {accessToken, refreshToken, isExpired: false};
            } else {
                return {accessToken, refreshToken, isExpired: true};

            }
        }
        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}
const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await AuthSession.refreshAsync(
            {
                clientId: msalConfig.CLIENT_ID,
                refreshToken: refreshToken,
                scopes: msalConfig.scopes,
                // Asegúrate de que los endpoints sean correctos
                tokenEndpoint: `https://login.microsoftonline.com/${msalConfig.TENANT_ID}/oauth2/v2.0/token`,
            },
            msalConfig
        );
        // Guarda los nuevos tokens
        await saveTokens(response.accessToken, response.refreshToken || refreshToken, response.expiresIn);
        return response.accessToken;
    } catch (error) {
        console.error('Error al refrescar el token:', error);
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('accessTokenExpiration');
        return null; // Forzar al usuario a iniciar sesión de nuevo
    }
};

// Lógica en tu App para manejar la persistencia
React.useEffect(() => {
    const loadSession = async () => {
        const storedTokens = await getTokens();
        if (storedTokens) {
            if (storedTokens.isExpired) {
                console.log('Access token expirado, intentando refrescar...');
                const newAccessToken = await refreshAccessToken(storedTokens.refreshToken);
                if (newAccessToken) {
                    // Ya tienes un nuevo token, puedes usarlo
                    fetchUserInfo(newAccessToken);
                } else {
                    // No se pudo refrescar, pedir al usuario que inicie sesión de nuevo
                    setUserInfo(null); // O la lógica para mostrar el botón de login
                }
            } else {
                // Token válido, usa el token almacenado
                fetchUserInfo(storedTokens.accessToken);
            }
        }
    };
    loadSession();
}, []);