// MenuScreen.tsx
import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {apiService} from "../config/apiService";
import * as ImagePicker from 'expo-image-picker'

type MenuScreenProps = StackScreenProps<RootStackParamList, 'Menu'>;

export default function MenuScreen({navigation, route}: MenuScreenProps) {
    const {user, accessToken} = route.params;

    const handleLogout = () => {
        navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
        });
    };

    // Al seleccionar una opción, se vuelve a la pantalla anterior (MainTab)
    // y se le pasa el parámetro 'listType'
    const handleSelectOption = (listType: 'ofertas' | 'partes' | 'incidencias') => {
        // Usa `goBack` para cerrar la modal y pasar parámetros a la pantalla anterior.
        navigation.goBack();
        // Usa `Maps` para ir a la pantalla de la lista, pasando el parámetro.
        // Aquí hay un pequeño ajuste. Como `MenuScreen` está en el stack principal,
        // no puede acceder directamente a los params de `MainScreen`.
        // La mejor forma es pasar el parámetro a la ruta 'MainTab',
        // para que luego la pantalla MainTab lo use.

        // Esta lógica debe ser parte de la navegación
        // navigation.navigate('MainTab', {
        //     user,
        //     accessToken,
        //     screen: 'ListarPartes',
        //     params: { listType: listType, user, accessToken }
        // });
        // Sin embargo, si `MenuScreen` se abre como modal, no hay un `MainTab` "detrás".
        // La forma más robusta es usar `navigation.navigate` directamente a la pantalla principal
        // y pasar el parámetro. Esto sobrescribirá la pantalla actual.

        navigation.navigate("MainTab", {
            user,
            accessToken,
            screen: 'ListarPartesMO', // Esto asegura que la pantalla ListarPartes se cargue
            params: {listType: listType, user, accessToken}
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Menú de opciones</Text>
                <Text style={styles.username}>Hola, {user.displayName}</Text>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleSelectOption('ofertas')}>
                <Text style={styles.menuItemText}>📋 Ofertas de diseño</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuSecondaryColor]}
                              onPress={() => handleSelectOption('partes')}>
                <Text style={styles.menuItemText}>👷🏼‍♂️ Partes Mano de Obra</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuTertiaryColor]}
                              onPress={() => handleSelectOption('incidencias')}>
                <Text style={styles.menuItemText}>⚠️ Incidencias</Text>
            </TouchableOpacity>

            <View style={styles.spacer}/>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f7',
        paddingTop: 20,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 5,
    },
    username: {
        fontSize: 18,
        color: '#64748b',
    },
    menuItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: 'white',
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#5BBDB3',
    },
    menuSecondaryColor: {
        borderLeftColor: '#5BBD6B',
    },
    menuTertiaryColor: {
        borderLeftColor: '#e8ca32',
    },
    menuItemText: {
        fontSize: 18,
        color: '#333',
        fontWeight: '500',
    },
    spacer: {
        flex: 1,
    },
    logoutButton: {
        backgroundColor: '#d13438',
        padding: 15,
        borderRadius: 8,
        margin: 20,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});