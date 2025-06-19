// App.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StackScreenProps} from '@react-navigation/stack'; // Asegúrate de importar StackScreenProps

// Importa tus pantallas
import LoginScreen from './screens/LoginScreen';
import MainScreen from './screens/MainScreen';   // Tu pantalla de lista (ahora .tsx)
import CreatePartScreen from './screens/CreatePartScreen'; // Tu nueva pantalla de creación (ahora .tsx)
import MenuScreen from './screens/MenuScreen';
import ParteInfoScreen from "./screens/ParteInfoScreen";
import {ParteData} from "./config/apiService"; // ¡La nueva pantalla para el menú!

// --- Definiciones de tipos ---
// Parámetros para el Root Stack
export type RootStackParamList = {
    Login: undefined;
    MainTab: {
        user: any;
        accessToken: string;
        screen?: keyof MainTabParamList;
        params?: MainTabParamList[keyof MainTabParamList]
    };
    Menu: { user: any; accessToken: string }; // Parámetros para la pantalla de menú
};

// Parámetros para el Stack de las pantallas principales (Listar/Crear)
export type MainTabParamList = {
    ListarPartes: { user: any; accessToken: string };
    CrearParte: { user: any; accessToken: string };
    InfoParte: { user: any; accessToken: string; parte_id: number };
};


const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTabStack = createNativeStackNavigator<MainTabParamList>();

type MainTabNavigatorProps = StackScreenProps<RootStackParamList, 'MainTab'>;

function MainTabNavigator({route}: MainTabNavigatorProps) {

    const {user, accessToken} = route.params; // Parámetros pasados desde LoginScreen
    console.log('MainTabNavigator - Received user:', user);

    return (
        <MainTabStack.Navigator
            initialRouteName="ListarPartes" // Puedes elegir qué pantalla mostrar primero
            screenOptions={{
                headerShown: false, // Ocultamos los headers aquí y los manejamos dentro de cada pantalla
            }}
        >
            <MainTabStack.Screen name="ListarPartes">
                {/* Asegúrate de que los params se inyecten correctamente */}
                {props => (
                    <MainScreen
                        {...props}
                        route={{
                            ...props.route,
                            params: {
                                ...props.route.params, // Mantén otros params si existen
                                user,        // Inyecta el user que recibimos en MainTabNavigator
                                accessToken, // Inyecta el accessToken que recibimos en MainTabNavigator
                            },
                        }}
                    />
                )}
            </MainTabStack.Screen>
            <MainTabStack.Screen name="CrearParte">
                {props => (
                    <CreatePartScreen
                        {...props}
                        route={{
                            ...props.route,
                            params: {
                                ...props.route.params, // Mantén otros params si existen
                                user,        // Inyecta el user que recibimos en MainTabNavigator
                                accessToken, // Inyecta el accessToken que recibimos en MainTabNavigator
                            },
                        }}
                    />
                )}
            </MainTabStack.Screen>
            <MainTabStack.Screen name="InfoParte">
                {props => {
                    // Extract 'parte' from props.route.params
                    const { parte_id } = props.route.params as { parte_id: number }; // Assert the type to access 'parte'
                    return (
                        <ParteInfoScreen
                            {...props}
                            route={{
                                ...props.route,
                                params: {
                                    ...props.route.params,
                                    user,
                                    parte_id, // Now 'parte' is defined here
                                },
                            }}
                        />
                    );
                }}
            </MainTabStack.Screen>
        </MainTabStack.Navigator>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <RootStack.Navigator initialRouteName="Login">
                <RootStack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{headerShown: false}}
                />
                <RootStack.Screen
                    name="MainTab" // Esta es la ruta a la que navegas después del login
                    component={MainTabNavigator} // Carga el Stack de Listar/Crear
                    options={{headerShown: false}}
                />
                <RootStack.Screen
                    name="Menu" // La pantalla del menú
                    component={MenuScreen}
                    options={{
                        headerShown: false,
                        presentation: 'modal', // Esto hace que aparezca desde abajo como una modal
                        // O 'card' si quieres que se apile como una pantalla normal y se cierre con back
                        // Si quieres una animación desde la izquierda, necesitarías una librería como react-native-modal
                    }}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}