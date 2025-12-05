// Substitua o arquivo: app-tablet/app/(auth)/login.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
    const [token, setToken] = useState('');
    const [mesaNumero, setMesaNumero] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { pairDevice } = useAuth();

    const handlePairing = async () => {
        if (!token || !mesaNumero) {
            Alert.alert('Erro', 'Por favor, preencha o Código de Pareamento e o Número da Mesa.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Chamamos a função simplificada, sem email/senha
            await pairDevice(token, mesaNumero);
            // Se der certo, o AuthContext atualiza e o roteador muda de tela automaticamente.
        } catch (error: any) {
            Alert.alert('Falha no Pareamento', error.message || 'Verifique os dados e tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.loginBox}>
                    <Text style={styles.emoji}>📱</Text>
                    <Text style={styles.title}>Configurar Mesa</Text>
                    <Text style={styles.subtitle}>Digite o código gerado no Painel Admin</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CÓDIGO DE PAREAMENTO</Text>
                        <TextInput
                            style={styles.inputToken}
                            placeholder="XYZ-123"
                            placeholderTextColor="#ccc"
                            value={token}
                            onChangeText={t => setToken(t.toUpperCase())}
                            autoCapitalize="characters"
                            maxLength={7}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>NÚMERO DA MESA</Text>
                        <TextInput
                            style={styles.inputMesa}
                            placeholder="Ex: 15"
                            placeholderTextColor="#ccc"
                            value={mesaNumero}
                            onChangeText={setMesaNumero}
                            keyboardType="number-pad"
                            maxLength={3}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handlePairing}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>CONECTAR MESA</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f7f9' },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    loginBox: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        alignItems: 'center'
    },
    emoji: { fontSize: 50, marginBottom: 10 },
    title: { fontSize: 26, fontWeight: '800', color: '#1a202c', marginBottom: 5 },
    subtitle: { fontSize: 16, color: '#718096', marginBottom: 30, textAlign: 'center' },
    
    inputGroup: { width: '100%', marginBottom: 20 },
    label: { fontSize: 12, fontWeight: 'bold', color: '#718096', marginBottom: 8, letterSpacing: 1 },
    
    inputToken: {
        backgroundColor: '#edf2f7',
        borderRadius: 12,
        padding: 15,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3748',
        textAlign: 'center',
        letterSpacing: 5,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    inputMesa: {
        backgroundColor: '#edf2f7',
        borderRadius: 12,
        padding: 15,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3748',
        textAlign: 'center'
    },

    button: {
        width: '100%',
        backgroundColor: '#4299e1',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#4299e1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonDisabled: { backgroundColor: '#a0aec0' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
});