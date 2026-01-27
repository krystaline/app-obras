// CrearDesplazamientoScreen.tsx
import React, { useState, useLayoutEffect, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    Keyboard,
    TouchableOpacity,
    Platform, // Importante para detectar el SO
    FlatList
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainTabParamList } from "../../App";
// Importación unificada del DatePicker
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Vehiculo, VehiculoEnviarDTO } from "../../config/types";
import { apiService } from '../../config/apiService';

type CrearDesplazamientoScreenProps = StackScreenProps<MainTabParamList, 'CrearDesplazamiento'>;

export default function CrearDesplazamientoScreen({ navigation, route }: CrearDesplazamientoScreenProps) {
    // Estados
    const [matricula, setMatricula] = useState('');
    const [distancia, setDistancia] = useState('');
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);


    // Estado del buscador
    const [query, setQuery] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Estado para el objeto Date (necesario para el componente Picker)
    const [date, setDate] = useState(new Date());
    // Estado para el string que envías al guardar (YYYY-MM-DD)
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

    // Controla si se muestra o no el calendario
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onSave = route.params?.onSave;
    const user = route.params?.user;

    useEffect(() => {
        let mounted = true
        apiService
            .getVehiculos(user.id)
            .then((response: any) => {
                if (!mounted) return
                const data: Vehiculo[] = Array.isArray(response.data) ? response.data : []
                setVehiculos(data)
            })
            .catch((error) => {
                console.log(error)
            })
        return () => {
            mounted = false
        }

    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => {
                    navigation.goBack();
                }} style={styles.cancelButtonHeader}>
                    <Text style={styles.cancelButtonHeaderText}>Cancelar</Text>
                </TouchableOpacity>
            ),
            title: 'Detalles del Desplazamiento',
        });
    }, [navigation]);


    // Filtro en memoria (rápido con listas medianas)
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return vehiculos.slice(0, 10); // límite de cortesía

        // Permite buscar por múltiples tokens (id, lote, desc)
        const tokens = q.split(/\s+/).filter(Boolean);
        const matches = (m: Vehiculo) => {
            const haystack = `${m.id ?? ''} ${m.matricula ?? ''}`.toLowerCase();
            return tokens.every(t => haystack.includes(t));
        };
        return vehiculos.filter(matches).slice(0, 100);
    }, [vehiculos, query]);

    // Selección
    const handleSelect = (m: Vehiculo) => {
        setSelectedVehiculo(m);
        setQuery(`${m.modelo}${m.matricula ? ` · ${m.matricula}` : ''}`);
        setDropdownVisible(false);
        Keyboard.dismiss();
    };

    // Guardar
    const handleSave = () => {
        if (!selectedVehiculo) {
            Alert.alert('Falta vehículo', 'Selecciona un vehículo en el buscador.');
            return;
        }
        if (!fecha) {
            Alert.alert('Falta fecha', 'Indica una fecha válida (YYYY-MM-DD).');
            return;
        }

        const nuevoVehiculo: VehiculoEnviarDTO = {
            id: selectedVehiculo.id,
            matricula: selectedVehiculo.matricula,
            distancia: parseFloat(distancia),
            fecha,
        };

        onSave?.(nuevoVehiculo);
        navigation.goBack();
    };


    // --- Lógica del DatePicker ---
    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;

        // En Android, el picker se cierra automáticamente.
        // En iOS, a veces queremos mantenerlo abierto o cerrarlo según el estilo.
        // Aquí lo cerramos al seleccionar para simplificar.
        setShowDatePicker(Platform.OS === 'ios');

        setDate(currentDate);
        // Actualizamos el string que se muestra y se guarda
        setFecha(currentDate.toISOString().split('T')[0]);
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };
    // -----------------------------

    const handleCancel = () => {
        Alert.alert(
            "Descartar Desplazamiento",
            "¿Estás seguro de que quieres descartar este desplazamiento?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Descartar",
                    onPress: () => navigation.goBack(),
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };

    // Render del item del dropdown
    const renderItem = ({ item }: { item: Vehiculo }) => (
        <TouchableOpacity onPress={() => handleSelect(item)} style={styles.itemRow}>
            <Text style={styles.itemTitle}>{item.modelo}</Text>
            {!!item.matricula && <Text style={styles.itemMeta}>Matrícula: {item.matricula}</Text>}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Nuevo Desplazamiento</Text>

            <View style={styles.comboboxWrapper}>
                <TextInput
                    ref={inputRef}
                    value={query}
                    onChangeText={text => {
                        setQuery(text);
                        setDropdownVisible(true);
                        setSelectedVehiculo(null); // invalida selección previa si el usuario vuelve a teclear
                    }}
                    onFocus={() => setDropdownVisible(true)}
                    placeholder="Buscar por id o matrícula"
                    style={styles.input}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="done"
                />

                {dropdownVisible && (
                    <View style={styles.dropdown}>
                        {filtered.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Sin resultados</Text>
                            </View>
                        ) : (
                            <FlatList
                                keyboardShouldPersistTaps="handled"
                                data={filtered}
                                keyExtractor={(m, i) => `${m.id}-${m.matricula ?? 'NL'}-${i}`}
                                renderItem={renderItem}
                                style={styles.list}
                                contentContainerStyle={{ paddingVertical: 8 }}
                                initialNumToRender={12}
                                windowSize={10}
                                onScrollBeginDrag={Keyboard.dismiss}
                            />
                        )}
                    </View>
                )}
            </View>

            <Text style={styles.label}>Distancia (km):</Text>
            <TextInput
                style={styles.input}
                value={distancia}
                onChangeText={setDistancia}
                keyboardType="numeric"
                placeholder="Ej: 50"
            />

            <Text style={styles.label}>Fecha:</Text>


            <RNDateTimePicker
                themeVariant={'light'}
                testID="dateTimePicker"
                maximumDate={new Date()}
                value={date}
                mode={'date'}
                is24Hour={true}
                display="spinner"
                onChange={onChangeDate}
            />


            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: 'white', // Añadido para consistencia visual
    },
    // Nuevos estilos para el contenedor de la fecha para que se vea igual que los inputs
    inputDateContainer: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: 'white',
        justifyContent: 'center', // Centra el texto verticalmente
    },
    inputText: {
        fontSize: 14,
        color: 'black',
    },
    saveButton: {
        backgroundColor: '#5bbd6f',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButtonHeader: {
        marginLeft: 15,
        padding: 10,
    },
    cancelButtonHeaderText: {
        color: '#3EB1A5',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 18,
        fontWeight: 'bold',
    },
    comboboxWrapper: {
        marginBottom: 16,
        position: 'relative',
        zIndex: 10,
    },
    dropdown: {
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        maxHeight: 260,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    list: {
        maxHeight: 260,
    },
    itemRow: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    itemTitle: {
        fontWeight: '600',
        fontSize: 15,
        color: '#0f172a',
    },
    itemMeta: {
        fontSize: 13,
        color: '#475569',
        marginTop: 2,
    }, emptyState: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    emptyText: {
        color: '#64748b',
    },
});