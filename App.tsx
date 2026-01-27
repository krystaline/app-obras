// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackScreenProps } from '@react-navigation/stack';

// Importa tus pantallas
import LoginScreen from './screens/LoginScreen';
import MainScreen from './screens/MainScreen';   // Tu pantalla de lista (ahora .tsx)
import MenuScreen from './screens/MenuScreen';
import { Desplazamiento, LineaOferta, LineasPorParte, ManoDeObra, Material, Oferta, VehiculoEnviarDTO } from "./config/types";
import InfoOferta from "./screens/InfoOfertasScreen";
import InfoLinea from "./screens/InfoLineaScreen";
import CrearParteScreen from "./screens/CrearParteScreen";
import ParteDetail from "./screens/ParteDetailScreen";
import { Text } from "react-native";
import AsignarTrabajadoresScreen from "./screens/AsignarTrabajadoresScreen";
import InfoParteMO from './screens/partesManoObra/InfoPartesMOScreen';
import CrearParteMOScreen from "./screens/partesManoObra/NewParteMOScreen";
import CrearDesplazamientoScreen from "./screens/partesManoObra/CrearDesplazamientoScreen";
import CrearMOScreen from "./screens/partesManoObra/CrearMOScreen";
import AgregarMaterialScreen from "./screens/partesManoObra/AgregarMaterialScreen";

type Parte = {
    id: number,
    nombre: string,
    descripcion: string,
    fechaInicio: string,
    fechaFin: string,
    estado: string,
    proyecto: string,
    oferta: Oferta,
    lineas: LineaOferta[],
}

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
    // La pantalla de menú podría recibir el tipo de lista
    Menu: { user: any; accessToken: string; };
};

// Parámetros para el Stack de las pantallas principales
export type MainTabParamList = {
    ListarPartesMO: { user: any; accessToken: string; listType?: 'ofertas' | 'partes' | 'incidencias'; };
    CrearParte: { user: any; accessToken: string, lineas: LineaOferta[], oferta: Oferta, proyecto: string };
    CrearParteMO: {
        user: any;
        accessToken: string,
        oferta: Oferta,
        proyecto: string,
        nPartes: number,
        nuevoDesplazamiento?: any
    };
    InfoOferta: { user: any; accessToken: string; idOferta: number; oferta: Oferta };
    InfoParteMO: { user: any; accessToken: string; idOferta: number; oferta: Oferta };
    InfoLinea: { user: any; accessToken: string; linea: LineaOferta | LineasPorParte, idParteERP: number, idParteAPP: number }
    ParteDetail: { user: any; accessToken: string; idParteERP: number, idParteAPP: number };
    AsignarTrabajadoresScreen: { user: any; accessToken: string; parteId: number }; // TODO: cambiar cuando meta trabajadores
    CrearDesplazamiento: {
        onSave: (desplazamiento: VehiculoEnviarDTO) => void;
        user: any;
    };
    AgregarMaterial: {
        onSave: (material: Material) => void;
        accessToken: (string);
        user: any;
    };
    CrearMO: {
        onSave: (manodeobra: ManoDeObra) => void
    }
}

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTabStack = createNativeStackNavigator<MainTabParamList>();
type MainTabNavigatorProps = StackScreenProps<RootStackParamList, 'MainTab'>;

function MainTabNavigator({ route }: MainTabNavigatorProps) {

    const { user, accessToken } = route.params;

    // Aquí, extraemos los parámetros de la ruta MainTab para pasarlos a la pantalla
    const initialParams = (route.params.params as MainTabParamList['ListarPartesMO']) || {};

    return (
        <MainTabStack.Navigator
            initialRouteName="ListarPartesMO"
            screenOptions={{
                headerShown: false,
            }}
        >
            <MainTabStack.Screen name="ListarPartesMO">
                {props => (
                    <MainScreen
                        {...props}
                        route={{
                            ...props.route,
                            params: {
                                ...props.route.params, // Mantenemos otros params
                                user,
                                accessToken,
                                // Pasamos el parámetro listType si existe
                                listType: initialParams.listType,
                            },
                        }}
                    />
                )}
            </MainTabStack.Screen>

            <MainTabStack.Screen name="CrearParte">
                {props => {
                    const { lineas, oferta, proyecto } = props.route.params as {
                        lineas: LineaOferta[],
                        oferta: Oferta,
                        proyecto: string
                    }
                    return (
                        <CrearParteScreen
                            {...props}
                            route={{
                                ...props.route,
                                params: {
                                    ...props.route.params,
                                    user,
                                    accessToken,
                                    lineas,
                                    oferta,
                                    proyecto
                                },
                            }}
                        />
                    )
                }}
            </MainTabStack.Screen>
            <MainTabStack.Screen name="CrearParteMO">
                {props => {
                    const { oferta, proyecto } = props.route.params as {
                        oferta: Oferta,
                        proyecto: string
                    }
                    const { nPartes } = props.route.params as { nPartes: number };

                    return (
                        <CrearParteMOScreen
                            {...props}
                            route={{
                                ...props.route,
                                params: {
                                    ...props.route.params,
                                    user,
                                    accessToken,
                                    oferta,
                                    nPartes,
                                    proyecto
                                },
                            }}
                        />
                    )
                }}
            </MainTabStack.Screen>

            <MainTabStack.Screen name="ParteDetail">
                {props => {
                    const { idParteERP, idParteAPP, user, accessToken } = props.route.params as {
                        idParteERP: number,
                        idParteAPP: number,
                        user: any,
                        accessToken: string
                    };
                    return (
                        <ParteDetail
                            {...props}
                            route={{
                                ...props.route,
                                params: {
                                    ...props.route.params,
                                    idParteAPP,
                                    idParteERP,
                                    user,
                                    accessToken,
                                },
                            }}
                        />
                    );
                }}
            </MainTabStack.Screen>
            <MainTabStack.Screen name="InfoOferta">
                {props => {
                    const { idOferta } = props.route.params as { idOferta: number };
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
            <MainTabStack.Screen name="InfoParteMO">
                {props => {
                    const { idOferta } = props.route.params as { idOferta: number };
                    return (
                        <InfoParteMO
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
            <MainTabStack.Screen name="CrearDesplazamiento" options={{ presentation: 'modal' }}
                component={CrearDesplazamientoScreen} />
            <MainTabStack.Screen name="AgregarMaterial" options={{ presentation: 'modal' }}
                component={AgregarMaterialScreen} />
            <MainTabStack.Screen name="CrearMO" options={{ presentation: 'modal' }} component={CrearMOScreen} />

            <MainTabStack.Screen name="AsignarTrabajadoresScreen">
                {props => {
                    const { parteId } = props.route.params as { parteId: number };
                    return (
                        <AsignarTrabajadoresScreen
                            {...props}
                            route={{
                                ...props.route,
                                params: {
                                    ...props.route.params,
                                    user,
                                    accessToken,
                                    parteId
                                },
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
                    options={{ headerShown: false }}
                />
                <RootStack.Screen
                    name="MainTab"
                    component={MainTabNavigator}
                    options={{ headerShown: false }}
                />
                <RootStack.Screen
                    name="Menu"
                    component={MenuScreen}
                    options={{
                        headerShown: false,
                        presentation: 'modal',
                    }}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}