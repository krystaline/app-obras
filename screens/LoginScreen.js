import React, {useState, useEffect} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Button,
    Alert,
    ActivityIndicator,

} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {useNavigation} from "@react-navigation/native";

const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'appobras'
});


// CONFIGURACIÓN DE AZURE AD
const AZURE_AD_CLIENT_ID = '7562f532-b3df-4051-841b-a5c6bbf51300'; // TU_CLIENT_ID_DE_AZURE_AD
const AZURE_AD_TENANT_ID = 'd0fbdbb8-b41b-4c4a-af4a-1ef369dcccaa'; // TU_TENANT_ID_DE_AZURE_AD (o 'common' para multitenant/cuentas personales)
const AZURE_AD_AUTHORIZATION_ENDPOINT = `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID || 'common'}/oauth2/v2.0/authorize`;
const AZURE_AD_TOKEN_ENDPOINT = `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID || 'common'}/oauth2/v2.0/token`;


WebBrowser.maybeCompleteAuthSession(); // Es importante para iOS para manejar el cierre del navegador

export default function LoginScreen() {
    const navigation = useNavigation();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authRequest, setAuthRequest] = useState(null);


    // Configuración de autenticación
    const discovery = {
        authorizationEndpoint: AZURE_AD_AUTHORIZATION_ENDPOINT,
        tokenEndpoint: AZURE_AD_TOKEN_ENDPOINT,
    };


    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: AZURE_AD_CLIENT_ID,
            scopes: ['openid', 'profile', 'email', 'User.Read'],
            responseType: AuthSession.ResponseType.Code,
            redirectUri,
            usePKCE: false,
            additionalParameters: {
                prompt: 'select_account',
            },
            extraParams: {
                response_mode: 'query',
            },
        },
        discovery
    );

    useEffect(() => {
        if (response?.type === 'success') {
            exchangeCodeForToken(response.params.code);
        } else if (response?.type === 'error') {
            console.error('Auth Error:', response.error);
            alert('Error en autenticación: ' + (response.error?.message || 'Error desconocido'));
            setLoading(false);
        }
    }, [response, request]);

    // Intercambiar código por token y obtener datos del usuario
    const exchangeCodeForToken = async (code) => {
        setLoading(true)
        try {
            const tokenResponse = await AuthSession.exchangeCodeAsync(
                {
                    clientId: AZURE_AD_CLIENT_ID,
                    code, redirectUri
                },
                {
                    tokenEndpoint: AZURE_AD_TOKEN_ENDPOINT,
                }
            )

            console.log('Token:', tokenResponse);
            if (tokenResponse.accessToken) {
                const userData = await fetchUserProfile(tokenResponse.accessToken);
                if (userData) {
                    console.log('User:', userData);
                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: "MainTab",
                            params: {
                                user: userData,
                                accessToken: tokenResponse.accessToken,
                                screen: "ListarPartes",
                                params: {
                                    user: userData, accessToken: tokenResponse.accessToken,
                                }
                            }
                        }]
                    })
                    setLoading(false);
                }
            } else {
                Alert.alert('Error', 'No se pudo obtener el token de acceso');
                setLoading(false);
            }
        } catch (error) {
            Alert.alert('Error', 'Error al obtener los datos del usuario');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async (accessToken) => {
        try {
            const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            const userData = await userResponse.json();
            setUser(userData);
            console.log('User:', userData);
            return userData;
        } catch (error) {
            console.error('Error:', error);
            return null
        }
    }

    const handleLogin = async () => {
        setLoading(true);
        try {
            await promptAsync({useProxy: true});
        } catch (error) {
            console.error('Error en login:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0078d4"/>
                <Text style={styles.loadingText}>Iniciando sesión...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.loginContainer}>
                <Text style={styles.title}>Microsoft Auth App</Text>
                <Text style={styles.subtitle}>Inicia sesión con tu cuenta Microsoft</Text>
                <Button
                    title="Iniciar Sesión con Microsoft"
                    onPress={handleLogin}
                    color="#0078d4"
                    disabled={!request}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#0078d4',
    },
    loginContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    userContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0078d4',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
});