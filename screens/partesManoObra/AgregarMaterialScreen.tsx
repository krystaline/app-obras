// AgregarMaterialScreen.tsx (versión con buscador/autocomplete sin librerías externas)
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    TouchableOpacity,
    FlatList,
    Keyboard,
    Platform,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainTabParamList } from '../../App';
import { apiService } from '../../config/apiService';
import { Material } from '../../config/types';

// TIPOS
// Asumo el tipo Material con, al menos, estas propiedades utilizadas.
// Si en tu proyecto difiere, ajústalo o extiéndelo según corresponda.
// type Material = {
//   idArticulo: string;
//   lote?: string | null;
//   descripcion?: string | null;
//   cantidad?: number | null;
//   precio?: number | null;
//   unidades?: number | null;
// };

type Props = StackScreenProps<MainTabParamList, 'AgregarMaterial'>;

export default function AgregarMaterialScreen({ navigation, route }: Props) {
    const onSave = route.params?.onSave;
    const accessToken = route.params?.accessToken;
    const user = route.params?.user;

    const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
    const [cantidad, setCantidad] = useState('1');
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

    // Estado del buscador
    const [query, setQuery] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Carga inicial
    useEffect(() => {
        let mounted = true;
        apiService
            .getMateriales(accessToken, user.id)
            .then((response: any) => {
                if (!mounted) return;
                const data: Material[] = Array.isArray(response?.data) ? response.data : [];
                setMateriales(data);
            })
            .catch((error: any) => {
                console.error(`Error getting materials ${error}`);
                Alert.alert('Error', 'No se han podido cargar los materiales.');
            });
        return () => {
            mounted = false;
        };
    }, [accessToken]);

    // Cabecera de navegación
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.cancelButtonHeader}
                >
                    <Text style={styles.cancelButtonHeaderText}>Cancelar</Text>
                </TouchableOpacity>
            ),
            title: 'Agregar Material',
        });
    }, [navigation]);

    // Filtro en memoria (rápido con listas medianas)
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return materiales.slice(0, 50); // límite de cortesía

        // Permite buscar por múltiples tokens (id, lote, desc)
        const tokens = q.split(/\s+/).filter(Boolean);
        const matches = (m: Material) => {
            const haystack = `${m.idArticulo ?? ''} ${m.lote ?? ''} ${m.descripcion ?? ''}`.toLowerCase();
            return tokens.every(t => haystack.includes(t));
        };
        return materiales.filter(matches).slice(0, 100);
    }, [materiales, query]);

    // Selección
    const handleSelect = (m: Material) => {
        setSelectedMaterial(m);
        setQuery(`${m.idArticulo}${m.lote ? ` · ${m.lote}` : ''}${m.descripcion ? ` · ${m.descripcion}` : ''}`);
        setDropdownVisible(false);
        Keyboard.dismiss();
    };

    // Guardar
    const handleSave = () => {
        if (!selectedMaterial) {
            Alert.alert('Falta material', 'Selecciona un material en el buscador.');
            return;
        }
        if (!fecha) {
            Alert.alert('Falta fecha', 'Indica una fecha válida (YYYY-MM-DD).');
            return;
        }

        const nuevoMaterial: Material = {
            idArticulo: selectedMaterial.idArticulo,
            lote: selectedMaterial.lote ?? undefined,
            descripcion: selectedMaterial.descripcion ?? undefined,
            cantidad: selectedMaterial.cantidad ?? 1,
            precio: selectedMaterial.precio ?? 0,
            id: selectedMaterial.id,
        };

        onSave?.(nuevoMaterial);
        navigation.goBack();
    };

    // Render del item del dropdown
    const renderItem = ({ item }: { item: Material }) => (
        <TouchableOpacity onPress={() => handleSelect(item)} style={styles.itemRow}>
            <Text style={styles.itemTitle}>{item.idArticulo}</Text>
            {!!item.lote && <Text style={styles.itemMeta}>Lote: {item.lote}</Text>}
            {!!item.descripcion && <Text style={styles.itemDesc}>{item.descripcion}</Text>}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Agregar material</Text>

            {/* BUSCADOR / AUTOCOMPLETE */}
            <Text style={styles.label}>Material</Text>
            <View style={styles.comboboxWrapper}>
                <TextInput
                    ref={inputRef}
                    value={query}
                    onChangeText={text => {
                        setQuery(text);
                        setDropdownVisible(true);
                        setSelectedMaterial(null); // invalida selección previa si el usuario vuelve a teclear
                    }}
                    onFocus={() => setDropdownVisible(true)}
                    placeholder="Buscar por id, lote o descripción"
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
                                keyExtractor={(m, i) => `${m.idArticulo}-${m.lote ?? 'NL'}-${i}`}
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

            <Text style={styles.label}>Cantidad</Text>
            <TextInput
                style={styles.input}
                value={cantidad}
                onChangeText={setCantidad}
                keyboardType={Platform.select({ ios: 'numeric', android: 'numeric' })} />

            {/* FECHA */}
            <Text style={styles.label}>Fecha</Text>
            <TextInput
                style={styles.input}
                value={fecha}
                onChangeText={setFecha}
                placeholder="YYYY-MM-DD"
                keyboardType={Platform.select({ ios: 'numbers-and-punctuation', android: 'numeric' })}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                    Alert.alert('Descartar Material', '¿Seguro que quieres descartar?', [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() },
                    ]);
                }}
            >
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
        height: 44,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: 'white',
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
    },
    itemDesc: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
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
    emptyState: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    emptyText: {
        color: '#64748b',
    },
});
