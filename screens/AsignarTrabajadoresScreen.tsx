import {View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Touchable, RefreshControl} from 'react-native';
import {StackScreenProps} from "@react-navigation/stack";
import {MainTabParamList} from "../App";
import React, {useEffect, useState} from "react";
import {Worker} from "../config/types";
import {apiService} from "../config/apiService";
import {Checkbox} from "expo-checkbox";
import {Ionicons} from "@expo/vector-icons";


type AsignarTrabajadoresProps = StackScreenProps<MainTabParamList, 'AsignarTrabajadoresScreen'>;


export default function AsignarTrabajadoresScreen({route, navigation}: AsignarTrabajadoresProps) {
    const {user, accessToken, parteId} = route.params as { user: any; accessToken: string, parteId: number };
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkers, setSelectedWorkers] = useState<Worker[]>([]);


    const toggleCheckbox = (id: string): void => {
        setWorkers(prevWorkers => // Actualiza el estado 'workers' directamente
            prevWorkers.map(worker =>
                worker.id === id ? {...worker, selected: !worker.selected} : worker
            )
        );
    }

    React.useEffect(() => {
        apiService.getWorkers(accessToken).then(response => {
            if (response.data) {
                setWorkers(response.data[0].members);
                setLoading(false);
            }
        }).catch(error => {
            console.error("Error getting last id:", error);
        });
    }, [accessToken])

    const renderItem = ({item}: { item: Worker }) => (
        <TouchableOpacity onPress={() => toggleCheckbox(item.id)}>
            <View style={styles.userItem}>
                <Text style={styles.userName}>{item.display_name} </Text>
                <Checkbox
                    value={item.selected}
                    onValueChange={() => toggleCheckbox(item.id)}
                    color={'#3EB1A5'}
                />
            </View>
        </TouchableOpacity>
    );

    const handleSelectedWorkers = (): void => {
        const selectedWorkers = workers
            .filter(worker => worker.selected)
            .map(worker => worker)

        if (selectedWorkers) {
            console.log(selectedWorkers);
            apiService.assignWorkers(accessToken, parteId, selectedWorkers).then(response => {
                if (response.success) {
                    Alert.alert('Trabajadores Asignados', 'Has asignado correctamente a los trabajadores.');
                } else {
                    Alert.alert('Error', 'No se pudieron asignar los trabajadores.');
                }
            })
        } else {
            Alert.alert('Trabajadores Seleccionados', 'No has seleccionado a ningún trabajador.');
        }
    };
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando trabajadores...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Ionicons style={styles.arrowBack} name={"arrow-back"} onPress={navigation.goBack}></Ionicons>
            <Text style={styles.title}>Asignar Trabajadores</Text>
            <FlatList style={styles.list}
                      data={workers}
                      renderItem={renderItem}
                      keyExtractor={item => item.id}
            />
            {/* Botón para mostrar los trabajadores seleccionados */}
            <TouchableOpacity style={styles.button} onPress={handleSelectedWorkers}>
                <Text style={styles.buttonText}>Asignar trabajadores</Text>
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        color: '#3EB1A5',
        fontSize: 20,
    },
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 10,
        backgroundColor: '#f5f5f5',
    },
    title: {

        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    list: {
        flexGrow: 1,
        width: '100%',
        display: 'flex',
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        width: '95%',
        marginHorizontal: 'auto',
        paddingHorizontal: 20,
        marginVertical: 8,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    arrowBack: {
        fontSize: 30,
        position: 'absolute',
        paddingTop: 52,
        paddingLeft: 20,
    },
    userName: {
        fontSize: 18,
        flex: 1,
    },
    checkbox: {
        // Estilos para el checkbox si necesitas personalizarlos
        color: '#3EB1A5',
    },
    button: {
        backgroundColor: '#3EB1A5',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        marginBottom: 40,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});