// CrearParteScreen.tsx
import React, {useState, useEffect} from 'react';
import SignaturePad from "../components/SignaturePad";

import {
    View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {MainTabParamList} from "../App";
import {
    apiService,
} from "../config/apiService";
import {LineaOferta, LineaPedidoPDF, Oferta, ParteImprimirPDF} from "../config/types";


// Define the type for the route prop
type CrearParteScreenProps = StackScreenProps<MainTabParamList, 'CrearParte'>;


export default function CrearParteScreen({route, navigation}: CrearParteScreenProps) {
    // Destructuring parameters passed from the previous screen
    const {oferta, proyecto, lineas, user, accessToken} = route.params as {
        oferta: Oferta,
        proyecto: string, lineas: LineaOferta[], user: any, accessToken: string
    };
    const [loading, setLoading] = useState(false);
    const [signature, setSignature] = useState<string>("");
    const [isScrollingEnabled, setIsScrollingEnabled] = useState(true);

    // State to hold the quantities for each line.
    // We use a Record<string, string> where keys are line IDs/names and values are their their quantities.
    const [lineQuantities, setLineQuantities] = useState<Record<string, string>>({});

    // State for the comments input
    const [comments, setComments] = useState<string>('');
    const handleSignatureSaved = (signatureData: string) => {
        setSignature(signatureData);
        setSignaturePadVisibility(false); // <--- Add this line to hide the signature pad
    };

    const handleDrawingStatusChange = (isDrawing: boolean) => {
        setIsScrollingEnabled(!isDrawing);
    };
    // Effect to initialize lineQuantities when the component mounts or lines change
    useEffect(() => {
        const initialQuantities: Record<string, string> = {};
        lineas.forEach(linea => {
            // Use linea.id as the key if available, otherwise linea.nombre as a fallback.
            // Ensure the key used here matches the one used in handleQuantityChange and ºmit.
            if (linea.ppcl_Certificado == 0) {
                initialQuantities[linea.ocl_idlinea ? linea.ocl_idlinea : 0] = '';
            }
        });
        setLineQuantities(initialQuantities);
    }, [lineas]);

    function parseDate(datestring: Date) {
        const date = new Date(datestring);

        // Check if the date is valid. New Date() can return an "Invalid Date" object.
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date string provided.");
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;

    }

    const [lastIdParte, setLastIdParte] = useState(0);
    React.useEffect(() => {
        apiService.getLastPartId(accessToken).then(response => {
            setLastIdParte(response.data)
        }).catch(error => {
            console.error("Error getting last id:", error);
        });
    }, [lastIdParte])

    // Handler for quantity changes in each line input
    const handleQuantityChange = (lineId: number | string, value: string) => {
        setLineQuantities(prevQuantities => ({
            ...prevQuantities,
            [lineId]: value,
        }));
    };

    const [signaturePadVisibility, setSignaturePadVisibility] = useState(false);
    const showSignaturePad = () => {
        setSignaturePadVisibility(true);
    }

    // Handler for form submission
    const handleSubmit = async () => {
        // Construct the data payload
        const lineasConCantidad = lineas.filter(linea =>
            lineQuantities[linea.ocl_idlinea ? linea.ocl_idlinea : ""] &&
            lineQuantities[linea.ocl_idlinea ? linea.ocl_idlinea : ""].trim() !== ""
        );

        const lineasParaBackend: LineaPedidoPDF[] = [];
        console.log(user)
        for (const linea of lineasConCantidad) {
            const cantidadStr = lineQuantities[linea.ocl_idlinea!.toString()];
            const cantidadNum = parseInt(cantidadStr, 10);

            if (isNaN(cantidadNum)) {
                Alert.alert('Error', `Cantidad inválida para la línea ${linea.occ_descrip}. Por favor, ingrese un número.`);
                return; // Stop submission if any quantity is invalid
            }
            if (cantidadNum <= 0) {
                Alert.alert('Error', `Cantidad no puede ser 0 o negativa para la línea ${linea.occ_descrip}.`);
                return; // Stop submission if quantity is zero or negative
            }


            lineasParaBackend.push({
                id: parseInt(linea.ocl_idlinea!.toString()),
                capitulo: 1,
                idArticulo: linea.ocl_IdArticulo!,
                id_parte: lastIdParte,
                id_oferta: parseInt(linea.ocl_IdOferta!.toString()),
                descripcion: linea.ocl_Descrip || 'Sin Descripción',
                unidades_totales: linea.ocl_UnidadesPres!, // es esta?
                medida: linea.ocl_tipoUnidad ? linea.ocl_tipoUnidad : "uds.", //linea.ppcl_UnidadMedida?.toString()!,
                unidades_puestas_hoy: cantidadNum,
                ya_certificado: 0,
                cantidad: linea.ppcl_cantidad ? linea.ppcl_cantidad : 0,
            });
        }

        // todo aqui tengo que crear el parte que se imprimirá (sin_nombre_app)
        const dataToSend: ParteImprimirPDF = {
            nParte: lastIdParte!,
            proyecto: proyecto,
            oferta: oferta.idOferta.toString(),
            jefe_equipo: user['displayName'],
            telefono: user['mobilePhone'],
            fecha: new Date().toISOString().slice(0, 10),
            contacto_obra: oferta.cliente!,
            comentarios: comments,
            lineas: lineasParaBackend,
            idoferta: oferta.idOferta,
            firma: signature,
            pdf: null
        }


        try {
            console.log(dataToSend)
            const response = await apiService.createParte(dataToSend, accessToken)
            if (response.success) {
                Alert.alert('Éxito', 'Parte creado correctamente.');
                navigation.goBack(); // Navigate back after the successful submission
            } else {
                const errorData = await response.data.json();
                Alert.alert('Error', `Error al crear el parte: ${errorData.message || response.message}`);
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            Alert.alert('Error', 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
        }
    };

    return (
        <ScrollView style={styles.container}
                    scrollEnabled={isScrollingEnabled}>
            {/* Section: Displayed Project Data */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datos del Proyecto</Text>
                {/* Displays the offer name */}
                <Text style={styles.text}>
                    <Text style={styles.boldText}>Nombre proyecto:</Text> {proyecto || 'N/A'}
                </Text>
                {/* Displays the project date */}
                <Text style={styles.text}>
                    <Text style={styles.boldText}>Contacto del Proyecto:</Text> {oferta.cliente || 'N/A'}
                </Text>
                {/* Displays the project contact */}
                <Text style={styles.text}>
                    <Text style={styles.boldText}>Fecha oferta:</Text> {(oferta.fecha)?.substring(0, 10) || 'N/A'}
                </Text>

            </View>

            <View style={styles.separator}/>

            {/* Section: Line Items Input */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Líneas a Introducir</Text>

                {/* Maps through each line to create input fields */}
                {lineas.map((linea) => {
                        console.log(linea)

                        if (linea.ocl_Cantidad === 0 || linea.ppcl_cantidad < linea.ocl_Cantidad) {
                            return (
                                <View key={linea.ocl_idlinea} style={styles.lineItem}>
                                    {/* Displays the line name */}
                                    <Text style={styles.lineName}>{linea.ocl_Descrip}</Text>
                                    {/* Input field for the quantity of the line */}
                                    <TextInput
                                        style={styles.quantityInput}
                                        keyboardType="numeric"
                                        placeholder="Cantidad"
                                        value={lineQuantities[linea.ocl_idlinea ? linea.ocl_idlinea : ""] || ''}
                                        onChangeText={(value) => handleQuantityChange(linea.ocl_idlinea ? linea.ocl_idlinea : "", value)}
                                    />
                                    {/* Displays the unit of measurement for the quantity */}
                                    <Text
                                        style={styles.unitText}>{linea.ppcl_cantidad ? linea.ppcl_cantidad : 0} / {linea.ocl_UnidadesPres}{linea.ocl_tipoUnidad}</Text>
                                </View>
                            )
                        } else {
                            return null
                        }
                    }
                )}


                <Text>Líneas adicionales</Text>
                <View key={3} style={styles.lineItem}>
                    <TextInput style={styles.textinput}
                               placeholder="Descripción actividad"></TextInput>

                    <TextInput
                        style={styles.quantityInput2}
                        keyboardType="numeric"
                        placeholder="Cantidad"
                    />
                    <Text style={styles.unitText}>{}</Text>
                </View>
            </View>

            <View style={styles.separator}/>

            {/* Section: Comments Input */
            }
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Comentarios</Text>
                {/* Input field for general comments */}
                <TextInput
                    style={styles.commentsInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Añade tus comentarios aquí..."
                    value={comments}
                    onChangeText={setComments}
                />
            </View>

            {/* signature Button */}
            <TouchableOpacity
                style={[styles.loginButton]} // Apply disabled style
                onPress={showSignaturePad}
            >
                <Text style={styles.loginButtonText}>Firmar documento</Text>
            </TouchableOpacity>
            <SignaturePad
                onDrawingStatusChange={handleDrawingStatusChange}
                onSignatureSaved={handleSignatureSaved}
                visibility={signaturePadVisibility} // Ensure this prop is passed
            />

            {/* Botones */
            }
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.submitButton, signature.length === 0 && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={signature.length === 0}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="white"/>
                    ) : (
                        <Text style={styles.submitButtonText}>Guardar Parte</Text>
                    )}
                </TouchableOpacity>
            </View>

        </ScrollView>
    )
        ;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
        marginTop: 40,
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
    cancelButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '600',
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
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
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
        flex: 0.5, // Takes less space
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingVertical: 10,
        fontSize: 12,
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
});