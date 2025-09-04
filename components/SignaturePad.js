// SignaturePad.js
import React, {useRef, useEffect, useState} from 'react'; // <--- Import useEffect and useState
import {View, Text, StyleSheet, Button} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';

// Agregamos una prop `onDrawingStatusChange` para notificar al padre
const SignaturePad = ({onSignatureSaved, onDrawingStatusChange, visibility}) => {
    const signatureRef = useRef(null);

    // Use useState for vis and update it with useEffect when the visibility prop changes
    const [vis, setVis] = useState(visibility); // <--- Initialize with visibility prop

    useEffect(() => {
        setVis(visibility); // <--- Update vis whenever the visibility prop changes
    }, [visibility]);

    const handleSignature = (signature) => {
        console.log("guardao")
        if (onSignatureSaved) {
            onSignatureSaved(signature);
        }
        setVis(false); // Hide the signature pad after saving
        onDrawingStatusChange(false)
    };

    const handleClearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clearSignature();
        }
    };

    const handleSaveSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.readSignature();
        }
    };

    if (!vis) {
        return null;
    }
    return (
        <View style={styles.signatureContainer}>
            <SignatureCanvas
                scrollable={false}
                ref={signatureRef}
                onOK={handleSignature}
                // Nuevas props para controlar el estado del dibujo
                onBegin={() => onDrawingStatusChange(false)} // Deshabilita el scroll
                onEnd={() => onDrawingStatusChange(true)}   // Habilita el scroll
                descriptionText="Firme aquí"
                onClear={() => onDrawingStatusChange(false)}
                onSignatureSaved={() => onDrawingStatusChange(false)}
                clearText="Limpiar"
                confirmText="Guardar"
                autoClear={false}
                minWidth={1}
                maxWidth={3}
                penColor="#000000"
                backgroundColor="#ffffff"
                style={styles.signatureCanvas}
            />
            <View style={styles.signatureButtonsContainer}>
                {/* Puedes quitar estos botones si solo quieres usar onOK */}
                <Button title="Guardar Firma" onPress={handleSaveSignature}
                        color="#00CDB2"/>
                <Button title="Limpiar Firma" onPress={handleClearSignature} color="#f44336"/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    signatureContainer: {
        flex: 1, // This is crucial for filling the screen
        alignItems: 'center',
        zIndex: 999,
        flexDirection: 'column',
        marginTop: 20,
        marginBottom: 20,
    },
    signatureLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    signatureCanvas: {
        width: '105%',
        height: 190,
        borderColor: '#00CDB2',
        borderWidth: 3,
        borderRadius: 5,
        marginBottom: 10,
        zIndex: 99,
    },
    signatureButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
});

export default SignaturePad; // Asegúrate de exportarlo como default