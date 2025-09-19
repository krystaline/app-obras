// CrearParteMOScreen.tsx
import React, {useState, useEffect} from 'react';

import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView, Platform
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {MainTabParamList} from "../../App";
import {
    apiService,
} from "../../config/apiService";
import {Oferta, Desplazamiento, ManoDeObra} from "../../config/types";
import SelectDropdown from 'react-native-select-dropdown'

import CustomSelect from "../../components/CustomSelect";
import {Ionicons} from "@expo/vector-icons";


// Define the type for the route prop
type CrearParteMOScreenProps = StackScreenProps<MainTabParamList, 'CrearParteMO'>;

export type ParteMOEnviar = {
    idParteMO: string,
    idProyecto: string,
    idOferta: number,
    usuario: any,
    materiales: { id: number; title: string; }[],
    desplazamientos: Desplazamiento[],
    manosdeobra: ManoDeObra[],
    comentarios: string,
    fecha: string
    estado: string | null
}

export default function CrearParteMOScreen({route, navigation}: CrearParteMOScreenProps) {
    // Destructuring parameters passed from the previous screen
    const {oferta, proyecto, user, accessToken} = route.params as {
        oferta: Oferta,
        proyecto: string, user: any, accessToken: string
    };

    const idOferta = oferta.idOferta;
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<string>('');
    const [numeroMateriales, setNumeroMateriales] = useState(0)
    const [numeroDesplazamientos, setNumeroDesplazamientos] = useState(0)

    const [desplazamientos, setDesplazamientos] = useState<Desplazamiento[]>([]);
    const [manosDeObra, setManosDeObra] = useState<ManoDeObra[]>([])

    console.log(oferta)

    const materiales = [
        {id: 1, title: 'material 1'},
        {id: 2, title: 'material 2'}
    ]


    const handleSubmit = async () => {
        const enviar: ParteMOEnviar = {
            idParteMO: `${idOferta}-1`,
            idProyecto: proyecto,
            desplazamientos: desplazamientos,
            idOferta: idOferta,
            materiales: materiales,
            usuario: user.id,
            fecha: new Date().toLocaleString(),
            comentarios: comments,
            estado: null,
            manosdeobra: manosDeObra
        }

        try {
            const response = await apiService.createParteMO(accessToken, enviar)
            console.log(enviar)
            if (response.success) {
                if (response.message != null) {
                    Alert.alert(response.message)
                }
            }
        } catch (error) {
            console.error("error al crear parte MO")
            Alert.alert("error")
        }
    }

    const handleCancel = () => {
        // Si decides no usar el headerLeft, puedes añadir un botón aquí
        Alert.alert(
            "Descartar Parte Mano de Obra",
            "¿Estás seguro de que quieres descartar este parte?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Descartar",
                    onPress: () => {
                        // Limpiar estado si es necesario y volver atrás
                        navigation.goBack();
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleNewMaterial = () => {
        setNumeroMateriales(numeroMateriales + 1)
    }

    const handleAddDesplazamiento = (nuevoDesplazamiento: Desplazamiento) => {
        setDesplazamientos(prev => [...prev, nuevoDesplazamiento]);
    };
    const handleAddMO = (nuevoMO: ManoDeObra) => {
        setManosDeObra(prev => [...prev, nuevoMO])
    }

// Modifica la función de navegación
    const handleNewDesplazamiento = () => {
        // Al navegar, le pasamos la función `handleAddDesplazamiento` como un parámetro
        navigation.navigate('CrearDesplazamiento', {
            onSave: handleAddDesplazamiento,
        });
    };
    const handleNewManoDeObra = () => {
        navigation.navigate('CrearMO', {
            onSave: handleAddMO,
        })
    }
    const handleDesplazamientoPress = (desp: Desplazamiento) => {
        Alert.alert(
            "Eliminar s Desplazamiento",
            `¿Estás seguro de que quieres eliminar el desplazamiento con matrícula ${desp.matricula}?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: () => handleRemoveDesplazamiento(desp.id),
                    style: "destructive"
                }
            ],
            {cancelable: true}
        );
    };
    const handleMOPress = (m: ManoDeObra) => {
        Alert.alert(
            "Eliminar M",
            `¿Estás seguro de que quieres eliminar el desplazamiento con matrícula ${m.id}?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: () => handleRemoveDesplazamiento(m.id),
                    style: "destructive"
                }
            ],
            {cancelable: true}
        );
    };

    const handleRemoveMaterial = () => {
        setNumeroDesplazamientos(numeroDesplazamientos - 1)
    }
    const handleRemoveDesplazamiento = (id: number) => {
        setDesplazamientos(desplazamientos.filter(desp => desp.id !== id));
    };


    const renderDesplazamientos = (desplazamientos: Desplazamiento[]) => {
        return desplazamientos.map((desp, index) => (
            // Envuelve todo el componente con TouchableOpacity
            <TouchableOpacity key={desp.id} onPress={() => handleDesplazamientoPress(desp)}>
                <View style={styles.desplazamientoItem}>
                    <View style={styles.desplazamientoColumna}>
                        <Ionicons style={styles.desplazamientoIcon} name={'car'}/>
                        <Text style={styles.desplazamientoText}>{desp.matricula}</Text>
                    </View>
                    <View style={styles.desplazamientoColumna}>
                        <Ionicons style={styles.desplazamientoIcon} name={'map'}/>
                        <Text style={styles.desplazamientoText}>{desp.distancia}km</Text>
                    </View>
                    <View style={styles.desplazamientoColumna}>
                        <Ionicons style={styles.desplazamientoIcon} name={'calendar'}/>
                        <Text style={styles.desplazamientoText}>{desp.fecha}</Text>
                    </View>
                    {/* Puedes mantener o quitar el botón de la papelera si quieres.
                Si lo mantienes, la alerta se activará desde el botón, no desde toda la fila.
                Si lo quitas, toda la fila es "tocable" para borrar.
                En el ejemplo, he quitado el botón para que se active al tocar en cualquier parte de la fila. */}
                </View>
            </TouchableOpacity>
        ));
    };
    const renderManosDeObra = (manos: ManoDeObra[]) => {
        return manos.map((m, index) => (
            // Envuelve todo el componente con TouchableOpacity
            <TouchableOpacity key={m.id} onPress={() => handleMOPress(m)}>
                <View style={styles.desplazamientoItem}>
                    <Text style={styles.boldText}>tuki {m.accion}</Text>
                    {/* Puedes mantener o quitar el botón de la papelera si quieres.
                Si lo mantienes, la alerta se activará desde el botón, no desde toda la fila.
                Si lo quitas, toda la fila es "tocable" para borrar.
                En el ejemplo, he quitado el botón para que se active al tocar en cualquier parte de la fila. */}
                </View>
            </TouchableOpacity>
        ));
    };

    const renderMateriales = (numeroMateriales: number, materiales: {}) => {
        const dropdowns = [];
        for (let n = 0; n < numeroMateriales; n++) {
            dropdowns.push(
                <View style={styles.dropdownContainer}>
                    <SelectDropdown
                        key={n} // Crucial for lists in React/React Native
                        data={materiales}
                        onSelect={(selectedItem, index) => {
                            console.log("Selected item:", selectedItem, "at index:", index);
                            // Add your logic here for what happens when an item is selected
                            // For example, you might want to update state based on the selection.
                        }}
                        renderButton={(selectedItem, isOpened) => {
                            return (
                                <View style={styles.dropdownButtonStyle}>
                                    <Text style={styles.dropdownButtonTxtStyle}>
                                        {(selectedItem && selectedItem.title) || `Selecciona material ${n + 1}`}
                                    </Text>
                                    <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'}
                                              style={styles.dropdownButtonArrowStyle}/>
                                </View>
                            );
                        }}
                        renderItem={(item, index, isSelected) => {
                            return (
                                <View
                                    style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
                                    <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                                </View>
                            );
                        }}
                        // You might want to add defaultButtonText or other props here
                    />
                    <TextInput keyboardType={'numeric'} style={styles.quantityInput}/>
                </View>
            );
        }
        return dropdowns; // Return the array of dropdown components
    };

    // @ts-ignore
    return (

        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"} // 'padding' para iOS, 'height' para Android
            style={styles.container} // Asegúrate de que tu container tenga flex: 1
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Crear nuevo parte</Text>
            </View>
            <ScrollView style={styles.container}>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información:</Text>
                    <Text style={styles.text}><Text style={styles.boldText}>ID Proyecto: </Text>{proyecto}</Text>
                    <Text style={styles.text}><Text style={styles.boldText}>ID Oferta: </Text>{idOferta}</Text>
                    <Text style={styles.text}><Text style={styles.boldText}>Usuario: </Text>{user.displayName}</Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materiales</Text>
                    <TouchableOpacity onPress={handleNewMaterial}>
                        <Text style={styles.addLineButton}>➕ Agregar material</Text>
                    </TouchableOpacity>
                    {renderMateriales(numeroMateriales, materiales)}

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

                <TouchableOpacity
                    style={[styles.button, styles.submitButton]}
                    onPress={handleSubmit}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="white"/>
                    ) : (
                        <Text style={styles.submitButtonText}>Enviar Parte</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({
    desplazamientoItem: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginBottom: 10,
        display: 'flex',
        justifyContent: 'space-around',
        flexDirection: "row",
    },
    desplazamientoText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    desplazamientoColumna: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 3,
    },
    desplazamientoIcon: {
        fontSize: 25,
        color: '#4c4c4c',
    },
    removeButton: {
        padding: 5,
    },
    header: {
        marginTop: 20,
    },
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f8f8f8',
        marginTop: 20,
        marginBottom: 20,
    },
    menuButton: {
        marginRight: 15,
        padding: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
        marginBottom: 120,
    },
    loginButton: {
        backgroundColor: '#5BBDB3',
        paddingVertical: 12, // Use paddingVertical for better control
        paddingHorizontal: 20, // Use paddingHorizontal
        borderRadius: 8,
        margin: 20,
        alignSelf: 'center',
    },
    loginButtonText: {
        color: '#f5f5f5',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    button: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdownContainer: {
        display: "flex",
        flexDirection: "row",
        gap: 5,
        alignItems: 'center'
    },
    cancelButton: { // Estilos para un botón de cancelar en el cuerpo de la pantalla
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
    submitButton: {
        backgroundColor: '#3EB1A5',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight:
            '600',
    },
    disabledButton: {
        backgroundColor: '#94a3b8',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addLineButton: {
        position: 'absolute',
        right: 0,
        top: -32,
        padding: 5,
        paddingHorizontal: 9,
        borderRadius: 12,
        backgroundColor: '#f8f8f8',
        borderColor: '#dadad2',
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    arrowBack: {
        zIndex: 999,
        fontSize: 30,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        width: '100%',
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    boldText: {
        fontWeight: 'bold',
        color: '#333',
    },
    lineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    lineHeader: {
        flex: 1,
        width: '100%',
        fontSize: 12,
        marginRight: 5,
    },

    lineName: {
        flex: 2, // Takes more space
        fontSize: 12,
        marginRight: 10,
        color: '#333',
    },
    quantityInput: {
        height: 40,
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingVertical: 10,
        fontSize: 20,
        textAlign: 'center',
    },
    quantityInput2: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingVertical: 10,
        fontSize: 12,
        textAlign: 'center',
    },
    textinput: {
        flex: 4.5,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 8,
        fontSize: 16,
        margin: 4,
    },
    unitText: {
        flex: 0.8, // Takes even less space
        fontSize: 16,
        marginLeft: 10,
        color: '#777',
    },
    commentsInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        height: 100, // Fixed height for comments input
        textAlignVertical: 'top', // Aligns text to the top for multiline input
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 20,
    },
    dropdownButtonStyle: {
        width: 230,
        height: 40,
        margin: 12,
        marginHorizontal: 0,
        backgroundColor: '#efefef',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#121212',
    },
    dropdownButtonArrowStyle: {
        fontSize: 28,
    },
    dropdownButtonIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
    dropdownMenuStyle: {
        backgroundColor: '#dc4545',
        borderRadius: 8,
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#252525',
    },
    dropdownItemIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
});