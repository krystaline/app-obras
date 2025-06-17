// MenuScreen.tsx
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../App'; // Importa tu RootStackParamList

type MenuScreenProps = StackScreenProps<RootStackParamList, 'Menu'>; // Define el tipo para esta pantalla

export default function MenuScreen({navigation, route}: MenuScreenProps) {
    // Recupera los parámetros de usuario pasados a esta pantalla
    const {user, accessToken} = route.params;

    const navigateToList = () => {
        navigation.navigate('MainTab', {
            user, accessToken,
            screen: 'ListarPartes', // Navega al Stack anidado y luego a la pantalla específica
            params: {user, accessToken}
        });
        navigation.goBack(); // Cierra el menú (si se abrió como modal o en un stack)
    };

    const navigateToCreate = () => {
        console.log("crea parte")
        navigation.navigate('MainTab', {
            user, accessToken,
            screen: 'CrearParte', // Navega al Stack anidado y luego a la pantalla específica
            params: {user, accessToken}
        });

    };

    const handleLogout = () => {
        // Lógica de logout: limpiar tokens, etc.
        navigation.popToTop(); // Vuelve a la pantalla de Login
    };
    console.log("E --> " + user);
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Menú de opciones</Text>
                <Text style={styles.username}>Hola, {user.displayName}</Text>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={navigateToList}>
                <Text style={styles.menuItemText}>Listar Partes de Obra</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={navigateToCreate}>
                <Text style={styles.menuItemText}>Crear Parte de Obra</Text>
            </TouchableOpacity>

            <View style={styles.spacer}/>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
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