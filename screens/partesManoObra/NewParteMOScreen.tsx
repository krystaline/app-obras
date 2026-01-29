// CrearParteMOScreen.tsx (con renderizado de materiales)
import React, { useState } from 'react';

import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainTabParamList } from '../../App';
import { apiService } from '../../config/apiService';
import { Oferta, ManoDeObra, Material, ParteMOEnviar, VehiculoEnviarDTO } from '../../config/types';
import { Ionicons } from '@expo/vector-icons';

// Define the type for the route prop
type CrearParteMOScreenProps = StackScreenProps<MainTabParamList, 'CrearParteMO'>;



export default function CrearParteMOScreen({ route, navigation }: CrearParteMOScreenProps) {
    const { oferta, proyecto, user, nPartes, accessToken } = route.params as {
        oferta: Oferta;
        proyecto: string;
        user: any;
        nPartes: number,
        accessToken: string;
    };

    const idOferta = oferta.idOferta;
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<string>('');

    const [desplazamientos, setDesplazamientos] = useState<VehiculoEnviarDTO[]>([]);
    const [manosDeObra, setManosDeObra] = useState<ManoDeObra[]>([]);
    const [materiales, setMateriales] = useState<Material[]>([]);


    const handleSubmit = async () => {
        const now = new Date();
        const fechaFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const enviar: ParteMOEnviar = {
            idParteMO: `${nPartes}`,
            idProyecto: proyecto,
            desplazamientos: desplazamientos,
            idOferta: idOferta,
            materiales: materiales,
            usuario: user.id,
            fecha: fechaFormatted,
            comentarios: comments,
            estado: "",
            accion: "",
            manosdeobra: manosDeObra,
            creation_date: new Date().toLocaleString(),
        };

        try {
            const response = await apiService.createParteMO(accessToken, enviar, user.id);
            if (response.success) {
                Alert.alert(
                    'Éxito',
                    response.message || 'Parte de Mano de Obra creado correctamente',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.goBack();
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('error al crear parte MO');
            Alert.alert('Error al crear el parte de Mano de Obra');
        }
    };

    const handleCancel = () => {
        Alert.alert('Descartar Parte Mano de Obra', '¿Estás seguro de que quieres descartar este parte?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Descartar',
                onPress: () => navigation.goBack(),
                style: 'destructive',
            },
        ]);
    };

    const handleAddDesplazamiento = (nuevoDesplazamiento: VehiculoEnviarDTO) => {
        setDesplazamientos(prev => [...prev, nuevoDesplazamiento]);
    };
    const handleAddMO = (nuevoMO: ManoDeObra) => {
        setManosDeObra(prev => [...prev, nuevoMO]);
    };
    const handleAddMaterial = (nuevoMaterial: Material) => {
        setMateriales(prev => [...prev, nuevoMaterial]);
    };

    const handleNewDesplazamiento = () => {
        navigation.navigate('CrearDesplazamiento', { onSave: handleAddDesplazamiento, accessToken, user });
    };
    const handleNewManoDeObra = () => {
        navigation.navigate('CrearMO', { onSave: handleAddMO });
    };
    const handleNewMaterial = () => {
        navigation.navigate('AgregarMaterial', { onSave: handleAddMaterial, accessToken, user });
    };

    // ======== MATERIAL: eliminar con confirmación ========
    const handleMaterialPress = (mat: Material, index: number) => {
        const label = [mat.idArticulo, mat.lote, mat.descripcion].filter(Boolean).join(' · ');
        Alert.alert('Eliminar material', `¿Seguro que quieres eliminar «${label}»?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => handleRemoveMaterialByIndex(index),
            },
        ]);
    };

    const handleRemoveMaterialByIndex = (index: number) => {
        setMateriales(prev => prev.filter((_, i) => i !== index));
    };

    // ======== RENDER LISTAS ========
    const renderDesplazamientos = (items: VehiculoEnviarDTO[]) => {
        return items.map(desp => (
            <TouchableOpacity key={desp.id} onPress={() => {
                Alert.alert('Eliminar Desplazamiento', `¿Eliminar ${desp.matricula}?`, [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: () => setDesplazamientos(s => s.filter(x => x.id.toString() !== desp.id.toString()))
                    },
                ]);
            }}>
                <View style={styles.rowItem}>
                    <View style={styles.rowPill}><Ionicons style={styles.rowIcon} name="car" /><Text
                        style={styles.rowText}>{desp.matricula}</Text></View>
                    <View style={styles.rowPill}><Ionicons style={styles.rowIcon} name="map" /><Text
                        style={styles.rowText}>{desp.distancia} km</Text></View>
                    <View style={styles.rowPill}><Ionicons style={styles.rowIcon} name="calendar" /><Text
                        style={styles.rowText}>{desp.fecha}</Text></View>
                </View>
            </TouchableOpacity>
        ));
    };

    const renderManosDeObra = (items: ManoDeObra[]) => {
        return items.map(m => (
            <TouchableOpacity key={m.idManoObra} onPress={() => {
                Alert.alert('Eliminar Mano de obra', `¿Eliminar ${m.accion}?`, [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: () => setManosDeObra(s => s.filter(x => x.idManoObra !== m.idManoObra))
                    },
                ]);
            }}>
                <View style={styles.rowItem}>
                    <Text style={[styles.rowText, styles.bold]}>Acción: {m.accion}</Text>
                </View>
            </TouchableOpacity>
        ));
    };

    const renderMateriales = (items: Material[]) => {
        return items.map((mat, index) => {
            const key = `${mat.idArticulo}-${mat.lote ?? 'SINLOTE'}-${index}`;
            return (
                <TouchableOpacity key={key} onPress={() => handleMaterialPress(mat, index)}>
                    <View style={styles.rowItem}>
                        <View style={styles.rowPill}>
                            <Ionicons style={styles.rowIcon} name="cube" />
                            <Text style={[styles.rowText, styles.bold]}>{mat.idArticulo}</Text>
                        </View>
                        {!!mat.lote && (
                            <View style={styles.rowPill}>
                                <Ionicons style={styles.rowIcon} name="pricetag" />
                                <Text style={styles.rowText}>{mat.lote}</Text>
                            </View>
                        )}
                        {!!mat.cantidad && (
                            <View style={styles.rowPill}>
                                <Ionicons style={styles.rowIcon} name="layers" />
                                <Text style={styles.rowText}>{mat.cantidad}</Text>
                            </View>
                        )}
                        {!!mat.descripcion && (
                            <View style={[styles.rowPill, { flexBasis: '100%', marginTop: 6 }]}>
                                <Ionicons style={styles.rowIcon} name="information-circle" />
                                <Text style={styles.rowText}>{mat.descripcion}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            );
        });
    };

    // ======== UI ========
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.bigContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Crear nuevo parte</Text>
            </View>

            <ScrollView style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información:</Text>
                    <Text style={styles.text}><Text style={styles.bold}>ID Proyecto: </Text>{proyecto}</Text>
                    <Text style={styles.text}><Text style={styles.bold}>ID Oferta: </Text>{idOferta}</Text>
                    <Text style={styles.text}><Text style={styles.bold}>Usuario: </Text>{user.displayName}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materiales</Text>
                    <TouchableOpacity onPress={handleNewMaterial}>
                        <Text style={styles.addLineButton}>➕ Agregar material</Text>
                    </TouchableOpacity>
                    {renderMateriales(materiales)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mano de obra</Text>
                    <TouchableOpacity onPress={handleNewManoDeObra}>
                        <Text style={styles.addLineButton}>➕ Agregar nuevo</Text>
                    </TouchableOpacity>
                    {renderManosDeObra(manosDeObra)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Desplazamientos</Text>
                    <TouchableOpacity onPress={handleNewDesplazamiento}>
                        <Text style={styles.addLineButton}>➕ Agregar despl.</Text>
                    </TouchableOpacity>
                    {renderDesplazamientos(desplazamientos)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Comentarios</Text>
                    <TextInput
                        style={styles.commentsInput}
                        multiline
                        numberOfLines={4}
                        placeholder="Añade tus comentarios aquí..."
                        value={comments}
                        onChangeText={setComments}
                    />
                </View>

                <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                    {loading ? <ActivityIndicator size="small" color="white" /> :
                        <Text style={styles.submitButtonText}>Enviar Parte</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    // ===== CONTENEDOR Y CABECERA =====
    bigContainer: {
        paddingTop: 50,
        backgroundColor: '#f8f8f8',
        flex: 1,
        paddingHorizontal: 12,

    },
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        paddingTop: 12,
    },
    header: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
    },

    // ===== SECCIONES =====
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    text: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    bold: {
        fontWeight: 'bold',
        color: '#333',
    },

    // ===== BOTONES DE LÍNEA (agregar elemento) =====
    addLineButton: {
        position: 'absolute',
        right: 0,
        top: -32,
        paddingVertical: 4,
        paddingHorizontal: 9,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        borderColor: '#cbd5e1',
        borderWidth: 1,
        fontSize: 14,
        color: '#0f172a',
    },

    // ===== LISTAS (materiales, MO, desplazamientos) =====
    rowItem: {
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 10,
    },
    rowPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#e7e7e7',
        borderRadius: 9999,
    },
    rowIcon: {
        fontSize: 18,
        color: '#4c4c4c',
    },
    rowText: {
        fontSize: 14,
        color: '#333',
    },

    // ===== COMENTARIOS =====
    commentsInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        height: 100,
        textAlignVertical: 'top',
        color: '#333',
        backgroundColor: '#fafafa',
    },

    // ===== BOTONES DE ACCIÓN =====
    button: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        backgroundColor: '#5bbd6f',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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
});
