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
import ParteInfoScreen from "./screens/InfoOfertasScreen";
import {LineaOferta, Oferta, ParteData, Proyecto} from "./config/apiService";
import InfoOferta from "./screens/InfoOfertasScreen";
import InfoLinea from "./screens/InfoLineaScreen";
import CrearParteScreen from "./screens/CrearParteScreen"; // ¡La nueva pantalla para el menú!

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
    CrearParte: { user: any; accessToken: string, lineas: LineaOferta[], oferta: Oferta, proyecto: string };
    InfoOferta: { user: any; accessToken: string; idOferta: number; oferta: Oferta };
    InfoLinea: { user: any; accessToken: string; linea: LineaOferta }
};


const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTabStack = createNativeStackNavigator<MainTabParamList>();

type MainTabNavigatorProps = StackScreenProps<RootStackParamList, 'MainTab'>;

function MainTabNavigator({route}: MainTabNavigatorProps) {

    const {user, accessToken} = route.params; // Parámetros pasados desde LoginScreen

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
                {props => {
                    const {lineas, oferta, proyecto } = props.route.params as {lineas: LineaOferta[], oferta: Oferta, proyecto: string}
                    return (

                        <CrearParteScreen
                            {...props}
                            route={{
                                ...props.route,
                                params: {
                                    ...props.route.params, // Mantén otros params si existen
                                    user,        // Inyecta el user que recibimos en MainTabNavigator
                                    accessToken,
                                    lineas,
                                    oferta,
                                    proyecto// Inyecta el accessToken que recibimos en MainTabNavigator
                                },
                            }}
                        />
                    )
                }}
            </MainTabStack.Screen>
            <MainTabStack.Screen name="InfoOferta">
                {props => {
                    // Extract 'parte' from props.route.params
                    const {idOferta} = props.route.params as { idOferta: number }; // Assert the type to access 'parte'
                    return (
                        <InfoOferta
                            {...props}
                            route={{
                                ...props.route,
                                params: {
                                    ...props.route.params,
                                    user,
                                    idOferta,
                                },
                            }}
                        />
                    );
                }}
            </MainTabStack.Screen>
            <MainTabStack.Screen name="InfoLinea">
                {props => {
                    return (
                        <InfoLinea
                            {...props}
                            route={{
                                ...props.route,
                                params: {
                                    ...props.route.params,
                                    user
                                }
                            }}
                        />
                    )
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