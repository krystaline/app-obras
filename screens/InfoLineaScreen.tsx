// InfoOfertasScreen.tsx
import {
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    TextInput
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { MainTabParamList } from "../App";
import React, { useState, useEffect } from "react";
import { LineaOferta, LineasPorParte } from "../config/types";

type InfoLineaProps = StackScreenProps<MainTabParamList, 'InfoLinea'>;
export default function InfoLinea({ route, navigation }: InfoLineaProps) {
    const { linea } = route.params as { linea: LineaOferta | LineasPorParte }

    const isLineaOferta = (l: LineaOferta | LineasPorParte): l is LineaOferta => {
        return (l as LineaOferta).ocl_Descrip !== undefined;
    }

    const descripcion = isLineaOferta(linea) ? linea.ocl_Descrip : linea.descriparticulo;
    const unidades = isLineaOferta(linea) ? linea.ocl_UnidadesPres : linea.cantidad_total;
    const cantidad = isLineaOferta(linea) ? linea.ppcl_cantidad : linea.cantidad;
    const certificado = isLineaOferta(linea) ? linea.ppcl_Certificado : linea.certificado;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Detalles de la línea</Text>
            <View style={styles.card}>
                <Text style={styles.value}>Descripción:
                    <Text style={styles.label}> {descripcion}</Text>
                </Text>
                <Text style={styles.value}>Unidades:
                    <Text style={styles.label}> {unidades}</Text>
                </Text>
                <Text style={styles.value}>Cantidad:
                    <Text style={styles.label}> {cantidad}</Text>
                </Text>
            </View>
            <View style={certificado == 0 ? styles.activityCardNoCert : styles.activityCard}>
                <Text style={styles.labelBold}>{certificado == 0 ? 'No certificado' : 'Certificado'}</Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 40,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#333',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    assignWorkersCard: {
        backgroundColor: '#3EB1A5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    workersLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
    },
    labelBold: {
        fontSize: 16,
        fontWeight: '500',

    },
    value: {
        fontSize: 16,
        color: '#333',
    },
    subValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 3,
    },
    statusActive: {
        color: 'green',
        fontWeight: 'bold',
    },
    statusInactive: {
        color: 'red',
        fontWeight: 'bold',
    },
    section: {
        marginTop: 20,
        marginBottom: 80,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    activityCard: {
        backgroundColor: '#5BBDB3',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    activityCardNoCert: {
        backgroundColor: '#ff5050',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        elevation: 3,
    },
    activityText: {
        fontSize: 15,
        color: '#444',
    },
    signatureImage: {
        width: '100%',
        height: 200, // Ajusta la altura según sea necesario
        borderWidth: 1,
        borderColor: '#ddd',
        marginTop: 10,
        objectFit: 'cover',
        marginBottom: 5,
    },
    imageDisclaimer: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 50,
    },
});