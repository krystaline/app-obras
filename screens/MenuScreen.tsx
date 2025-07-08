// MenuScreen.tsx
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {ParteData} from "../config/apiService"; // Importa tu RootStackParamList

type MenuScreenProps = StackScreenProps<RootStackParamList, 'Menu'>; // Define el tipo para esta pantalla

export default function MenuScreen({navigation, route}: MenuScreenProps) {
    const {user, accessToken} = route.params;




    const handleLogout = () => {
        navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Menú de opciones</Text>
                <Text style={styles.username}>Hola, {user.displayName}</Text>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={navigation.goBack}>
                <Text style={styles.menuItemText}>📋 Ofertas de diseño</Text>
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