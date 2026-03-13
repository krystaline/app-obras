import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import { Linking, Platform } from 'react-native';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxlc3ZvbHRhIiwiYSI6ImNtbGY1MmUycjAwazMzY3NiY255Z3lyYW4ifQ.Ui7T5G_7FCzh45Wephr7MA';
Mapbox.setAccessToken(MAPBOX_TOKEN);
const directionsClient = MapboxDirections({ accessToken: MAPBOX_TOKEN });

interface PuntoInteres {
    id: string;
    nombre: string;
    coords: [number, number]; // [longitud, latitud]
    descripcion: string;
}

const MIS_PUNTOS: PuntoInteres[] = [
    { id: '1', nombre: 'Punto A', coords: [-3.7037, 40.4167], descripcion: 'Descripción A' },
    { id: '2', nombre: 'Punto B', coords: [-67.6767, -16.6767], descripcion: 'Descripción B' },
    // Añade aquí los mismos que subiste a Mapbox
];

const MapScreen: React.FC = () => {
    const cameraRef = useRef<Mapbox.Camera>(null);

    // Función para mover la cámara
    const moverACoordenadas = (coords: [number, number]) => {
        cameraRef.current?.setCamera({
            centerCoordinate: coords,
            zoomLevel: 18,
            animationDuration: 1500, // Hace un efecto suave de "vuelo"
            animationMode: 'flyTo',
        });
    };

    const renderItem = ({ item }: { item: PuntoInteres }) => (
        <TouchableOpacity
            style={styles.itemLista}
            onPress={() => moverACoordenadas(item.coords)}
        >
            <Text style={styles.nombrePunto}>{item.nombre}</Text>
            <Text style={styles.verMas}>Ver en mapa →</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1 }}>
            {/* MAPA */}
            <Mapbox.MapView style={styles.map}>
                <Mapbox.Camera ref={cameraRef} zoomLevel={12} centerCoordinate={[-3.7037, 40.4167]} />

                <Mapbox.VectorSource id="Obras" url="mapbox://alesvolta.cmlgd0t1f77ks1mkogh15wd5o-7brqr">
                    <Mapbox.CircleLayer id="Obras" sourceLayerID="Obras" style={{ circleColor: 'red', circleRadius: 6 }} />
                </Mapbox.VectorSource>
            </Mapbox.MapView>

            {/* LISTA FLOTANTE (FlatList) */}
            <View style={styles.contenedorLista}>
                <FlatList
                    data={MIS_PUNTOS}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    horizontal // Para que sea una lista deslizante horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                />
            </View>
        </View>
    );
};

// Estilos de capas y componentes
const styles = StyleSheet.create({
    map: { flex: 1 },
    contenedorLista: {
        position: 'absolute',
        bottom: 40, // Se apoya sobre el mapa
        height: 100,
    },
    itemLista: {
        backgroundColor: 'white',
        width: 180,
        height: 80,
        marginHorizontal: 8,
        borderRadius: 12,
        padding: 12,
        // Sombra para iOS y Android
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    nombrePunto: { fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
    verMas: { color: '#007AFF', fontSize: 12, fontWeight: '600' }
});


const openExternalMap = (coords: [number, number], name: string) => {
    const [longitude, latitude] = coords;

    // Esquema para iOS (Apple Maps) y Android (Google Maps)
    const scheme = Platform.select({
        ios: 'maps:0,0?q=',
        android: 'geo:0,0?q=',
    });

    const latLng = `${latitude},${longitude}`;
    const label = name;

    // URL final
    const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
        Linking.openURL(url).catch(() => {
            Alert.alert("Error", "No se pudo abrir la aplicación de mapas");
        });
    }
};

export default MapScreen;