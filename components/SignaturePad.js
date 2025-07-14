// SignaturePad.js
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';

// Agregamos una prop `onDrawingStatusChange` para notificar al padre
const SignaturePad = ({ onSignatureSaved, onDrawingStatusChange }) => { // <--- Modificado
    const signatureRef = useRef(null);

    const handleSignature = (signature) => {
        if (onSignatureSaved) {
            onSignatureSaved(signature);
        }
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

    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.signatureLabel}>Firma del Cliente:</Text>
            <SignatureCanvas
                ref={signatureRef}
                onOK={handleSignature}
                // Nuevas props para controlar el estado del dibujo
                onBegin={() => onDrawingStatusChange(false)} // Deshabilita el scroll
                onEnd={() => onDrawingStatusChange(true)}   // Habilita el scroll
                descriptionText="Firme aquí"
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
    fieldContainer: {
        marginBottom: 20,
    },
    signatureLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    signatureCanvas: {
        width: '100%',
        height: 200,
        borderColor: '#00CDB2',
        borderWidth: 3,
        borderRadius: 5,
        marginBottom: 10,
    },
    signatureButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
});

export default SignaturePad; // Asegúrate de exportarlo como default