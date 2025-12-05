// Substitua o arquivo: app-funcionario/src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';

// --- TELA 1: PAREAMENTO (Código do Admin) ---
const PairingScreen = () => {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { pairDevice } = useAuth();

    const handlePairing = async () => {
        if (!token) {
            Alert.alert('Ops!', 'Digite o Código de Pareamento.');
            return;
        }
        setIsLoading(true);
        try {
            await pairDevice(token);
        } catch (error: any) {
            Alert.alert('Erro no Pareamento', error.message);
            setIsLoading(false);
        }
    };
    
    return (
        <View style={styles.box}>
            <Text style={styles.emoji}>📱</Text>
            <Text style={styles.title}>Parear Dispositivo</Text>
            <Text style={styles.subtitle}>Digite o código gerado no Painel Admin</Text>
            <TextInput
                // <<< --- CORREÇÃO AQUI: Aplicando os dois estilos --- <<<
                style={[styles.input, styles.inputPin]} 
                placeholder="___-___"
                placeholderTextColor="#a0aec0"
                value={token}
                onChangeText={(text) => setToken(text.toUpperCase())}
                maxLength={7}
                autoCapitalize="characters"
            />
            <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handlePairing}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>PAREAR DISPOSITIVO</Text>}
            </TouchableOpacity>
        </View>
    );
}

// --- TELA 2: LOGIN POR PIN (Email + PIN do Garçom) ---
const PinLoginScreen = () => {
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { loginWithPin } = useAuth();

    const handleLogin = async () => {
        if (!email || !pin || pin.length !== 4) {
            Alert.alert('Ops!', 'Digite um email válido e um PIN de 4 dígitos.');
            return;
        }
        setIsLoading(true);
        try {
            await loginWithPin(email, pin);
        } catch (error: any) {
            Alert.alert('Login Falhou', error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <View style={styles.box}>
            <Text style={styles.emoji}>🤵</Text>
            <Text style={styles.title}>Login do Funcionário</Text>
            <Text style={styles.subtitle}>Use seu email e PIN de 4 dígitos</Text>

            <TextInput
                style={[styles.input, styles.inputEmail]}
                placeholder="seu.email@restaurante.com"
                placeholderTextColor="#a0aec0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
            />
            <TextInput
                style={[styles.input, styles.inputPin]}
                placeholder="• • • •"
                placeholderTextColor="#a0aec0"
                value={pin}
                onChangeText={setPin}
                maxLength={4}
                keyboardType="number-pad"
                secureTextEntry
            />
            <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ENTRAR</Text>}
            </TouchableOpacity>
        </View>
    );
}

// --- COMPONENTE PRINCIPAL (O "Switcher") ---
export default function LoginScreen() {
    const { isLoading, isDevicePaired } = useAuth();

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {isLoading ? (
                <ActivityIndicator size="large" color="#fff" />
            ) : !isDevicePaired ? (
                <PairingScreen /> 
            ) : (
                <PinLoginScreen />
            )}
        </KeyboardAvoidingView>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#1a202c',
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    box: {
        backgroundColor: 'white',
        paddingVertical: 40,
        paddingHorizontal: 30,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 15.00,
        elevation: 24,
        width: '100%',
        maxWidth: 380,
        alignItems: 'center',
    },
    emoji: { 
        fontSize: 48,
        marginBottom: 15,
    },
    title: { 
        fontSize: 24,
        fontWeight: '800', 
        color: '#2d3748', 
        marginBottom: 5,
        textAlign: 'center'
    },
    subtitle: { 
        fontSize: 14, 
        color: '#a0aec0', 
        marginBottom: 30, 
        textAlign: 'center'
    },
    input: { 
        width: '100%', 
        height: 60, 
        backgroundColor: '#edf2f7',
        borderRadius: 12, 
        paddingHorizontal: 20,
        fontSize: 18, 
        color: '#2d3748', 
        borderWidth: 0,
        marginBottom: 15,
        // Adicione isso para garantir que o 'box-sizing' esteja correto
        boxSizing: 'border-box', 
    },
    inputEmail: {
        textAlign: 'center',
    },
    inputPin: {
        fontSize: 32,
        textAlign: 'center', 
        fontWeight: 'bold', 
        letterSpacing: 8,
        paddingHorizontal: 10,
    },
    button: { 
        width: '100%', 
        height: 60, 
        backgroundColor: '#48bb78',
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: "#48bb78",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 10,
    },
    buttonDisabled: { 
        backgroundColor: '#2f855a',
        opacity: 0.7
    },
    buttonText: { 
        color: 'white', 
        fontSize: 18, 
        fontWeight: 'bold',
        letterSpacing: 1
    }
});