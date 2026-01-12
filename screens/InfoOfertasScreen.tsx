// InfoOfertasScreen.tsx
import {
    Alert,
    FlatList,
    Image, Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { MainTabParamList } from "../App";
import { apiService } from "../config/apiService";
import React, { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LineaOferta, LineasPorParte, Oferta } from "../config/types";
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from '@expo/vector-icons'; // Si usas Expo, puedes usar este ícono para cerrar
import ImageZoom from 'react-native-image-pan-zoom';

type Tip = {
    id: number | undefined;
    image_name: string;
};
type InfoOfertaProps = StackScreenProps<MainTabParamList, 'InfoOferta'>; // Removed `parte: ParteData` from here
export default function InfoOferta({ route, navigation }: InfoOfertaProps) { // Removed `oferta` from destructuring props
    const { idOferta } = route.params as { idOferta: number }; // Extract oferta from route.params
    const { user } = route.params as { user: any }
    const { accessToken } = route.params as { accessToken: string }
    const [lineas, setLineas] = useState<LineaOferta[]>()
    const [lineasAsignadas, setLineasAsignadas] = useState<LineaOferta[]>()
    const [loading, setLoading] = useState(true)
    const { oferta } = route.params as { oferta: Oferta }
    const [refreshing, setRefreshing] = useState(false)
    const [imagenes, setImagenes] = useState<Tip[]>();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);


    const renderImage = ({ item }: { item: string }) => {
        // 'item' is now a string, e.g., "imagen1.jpg"
        const imageUrl = `${apiService.getBaseUrl()}/api/images/imagenes/${item}`;
        console.log("Image URL to display:", imageUrl);

        return (
            <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => {
                    setSelectedImageUri(imageUrl);
                    setModalVisible(true);
                }}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                />
            </TouchableOpacity>
        );
    };

    const fetchLineasAsignadas = useCallback(() => {
        setRefreshing(true)
        apiService.getLineasParte(idOferta, accessToken).then(response => {
            console.log("lineas asignadas", response.data)
            setLineasAsignadas(response.data);
        }).catch(error => {
            console.error("Error fetching projects:", error);
            Alert.alert("Error", "No se pudieron cargar las líneas del parte."); // Opcional: mostrar un error al usuario
        }).finally(() => {
            setLoading(false);
            setRefreshing(false); // Finaliza el estado de refrescando
        });
    }, [idOferta, accessToken])


    const fetchLineasOferta = useCallback(() => {
        setRefreshing(true); // Inicia el estado de refrescando
        apiService.getLineasOferta(idOferta, accessToken).then(response => {
            setLineas(response.data);
        }).catch(error => {
            console.error("Error fetching projects:", error);
            Alert.alert("Error", "No se pudieron cargar las líneas de la oferta."); // Opcional: mostrar un error al usuario
        }).finally(() => {
            setLoading(false);
            setRefreshing(false); // Finaliza el estado de refrescando
        });
    }, [idOferta, accessToken]); // Dependencias para useCallback

    const fetchImagenesOferta = useCallback(async () => {
        setRefreshing(true);
        try {
            const response = await apiService.getImages(accessToken, idOferta);
            if (response.success && response.data && response.data.images) {
                // The API now returns a list of strings under the 'images' key
                setImagenes(response.data.images);
            } else {
                console.error("Failed to fetch image names:", response.error);
                setImagenes([]);
            }
        } catch (error) {
            console.error("Error fetching image names:", error);
            setImagenes([]);
        } finally {
            setRefreshing(false);
        }
    }, [idOferta, accessToken, apiService]);


    React.useEffect(() => {
        fetchLineasOferta(); // Llama a la función al montar el componente
        fetchLineasAsignadas();
        fetchImagenesOferta();
    }, [fetchLineasOferta, fetchImagenesOferta]); // Dependencia para useEffect

    const onRefresh = useCallback(() => {
        fetchLineasOferta(); // Llama a la misma función para refrescar
        fetchImagenesOferta();
        fetchLineasAsignadas();
    }, [fetchLineasOferta, fetchImagenesOferta]);

    if (!lineas && !loading) { // Cambia la condición para mostrar el error solo si no hay líneas y no está cargando
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No se han proporcionado datos del parte.</Text>
            </View>
        );
    }


    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
    const enviarImagen = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.5,
                base64: false,
                aspect: [16, 9],
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                console.log('No se seleccionaron imágenes.');
                return;
            }

            // 1. Obtener la URI y el nombre del archivo directamente del resultado
            const asset = result.assets[0];
            const imageUri = asset.uri;
            const imageName = asset.fileName;

            // 2. Opcional: Actualizar el estado para mostrar la imagen en la UI si es necesario
            // Aunque no se usa para el envío, es bueno tenerlo
            setSelectedImage(imageUri);

            // 3. Crear el objeto FormData para el envío
            const formData = new FormData();

            // @ts-ignore
            formData.append('image', {
                uri: imageUri, // ¡Usamos la URI directa del resultado!
                name: imageName,
                type: 'image/jpeg',
            });
            formData.append('idOferta', idOferta.toString());
            // 4. Enviar la imagen
            const response = await apiService.postImage(accessToken, formData);

            // 5. Manejar la respuesta
            if (response.success) {
                Alert.alert('Éxito', 'La imagen se ha subido correctamente.');
            } else {
                Alert.alert('Error', `La subida falló: ${response.error || 'Error desconocido'}`);
            }

        } catch (error) {
            console.error('Error al enviar la imagen:', error);
            Alert.alert('Error', 'Hubo un problema al subir la imagen. Por favor, inténtalo de nuevo.');
        }
    };
    const groupLineasByParteAndQuantityStatus = (lineas: LineaOferta[]) => {
        const groupedByParte: { [key: string]: { completed: LineasPorParte[], pending: LineaOferta[], idParteERP: number, idParteAPP: number } } = {};

        lineas.forEach(linea => {
            const idParteERP = linea.ppcl_IdParte || 0; // Use 0 for lines without a part
            const idParteAPP = linea.idParteAPP || 0;

            const key = `${idParteERP}-${idParteAPP}`;

            if (!groupedByParte[key]) {
                groupedByParte[key] = { completed: [], pending: [], idParteERP, idParteAPP };
            }
            // @ts-ignore
            if (linea.ppcl_cantidad <= linea.ocl_UnidadesPres) {
                console.log("linea completada", linea)
                groupedByParte[key].completed.push(linea);
            } else {
                groupedByParte[key].pending.push(linea);
            }
        });

        return groupedByParte;
    };

    const groupedAndStatusLineas = lineasAsignadas ? groupLineasByParteAndQuantityStatus(lineasAsignadas) : {};
    const partes = Object.values(groupedAndStatusLineas).sort((a, b) => a.idParteERP - b.idParteERP);


    // @ts-ignore
    return (
        <ScrollView style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#3EB1A5']} // Color del spinner en Android
                    tintColor={'#3EB1A5'} // Color del spinner en iOS
                />
            }
        >
            <Text style={styles.title}>Detalles de la oferta</Text>
            <Ionicons style={styles.arrowBack} name={"arrow-back"} onPress={navigation.goBack}></Ionicons>
            <View style={styles.card}>
                <Text style={styles.label}>ID proyecto:
                    <Text style={styles.value}> {oferta.idProyecto}</Text>
                </Text>

                <Text style={styles.label}>Cliente:
                    <Text style={styles.value}> {oferta.cliente}
                    </Text>
                </Text>

                <Text style={styles.label}>ID Oferta: {oferta.idOferta}</Text>
                <Text style={styles.label}>Descripción proyecto:
                    <Text style={styles.value}> {oferta.descripcion}</Text>
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Observaciones: </Text>
                <Text style={styles.value}>{oferta.observaciones}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.label}>Galería de imágenes: </Text>
                <TouchableOpacity style={styles.addImageButton} onPress={enviarImagen}>
                    <Text style={styles.addImageText}>➕ Agregar</Text>
                </TouchableOpacity>
                <Text>{imagenes?.length > 0 ? "" : "No hay imagenes"}</Text>
                <FlatList
                    // @ts-ignore
                    data={imagenes}
                    renderItem={renderImage}
                    keyExtractor={item => item}
                    numColumns={3}
                    contentContainerStyle={styles.grid}
                />
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <AntDesign name="close" size={24} color="white" />
                        </TouchableOpacity>
                        {selectedImageUri && (
                            // @ts-ignore
                            <ImageZoom
                                cropWidth={Dimensions.get('window').width}
                                cropHeight={Dimensions.get('window').height}
                                imageWidth={Dimensions.get('window').width}
                                imageHeight={Dimensions.get('window').height}
                            >
                                <Image
                                    source={{ uri: selectedImageUri }}
                                    style={styles.modalImage}
                                    resizeMode="contain"
                                />
                            </ImageZoom>
                        )}
                    </View>
                </Modal>
                {/*

                <TouchableOpacity style={styles.seeAllImagesButton} onPress={() => {
                }}>
                    <Text style={styles.label}>Ver todas las imágenes</Text>
                </TouchableOpacity>
                  */}
            </View>

            { /* LINEAS DE LA OFERTA */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Líneas de la Oferta:</Text>
                {lineas && lineas.length > 0 ? (
                    lineas.map((linea, index) => (
                        <View key={index} style={styles.activityCardNoCert}>
                            <Text style={styles.activityText}>{linea.ocl_Descrip}</Text>
                            <Text style={styles.activityText}>Cantidad: {linea.ocl_UnidadesPres} {linea.ocl_tipoUnidad}</Text>
                            <Text style={styles.activityText}>ID Actividad: {linea.ocl_IdArticulo}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.value}>No hay líneas de oferta.</Text>
                )}
            </View>


            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lineas por parte:</Text>
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CrearParte',
                    {
                        user: user,
                        accessToken: accessToken,
                        oferta: oferta,
                        lineas: lineas!,
                        proyecto: oferta.descripcion ? oferta.descripcion : "",
                    })}><Text>➕ Crear Parte</Text></TouchableOpacity>
                {lineasAsignadas && lineasAsignadas.length > 0 ? (
                    partes.map((parte) => (
                        <TouchableOpacity key={`${parte.idParteAPP}`} onPress={() => {
                            navigation.navigate('ParteDetail', {
                                user: user, accessToken: accessToken, idParteAPP: parte.idParteAPP, idParteERP: parte.idParteERP
                            })
                        }}>
                            <Text
                                style={styles.groupTitle}>{parte.idParteERP ? "Grupo parte: " + parte.idParteERP + "." : "Líneas sin parte"}</Text>

                            {parte.completed.length > 0 && (
                                <View>
                                    <Text style={styles.subGroupTitle}>Cantidad Realizada || Cantidad Ofertada:</Text>
                                    {parte.completed.map((linea: LineasPorParte) => (
                                        <TouchableOpacity
                                            key={linea.id}
                                            onPress={() => navigation.navigate("InfoLinea", {
                                                user,
                                                accessToken,
                                                linea, // TODO: SEGUIR CON ESTO
                                                idParteAPP: parte.idParteAPP,
                                                idParteERP: parte.idParteERP
                                            })}>
                                            <View
                                                style={linea.certificado === 0 ? styles.activityCardNoCert : styles.activityCard}>
                                                <Text style={styles.activityText}>{linea.descriparticulo}</Text>
                                                <Text style={styles.activityText}>{linea.idParteAPP}</Text>
                                                <Text style={styles.activityText}>Cantidad
                                                    (realizado/ofertado): {linea.cantidad} / {linea.cantidad_total}</Text>
                                                <Text style={styles.activityText}>ID
                                                    Actividad: {linea.idArticulo}</Text>
                                                <Text
                                                    style={styles.activityText}>Certificado: {linea.certificado > 0 ? "Sí" : "No"}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {parte.pending.length > 0 && (
                                <View>
                                    <Text style={styles.subGroupTitle}>Cantidad Realizada | Cantidad Ofertada:</Text>
                                    {parte.pending.map((linea: LineaOferta) => (
                                        <TouchableOpacity
                                            key={linea.ocl_idlinea}
                                            onPress={() => navigation.navigate("InfoLinea", {
                                                user,
                                                accessToken,
                                                linea,
                                                idParteAPP: parte.idParteAPP,
                                                idParteERP: parte.idParteERP
                                            })}>
                                            <View
                                                style={linea.ppcl_Certificado === 0 ? styles.activityCardNoCert : styles.activityCard}>
                                                <Text style={styles.activityText}>{linea.ocl_Descrip}</Text>
                                                <Text style={styles.activityText}>Cantidad
                                                    (realizado/ofertado): {linea.ppcl_cantidad} / {linea.ocl_UnidadesPres}{linea.ocl_tipoUnidad}</Text>
                                                <Text style={styles.activityText}>ID
                                                    Actividad: {linea.ocl_IdArticulo}</Text>
                                                <Text
                                                    style={styles.activityText}>Certificado: {linea.ppcl_Certificado > 0 ? "Sí" : "No"}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.value}>No hay lineas asignadas.</Text>
                )}
            </View>
        </ScrollView>
    )
        ;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 40,
        backgroundColor: '#f8f8f8',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Un fondo semi-transparente
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1, // Para asegurar que esté por encima de la imagen
    },
    grid: {
        paddingTop: 10,
        alignItems: 'center',
    },
    imageContainer: {
        width: 100,
        height: 100,
        padding: 2, // Espacio entre las imágenes
    },
    image: {
        width: '100%',
        height: '100%',
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#ececec', // Light background for group titles
        paddingVertical: 10,
        borderRadius: 5,
    },
    subGroupTitle: {
        backgroundColor: '#ffffff',
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#333',
        textAlign: 'center',
    },
    arrowBack: {
        fontSize: 30,
        position: 'absolute',
        paddingTop: 3
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
    addImageButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        padding: 15,
    },
    addImageText: {
        color: '#555',

    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'normal',
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
    seeAllImagesButton: {
        backgroundColor: '#e4e4e4',
        width: '100%',
        margin: 'auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 12,
        paddingBottom: 8,
        marginTop: 8,
        borderRadius: 10,
    },
    activityCard: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#5BBDB3',
    },
    activityCardNoCert: {
        backgroundColor: '#dddddd',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#fad44f',
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
