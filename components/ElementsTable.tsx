"use client"

import React, {useState} from "react"
import {ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View,} from "react-native"
import MyCustomSelect from "./CustomSelect";
import {apiService} from "../config/apiService";

"use client"

interface ElementsTableProps {
    user?: { displayName: string, mobilePhone: string, id: string };
    accessToken: string;
    onProjectSelect: (project: CustomSelectItem | null) => void;
    onElementsChange: (elements: ElementRow[]) => void;
    ascensorValue: number; // Recibir estado de ascensor
    setAscensorValue: (value: number) => void; // Recibir setter de ascensor
    ascensorValue1: number; // Recibir estado de ascensor 1
    setAscensorValue1: (value: number) => void; // Recibir setter de ascensor 1
    setFechaParte: (value: string) => void
}

// Define la estructura para una fila de actividad
interface ElementRow {
    id: number;
    impValue: string; // Para el tipo de impermeabilización
    description: string; // La descripción base de la actividad
    quantity: string;
    unit: string;
    // size?: string; // Si no se usa, es mejor quitarlo
}

// Define la estructura para los elementos de MyCustomSelect (proyectos)
interface CustomSelectItem {
    id: string;
    title: string;
    contact: {
        id: string;
        title: string;
        signature: string;
        phone: number;
    };
    teamManager: { // Asegúrate de que esto coincida con la interfaz TeamManager completa
        id: string;
        name: string;
    };
    createdAt: string;
}

// Define la estructura para una fila de actividad
interface ElementRow {
    id: number;
    impValue: string; // Para el tipo de impermeabilización
    description: string; // La descripción base de la actividad
    quantity: string;
    unit: string;
    // size?: string; // Si no se usa, es mejor quitarlo
}

// Define la estructura para los elementos de MyCustomSelect (proyectos)
interface CustomSelectItem {
    id: string;
    title: string;
    contact: {
        id: string;
        title: string;
        signature: string;
        phone: number;
    };
    teamManager: { // Asegúrate de que esto coincida con la interfaz TeamManager completa
        id: string;
        name: string;
    };
    createdAt: string;
}

// Define la estructura para el contacto dentro del proyecto
interface CustomContactItem {
    id: string;
    title: string;
    signature: string;
    phone: number;
}

// Define la estructura para el contacto dentro del proyecto
interface CustomContactItem {
    id: string;
    title: string;
    signature: string;
    phone: number;
}


export default function ElementsTable({
                                          user,
                                          accessToken,
                                          onProjectSelect,
                                          onElementsChange,
                                          ascensorValue,
                                          setAscensorValue,
                                          ascensorValue1,
                                          setAscensorValue1,
                                          setFechaParte
                                      }: ElementsTableProps) {



    const [projectsLoading, setProjectsLoading] = useState(true);
    const [contactsLoading, setContactsLoading] = useState(true);

    const [listaContactosObra, setListaContactosObra] = useState<CustomContactItem[]>();
    const [listaProyectos, setListaProyectos] = useState<CustomSelectItem[]>();

    const listaElementosAscensores = [
        {id: 'grande', title: 'Grande'}, // ID y title consistentes con CustomSelectItem
        {id: 'mediano', title: 'Mediano'},
        {id: 'pequeno', title: 'Pequeño'},
    ];

    // Nuevo estado local para la selección del proyecto en el <MyCustomSelect>
    const [localSelectedProject, setLocalSelectedProject] = useState<CustomSelectItem | null>(null);

    // Nuevo estado local para las actividades de la tabla. Se sincronizará con el padre.
    const [localElements, setLocalElements] = useState<ElementRow[]>(() => {
        const predefinedActivities = [
            {id: 1, description: "Suministro y colocación de junta expansiva K-Bar", unit: "metros"},
            {id: 2, description: "Suministro y colocación Krystaline Tubo Inyección", unit: "metros"},
            {id: 3, description: "Inyección de resinas Krystaline Tubo de inyección", unit: "metros"},
            {id: 4, description: "Foso Ascensor", unit: "unidades"},
            {id: 5, description: "Foso Ascensor", unit: "unidades"},
            {id: 6, description: "Arqueta o pozo", unit: "unidades"},
            {id: 7, description: "Visita supervisión", unit: "horas"},
            {id: 8, description: "Refuerzo superficial juntas entre pantallas", unit: "metros"},
            {id: 9, description: "Refuerzo superficial junta Losa - Muro 'Mediacaña'", unit: "metros lineales"},
            {
                id: 10,
                description: "Refuerzo superficial juntas y/o fisuras horizontal y vertical",
                unit: "metros lineales"
            },
            {id: 11, description: "Impermeabilización superficial", unit: "metros²"}, // La palabra clave se añade en CreatePartScreen
            {id: 12, description: "Inyección Losa-muro", unit: "metros"},
            {id: 13, description: "Inyección juntas y fisuras en muros", unit: "metros"},
            {id: 14, description: "Inyección juntas entre pantallas", unit: "metros"},
            {id: 15, description: "Inyección de resinas Krystaline Tubo de inyección", unit: "metros"},
            {id: 16, description: "", unit: ""}, // Fila personalizable
            {id: 17, description: "", unit: ""}  // Fila personalizable
        ];
        return predefinedActivities.map(activity => ({
            id: activity.id,
            impValue: "", // Inicializar impValue
            description: activity.description,
            quantity: "",
            unit: activity.unit,
        }));
    });

    React.useEffect(() => {
        if (accessToken) {
            setProjectsLoading(true);
            setContactsLoading(true);
            apiService.getProyectos(accessToken).then(response => {
                setListaProyectos(response.data);
            }).catch(error => {
                console.error("Error fetching projects:", error);
                setListaProyectos([]);
            }).finally(() => {
                setProjectsLoading(false);
            });

            apiService.getContactos(accessToken).then(response => {
                setListaContactosObra(response.data);
            }).catch(er2 => {
                setListaContactosObra([]);
            }).finally(() => {
                setContactsLoading(false);
            });
        }
    }, [accessToken]);

    // Usar useEffect para notificar al padre cuando localElements cambie
    React.useEffect(() => {
        onElementsChange(localElements);
    }, [localElements, onElementsChange]);

    // Usar useEffect para notificar al padre cuando localSelectedProject cambie
    React.useEffect(() => {
        onProjectSelect(localSelectedProject);
    }, [localSelectedProject, onProjectSelect]);


    const updateElement = (id: number, field: keyof ElementRow, value: string) => {
        setLocalElements((prev) => {
            const updated = prev.map((element) => (element.id === id ? {...element, [field]: value} : element));
            return updated;
        });
    };

    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.numberColumn]}>Nº</Text>
            <Text style={[styles.tableHeaderText, styles.descriptionColumn]}>Actividades</Text>
            <Text style={[styles.tableHeaderText, styles.quantityColumn]}>Cantidad</Text>
            <Text style={[styles.tableHeaderText, styles.unitColumn]}>Unidades</Text>
        </View>
    );

    const handleProjectSelection = (selectedItem: CustomSelectItem) => {
        setLocalSelectedProject(selectedItem); // Actualiza el estado local de la selección
        // onProjectSelect(selectedItem); // Ya no es necesario llamarlo aquí si el useEffect ya lo hace
    };

    if (projectsLoading || contactsLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3EB1A5"/>
                <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.formContainer} >
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Nombre de Proyecto *</Text>
                <MyCustomSelect
                    selectedValue={localSelectedProject} // Usar el estado local para el control del selector
                    items={listaProyectos || []}
                    onSelect={handleProjectSelection} // Manejar la selección localmente
                    placeholder="Selecciona un proyecto"
                />
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>ID Proyecto: <Text
                        style={styles.createdAt}> {localSelectedProject?.id}</Text></Text>
                    <Text style={styles.label}>Fecha: <Text
                        style={styles.createdAt}> {new Date().toLocaleString() + ""}  </Text></Text>
                    <Text style={styles.label}>Teléfono: <Text
                        style={styles.createdAt}> {user?.mobilePhone || 'No disponible'} </Text></Text>
                    <Text style={styles.label}>Contacto obra: <Text
                        style={styles.createdAt}>{localSelectedProject?.contact?.title}</Text></Text>
                </View>
            </View>

            <View style={styles.tableContainer}>
                {renderTableHeader()}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.tableContent}>
                        {localElements.map((element) => {
                            // Construir la descripción a mostrar en la tabla dinámicamente
                            let displayDescription = element.description;
                            if (element.id === 4) {
                                displayDescription = `Foso Ascensor`;
                            } else if (element.id === 5) {
                                displayDescription = `Foso Ascensor`;
                            } else if (element.id === 11) {
                                displayDescription = `Impermeabilización superficial ${element.impValue} Krystaline 1`;
                            }

                            return (
                                <View key={element.id} style={styles.tableRow}>
                                    <View style={styles.numberColumn}>
                                        <Text style={styles.rowNumber}>{element.id}</Text>
                                    </View>
                                    <View style={styles.descriptionColumn}>
                                        {/* Renderizar TextInput solo para las filas personalizadas */}
                                        {(element.id === 16 || element.id === 17) ? (
                                            <TextInput
                                                style={styles.customDescriptionInput}
                                                value={element.description}
                                                onChangeText={(value) => updateElement(element.id, "description", value)}
                                                placeholder="Descripción personalizada"
                                                placeholderTextColor="#94a3b8"
                                            />
                                        ) : (
                                            <Text style={styles.predefinedDescription}>{displayDescription}</Text>
                                        )}

                                        {/* Selectores de Ascensor */}
                                        {element.id === 4 && (
                                            <MyCustomSelect
                                                onSelect={(item) => setAscensorValue(item.id)} // Actualizar el estado del padre
                                                selectedValue={listaElementosAscensores.find(item => item.id === ascensorValue) || null}
                                                items={listaElementosAscensores}
                                                placeholder="Tipo"
                                            />
                                        )}
                                        {element.id === 5 && (
                                            <MyCustomSelect
                                                onSelect={(item) => setAscensorValue1(item.id)} // Actualizar el estado del padre
                                                selectedValue={listaElementosAscensores.find(item => item.id === ascensorValue1) || null}
                                                items={listaElementosAscensores}
                                                placeholder="Tipo"
                                            />
                                        )}
                                        {/* Input para ImpValue */}
                                        {element.id === 11 && (
                                            <TextInput
                                                style={styles.impInput}
                                                value={element.impValue}
                                                onChangeText={(value) => updateElement(element.id, "impValue", value)}
                                                placeholder="Blanco | Gris | Losa"
                                                placeholderTextColor="#94a3b8"
                                            />
                                        )}
                                    </View>
                                    <View style={styles.quantityColumn}>
                                        <TextInput
                                            style={styles.quantityInput}
                                            value={element.quantity}
                                            onChangeText={(value) => updateElement(element.id, "quantity", value)}
                                            placeholder="0"
                                            placeholderTextColor="#94a3b8"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={styles.customUnitInput}>
                                        {/* TextInput para unidad en filas personalizadas */}
                                        {(element.id === 16 || element.id === 17) ? (
                                            <TextInput
                                                style={styles.addedUnitInput}
                                                value={element.unit}
                                                onChangeText={(value) => updateElement(element.id, "unit", value)}
                                                placeholder="Unidad"
                                                placeholderTextColor="#94a3b8"
                                            />
                                        ) : (
                                            <Text>{element.unit}</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // --- General Styles ---
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#f8fafc",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#64748b",
    },
    menuButton: {
        padding: 8,
        marginRight: 12,
    },

    // --- Form Styles ---
    formContainer: {
        padding: 1, // Aumentado el padding para mejor espaciado general
    },
    fieldContainer: {
        marginBottom: 16, // Espaciado consistente entre campos
        marginTop: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "600", // Ligeramente más negrita para etiquetas
        color: "#69758a",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#1f2937",
    },
    infoContainer: {
        backgroundColor: "#f1f5f9",
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#3d7979",
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: "#1e293b",
        fontWeight: "600", // Un poco más de peso para los valores
    },
    createdAt: {
        color: "#000810",
        fontWeight: "bold" // Mantenido para este campo específico
    },
    impInput: {
        padding: 2, // Mantener padding para visibilidad
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginTop: 20,
        width: 120,
        height: 30, // Ajustado a un tamaño más común
        maxWidth: 120,
        minWidth: 120,
    },


    // --- Table Styles ---
    tableContainer: {
        backgroundColor: "white",
        borderRadius: 12,
        marginBottom: 24, // Consistencia con infoContainer
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: "700", // Título más destacado
        color: "#1e293b",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#00cdb2", // Color de cabecera más suave y accesible
        paddingVertical: 12,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e0f2f1", // Borde más pronunciado
    },
    tableHeaderText: {
        fontSize: 14,
        fontWeight: "700", // Texto de cabecera más negrita
        color: "#012b2b", // Color que contraste con el fondo de la cabecera
        textAlign: "center",
    },
    tableContent: {
        minWidth: "100%",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 12, // Más padding vertical para mejor legibilidad
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        minHeight: 60,
        alignItems: "center",
    },
    numberColumn: {
        width: 30, // Un poco más de espacio para el número
        alignItems: "center",
        justifyContent: "center",
    },
    descriptionColumn: {
        flex: 2,
        // Eliminado backgroundColor: "red" (asumiendo que era solo para depuración)
        paddingHorizontal: 8,
        width: 100,
    },
    quantityColumn: {
        width: 70, // Ancho ajustado para cantidad
        paddingHorizontal: 3,
        alignItems: 'center', // Centrado para números
    },
    unitColumn: {
        width: 100, // Ancho ajustado para unidad
        paddingHorizontal: 3,
        alignItems: 'center', // Centrado para unidades
    },
    rowNumber: {
        fontSize: 14,
        fontWeight: "500",
        color: "#64748b",
    },
    predefinedDescription: {
        fontSize: 14,
        color: "#1e293b",
        fontWeight: "500",
    },
    customDescriptionInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontSize: 14,
        color: "#1f2937",
        minHeight: 40,
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontSize: 14,
        color: "#1f2937",
        textAlign: "center",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        overflow: "hidden", // Para asegurar que el borderRadius se aplique bien al Picker
    },
    customUnitInput: {
        width: 100, // Ancho consistente con unitColumn
        fontSize: 14,
        textAlign: "center",
        alignItems: "center",
    },
    addedUnitInput:{
        borderColor: "#d1d5db",
        borderRadius: 6,
        width: 100,
        fontSize: 14,
        textAlign: "center",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
    },

    // --- Button Styles ---
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 24, // Espacio superior para separar de otros elementos
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#6b7280",
    },
    submitButton: {
        backgroundColor: "#3b82f6",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "white",
    },
    disabledButton: {
        opacity: 0.6,
    },

    // --- Modal Styles ---
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Fondo semitransparente para el modal
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 12, // Un poco menos redondeado que antes
        padding: 25, // Reducido ligeramente el padding
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '85%', // Ajustado a un porcentaje más común
        maxHeight: '75%', // Permitir que sea un poco más grande
    },
    searchBar: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc', // Color de borde más estándar
        borderRadius: 5,
        marginBottom: 15, // Más espacio debajo del searchBar
    },
});