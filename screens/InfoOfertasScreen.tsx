// InfoOfertasScreen_enriquecido.tsx
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
type InfoOfertaProps = StackScreenProps<MainTabParamList, 'InfoOferta'>;
export default function InfoOferta({ route, navigation }: InfoOfertaProps) {
    const { idOferta } = route.params as { idOferta: number };
    const { user } = route.params as { user: any }
    const { accessToken } = route.params as { accessToken: string }
    const [lineas, setLineas] = useState<LineaOferta[]>()
    const [lineasAsignadas, setLineasAsignadas] = useState<LineasPorParte[]>()
    const [loading, setLoading] = useState(true)
    const { oferta } = route.params as { oferta: Oferta }
    const [refreshing, setRefreshing] = useState(false)
    const [imagenes, setImagenes] = useState<Tip[]>();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    const renderImage = ({ item }: { item: string }) => {
        const imageUrl = `${apiService.getBaseUrl()}/api/images/imagenes/${item}`;
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

    // Merge fallback (client-side) si el backend no devuelve las líneas "enriquecidas"
    const mergeLineasClient = (lineasOferta: LineaOferta[] = [], lineasParte: LineasPorParte[] = []) => {
        const buildKeyOferta = (linea: any) => `${linea.ocl_IdOferta ?? 0}::${linea.ocl_idlinea ?? 0}`;
        const buildKeyParte = (linea: any) => `${linea.idOferta ?? 0}::${linea.idLinea ?? 0}`;

        const mapParte = new Map<string, LineasPorParte[]>();
        for (const p of lineasParte) {
            const k = buildKeyParte(p as any);
            if (!mapParte.has(k)) mapParte.set(k, []);
            mapParte.get(k)!.push(p);
        }

        const enriched = lineasOferta.map(lo => {
            const key = buildKeyOferta(lo as any);
            const matches = mapParte.get(key) ?? [];
            const parte = matches.length ? matches[0] : undefined;

            return {
                ...lo,
                esta_en_parte: !!parte ? 1 : 0,
                idParteAPP: parte?.idParteAPP ?? null,
                cantidad_en_parte: parte?.cantidad ?? 0,
                certificado_en_parte: parte?.certificado ?? 0,
                partesAsociadas: matches
            } as any;
        });

        return enriched;
    }

    const fetchEnrichedLineas = useCallback(async () => {
        setRefreshing(true);
        setLoading(true);
        try {
            // Intentamos obtener las líneas enriquecidas desde el backend usando el endpoint actual
            // (Se asume que el backend devolverá la propiedad `esta_en_parte` o campos `idParteAPP` cuando esté implementado)
            const resp = await apiService.getLineasOferta(idOferta, accessToken, user.id);

            if (!resp.success) {
                throw new Error(resp.error || 'Error al obtener líneas');
            }

            const data = resp.data ?? [];

            // Detectamos si la respuesta ya viene "enriquecida"
            const first = Array.isArray(data) && data.length ? data[0] : null;
            const enrichedFlag = first && (('esta_en_parte' in first) || ('idParteAPP' in first));

            if (enrichedFlag) {
                // Backend ya devuelve líneas enriquecidas: usamos directamente
                setLineas(data as LineaOferta[]);

                // Construimos lineasAsignadas a partir de los campos devueltos para mantener el UI actual
                const partesFromEnriched: LineasPorParte[] = (data as any[])
                    .filter(d => d.idParteAPP || d.ppcl_IdParte)
                    .map(d => ({
                        idParteERP: d.ppcl_IdParte ?? 0,
                        idParteAPP: d.idParteAPP ?? 0,
                        revision: d.ocl_revision ?? 0,
                        capitulo: (d.ppcl_Capitulo ?? d.ppcl_Capitulo) as any,
                        titulo: d.ppcl_DescripArticulo ?? d.ocl_Descrip ?? '',
                        idLinea: d.ocl_idlinea ?? 0,
                        idArticulo: d.ocl_IdArticulo ?? d.ppcl_IdArticulo ?? '',
                        descriparticulo: d.ppcl_DescripArticulo ?? d.ocl_Descrip ?? '',
                        unidadmedida: d.ppcl_UnidadMedida ?? d.ocl_tipoUnidad ?? '',
                        cantidad: d.ppcl_cantidad ?? d.cantidad_en_parte ?? 0,
                        cantidad_total: d.ocl_UnidadesPres ?? 0,
                        certificado: d.ppcl_Certificado ?? (d.certificado_en_parte ?? 0),
                        fechainsertupdate: d.fechainsertupdate ?? null,
                        idOferta: d.ocl_IdOferta ?? idOferta,
                        id: d.id ?? 0
                    })) as LineasPorParte[];

                setLineasAsignadas(partesFromEnriched);

            } else {
                // Fallback: el backend no está enriquecido todavía -> hacemos la lógica antigua
                const ofertaLineas = data as LineaOferta[];
                // Obtenemos las líneas de partes y hacemos merge en cliente
                const respParte = await apiService.getLineasParte(idOferta, accessToken, user.id);
                if (!respParte.success) throw new Error(respParte.error || 'Error al obtener líneas de parte');

                const lineasParte = respParte.data ?? [];
                const enriched = mergeLineasClient(ofertaLineas, lineasParte as LineasPorParte[]);
                setLineas(enriched as any);
                setLineasAsignadas(lineasParte as LineasPorParte[]);
            }

        } catch (error: any) {
            console.error('Error fetching enriched lines:', error);
            Alert.alert('Error', 'No se pudieron cargar las líneas de la oferta o las líneas del parte.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [idOferta, accessToken, user.id]);

    const fetchImagenesOferta = useCallback(async () => {
        setRefreshing(true);
        try {
            const response = await apiService.getImages(accessToken, idOferta, user.id);
            if (response.success && response.data && response.data.images) {
                setImagenes(response.data.images);
            } else {
                setImagenes([]);
            }
        } catch (error) {
            console.error("Error fetching image names:", error);
            setImagenes([]);
        } finally {
            setRefreshing(false);
        }
    }, [idOferta, accessToken, apiService, user.id]);

    React.useEffect(() => {
        fetchEnrichedLineas();
        fetchImagenesOferta();
    }, [fetchEnrichedLineas, fetchImagenesOferta]);

    const onRefresh = useCallback(() => {
        fetchEnrichedLineas();
        fetchImagenesOferta();
    }, [fetchEnrichedLineas, fetchImagenesOferta]);

    if (!lineas && !loading) {
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
                return;
            }

            const asset = result.assets[0];
            const imageUri = asset.uri;
            const imageName = asset.fileName;
            setSelectedImage(imageUri);

            const formData = new FormData();
            // @ts-ignore
            formData.append('image', {
                uri: imageUri,
                name: imageName,
                type: 'image/jpeg',
            });
            formData.append('idOferta', idOferta.toString());
            const response = await apiService.postImage(accessToken, formData, user.id);
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

    const groupLineasAsignadas = (lineas: LineasPorParte[]) => {
        const groupedByParte: { [key: string]: { completed: LineasPorParte[], pending: LineasPorParte[], idParteERP: number, idParteAPP?: number } } = {};

        lineas.forEach(linea => {
            const rawParte = (linea as any).ppcl_IdParte ?? (linea as any).idParteERP ?? 0;
            const idParteERP = (typeof rawParte === 'string') ? Number(rawParte.trim()) || 0 : Number(rawParte || 0);

            const idParteAPP = (linea as any).idParteAPP ? Number((linea as any).idParteAPP) : undefined;

            const key = `${idParteERP}`;

            if (!groupedByParte[key]) {
                groupedByParte[key] = { completed: [], pending: [], idParteERP, idParteAPP };
            }

            const certificadoRaw = Number((linea as any).ppcl_Certificado ?? (linea as any).certificado ?? 0);
            const certificadoValido = idParteERP !== 0 ? certificadoRaw : 0;

            if (certificadoValido > 0) {
                groupedByParte[key].completed.push(linea);
            } else {
                groupedByParte[key].pending.push(linea);
            }

            if (!groupedByParte[key].idParteAPP && idParteAPP) {
                groupedByParte[key].idParteAPP = idParteAPP;
            }
        });

        const resumen = Object.values(groupedByParte).map(g => ({
            idParteERP: g.idParteERP,
            idParteAPP: g.idParteAPP ?? '-',
            completed: g.completed.length,
            pending: g.pending.length,
            total: g.completed.length + g.pending.length
        }));
        console.log('[groupLineasAsignadas] resumen grupos:', resumen);

        return groupedByParte;
    };

    const groupedAndStatusLineas = lineasAsignadas ? groupLineasAsignadas(lineasAsignadas) : {};
    const partes = Object.values(groupedAndStatusLineas)
        .sort((a, b) => {
            if (a.idParteERP === 0 && b.idParteERP === 0) return 0;
            if (a.idParteERP === 0) return 1;
            if (b.idParteERP === 0) return -1;
            return a.idParteERP - b.idParteERP;
        });

    return (
        <ScrollView style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#3EB1A5']}
                    tintColor={'#3EB1A5'}
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
            </View>

            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CrearParte',
                {
                    user: user,
                    accessToken: accessToken,
                    oferta: oferta,
                    lineas: lineas || [],
                    proyecto: oferta.descripcion ? oferta.descripcion : "",
                })}><Text>➕ Crear Parte</Text></TouchableOpacity>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Líneas de la Oferta:</Text>
                {lineas && lineas.length > 0 ? (
                    lineas.map((linea, index) => (
                        <View key={index} style={styles.activityCardNoCert}>
                            <Text style={styles.activityText}>{linea.ocl_Descrip}</Text>
                            <Text style={styles.activityText}>Cantidad: {linea.ocl_UnidadesPres} {linea.ocl_tipoUnidad}</Text>
                            <Text style={styles.activityText}>ID Actividad: {linea.ocl_IdArticulo}</Text>
                            {(linea as any).esta_en_parte ? (
                                <Text style={styles.activityText}>En parte: {(linea as any).idParteAPP ?? (linea as any).ppcl_IdParte}</Text>
                            ) : null}
                        </View>
                    ))
                ) : (
                    <Text style={styles.value}>No hay líneas de oferta.</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lineas por parte:</Text>

                {lineasAsignadas && lineasAsignadas.length > 0 ? (
                    partes.map((parte) => (
                        <TouchableOpacity key={`${parte.idParteAPP}`} onPress={() => {
                            navigation.navigate('ParteDetail', {
                                user: user, accessToken: accessToken, idParteAPP: parte.idParteAPP, idParteERP: parte.idParteERP
                            })
                        }}>
                            <Text
                                style={styles.groupTitle}>{parte.idParteERP ? "Grupo parte: " + parte.idParteERP : "Líneas sin parte"}</Text>
                            {parte.completed.length > 0 && (
                                <View>
                                    {parte.completed.map((linea: LineasPorParte) => (
                                        <TouchableOpacity
                                            key={linea.id}
                                            onPress={() => navigation.navigate("InfoLinea", {
                                                user,
                                                accessToken,
                                                linea,
                                                idParteAPP: parte.idParteAPP,
                                                idParteERP: parte.idParteERP
                                            })}>
                                            <View
                                                style={linea.certificado === 0 ? styles.activityCardNoCert : styles.activityCard}>
                                                <Text style={styles.activityText}>{linea.descriparticulo}</Text>
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
                                    {parte.pending.map((linea: LineasPorParte) => (
                                        <TouchableOpacity
                                            key={linea.id}
                                            onPress={() => navigation.navigate("InfoLinea", {
                                                user,
                                                accessToken,
                                                linea,
                                                idParteAPP: parte.idParteAPP,
                                                idParteERP: parte.idParteERP
                                            })}>
                                            <View
                                                style={linea.certificado === 0 ? styles.activityCardNoCert : styles.activityCard}>
                                                <Text style={styles.activityText}>{linea.descriparticulo}</Text>
                                                <Text style={styles.activityText}>Cantidad
                                                    (realizado/ofertado): {linea.cantidad} / {linea.cantidad_total}{linea.unidadmedida}</Text>
                                                <Text style={styles.activityText}>ID
                                                    Actividad: {linea.idArticulo}</Text>
                                                <Text
                                                    style={styles.activityText}>Certificado: {linea.certificado > 0 ? "Sí" : "No"}</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
    },
    grid: {
        paddingTop: 10,
        alignItems: 'center',
    },
    imageContainer: {
        width: 100,
        height: 100,
        padding: 2,
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
        backgroundColor: '#ececec',
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
        marginBottom: 20,
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
        height: 200,
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
