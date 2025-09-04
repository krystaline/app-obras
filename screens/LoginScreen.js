import React, {useState, useEffect} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Alert,
    ActivityIndicator,
    Image,
    TouchableOpacity, // Import TouchableOpacity
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {useNavigation} from "@react-navigation/native";
import {msalConfig} from "../auth/AuthConfig";

const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'appobras', path: 'auth',
});

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const navigation = useNavigation();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authRequest, setAuthRequest] = useState(null);

    const discovery = {
        authorizationEndpoint: msalConfig.discovery.authorizationEndpoint,
        tokenEndpoint: msalConfig.discovery.tokenEndpoint,
    };

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: msalConfig.CLIENT_ID,
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

    const exchangeCodeForToken = async (code) => {
        setLoading(true)
        try {
            const tokenResponse = await AuthSession.exchangeCodeAsync(
                {
                    clientId: msalConfig.CLIENT_ID,
                    code, redirectUri
                },
                {
                    tokenEndpoint: msalConfig.discovery.tokenEndpoint,
                }
            )

            if (tokenResponse.accessToken) {
                const userData = await fetchUserProfile(tokenResponse.accessToken);
                if (userData) {
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
                <Image source={require('../assets/logo-completo.png')} style={styles.kryslogo}/>
                <Text style={styles.title}>Aplicación de obras Krystaline</Text>
                <Text style={styles.subtitle}>Inicia sesión con tu cuenta Microsoft</Text>
                {/* Use TouchableOpacity instead of Button */}
                <TouchableOpacity
                    style={[styles.loginButton, !request && styles.disabledButton]} // Apply disabled style
                    onPress={handleLogin}
                    disabled={!request || loading} // Disable when request is not ready or loading
                >
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
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
        padding: 15,
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
    kryslogo: {
        position: 'absolute',
        top: -150,
        height: 60,
        objectFit: "contain"
    },
    loginButton: {
        backgroundColor: '#5BBDB3',
        paddingVertical: 12, // Use paddingVertical for better control
        paddingHorizontal: 20, // Use paddingHorizontal
        borderRadius: 8,
        marginTop: 20,
        alignSelf: 'center',
    },
    loginButtonText: {
        color: '#f5f5f5',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    disabledButton: {
        backgroundColor: '#a0cbe8', // A lighter shade of blue for disabled state
    },
});