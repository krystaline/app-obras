import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet} from 'react-native';


interface CustomSelectItem {
    id: number;
    title?: string; // Hacemos 'title' opcional para ser más flexibles
    name?: string;  // También 'name' opcional si se usa en otros contextos
    contact?: any;
    teamManager?: any;
    createdAt?: string;
    comments ?: string
}
const MyCustomSelect = ({
                            items,
                            selectedValue,
                            onSelect,
                            placeholder = "Selecciona un elemento",
                            searchable = true,
                        }: {
    items: CustomSelectItem[];
    selectedValue: CustomSelectItem | null; // El valor seleccionado será un objeto
    onSelect: (item: CustomSelectItem) => void;
    placeholder?: string;
    searchable?: boolean;
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    const filteredItems = Array.isArray(items) ? items.filter(item => {
        // Asegúrate de buscar por 'title' o 'name' según lo que use tu objeto
        const itemText = (item.title || item.name || '').toLowerCase();
        return itemText.includes(searchText.toLowerCase());
    }) : [];

    const handleSelectItem = (item: CustomSelectItem) => {
        onSelect(item);
        setModalVisible(false);
        setSearchText('');
    };

    // Obtener el label del elemento seleccionado: busca por id y usa su 'title' o 'name'
    const currentSelectionLabel = selectedValue ?
        (items.find(item => item.id === selectedValue.id)?.title || items.find(item => item.id === selectedValue.id)?.name || placeholder) :
        placeholder;


    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.inputField}
                onPress={() => setModalVisible(true)}
            >
                <Text style={selectedValue ? styles.selectedText : styles.placeholderText}>
                    {currentSelectionLabel}
                </Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setSearchText('');
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {searchable && (
                            <TextInput
                                style={styles.searchBar}
                                placeholder="Buscar..."
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        )}
                        <FlatList
                            data={filteredItems}
                            keyExtractor={(item) => (item.id).toString()}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={styles.listItem}
                                    onPress={() => handleSelectItem(item)}
                                >
                                    <Text>{item.title || item.name} - {item.id}</Text> {/* Muestra title o name */}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <Text style={styles.noResultsText}>No se encontraron resultados</Text>
                            )}
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => {
                                setModalVisible(false);
                                setSearchText('');
                            }}
                        >
                            <Text style={styles.textStyle}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    selectedText: {
        color: 'black',
    },
    placeholderText: {
        color: '#ccc',
    },
    noResultsText: {
        color: 'red'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    inputField: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,

        //height: '100%'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxHeight: '70%',
    },
    searchBar: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 5,
        marginBottom: 10,
    },
    listItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    button: {
        borderRadius: 8,
        padding: 12,
        elevation: 2,
        marginTop: 15,
    },
    buttonClose: {
        backgroundColor: '#3EB1A5',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default MyCustomSelect;