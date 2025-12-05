// Substitua o conteúdo COMPLETO do arquivo: app-funcionario/src/context/AuthContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../api/apiClient';
import { AxiosError } from 'axios';
import { Platform } from 'react-native';
import { jwtDecode } from 'jwt-decode'; 

const DEVICE_TOKEN_KEY = 'deviceAuthToken';
const USER_TOKEN_KEY = 'userAuthToken';     

interface DecodedToken {
    id: number; cargo: string; restaurante_id: number;
    nome: string; iat: number; exp: number;
}

interface AuthContextType {
    token: string | null; // <<< 1. VAMOS EXPORTAR O TOKEN ATIVO AQUI
    isAuthenticated: boolean;    
    isDevicePaired: boolean;   
    isLoading: boolean;          
    nomeUsuario: string | null;  
    
    pairDevice: (tokenPareamento: string) => Promise<void>; 
    loginWithPin: (email: string, pin: string) => Promise<void>; 
    logout: () => Promise<void>;         
    logoutCompleto: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Funções Auxiliares (saveStorage, getStorage, deleteStorage) ---
// (Estas funções permanecem 100% iguais)
async function saveStorage(key: string, value: string) {
    try {
        if (Platform.OS === 'web') localStorage.setItem(key, value);
        else await SecureStore.setItemAsync(key, value);
    } catch (e) { console.error(`Erro ao salvar ${key}:`, e); }
}
async function getStorage(key: string): Promise<string | null> {
    try {
        if (Platform.OS === 'web') return localStorage.getItem(key);
        else return await SecureStore.getItemAsync(key);
    } catch (e) { console.error(`Erro ao ler ${key}:`, e); }
    return null;
}
async function deleteStorage(key: string) {
    try {
        if (Platform.OS === 'web') localStorage.removeItem(key);
        else await SecureStore.deleteItemAsync(key);
    } catch (e) { console.error(`Erro ao deletar ${key}:`, e); }
}

// --- PROVEDOR ---
export function AuthProvider({ children }: { children: ReactNode }) {
    const [deviceToken, setDeviceToken] = useState<string | null>(null);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // <<< 2. NOVO ESTADO PARA O TOKEN ATIVO
    const [activeToken, setActiveToken] = useState<string | null>(null);

    // Efeito 1: Restaurar sessão
    useEffect(() => {
        const restoreSession = async () => {
            console.log("AuthProvider: Tentando restaurar sessão...");
            let activeHeaderToken: string | null = null;
            
            try {
                const savedDeviceToken = await getStorage(DEVICE_TOKEN_KEY);
                const savedUserToken = await getStorage(USER_TOKEN_KEY);
                
                if (savedDeviceToken) {
                    console.log("Dispositivo PAREADO encontrado.");
                    setDeviceToken(savedDeviceToken);
                    activeHeaderToken = savedDeviceToken; // Token padrão é o do dispositivo
                }
                
                if (savedUserToken) {
                    const decoded = jwtDecode<DecodedToken>(savedUserToken);
                    const isExpired = Date.now() >= decoded.exp * 1000;

                    if (isExpired) {
                        console.log("Token de usuário está EXPIRADO. Limpando...");
                        await deleteStorage(USER_TOKEN_KEY); 
                    } else {
                        console.log("Token de usuário VÁLIDO.");
                        setNomeUsuario(decoded.nome);
                        setUserToken(savedUserToken);
                        activeHeaderToken = savedUserToken; // Token prioritário é o do usuário
                    }
                }
            } catch (e) { 
                console.error('Falha ao restaurar sessão (token inválido?):', e);
                await deleteStorage(DEVICE_TOKEN_KEY);
                await deleteStorage(USER_TOKEN_KEY);
            } finally {
                if(activeHeaderToken) {
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${activeHeaderToken}`;
                }
                setActiveToken(activeHeaderToken); // <<< 3. ATUALIZA O TOKEN ATIVO
                setIsLoading(false);
            }
        };
        restoreSession();
    }, []);

    // Efeito 2: Interceptor de logout (permanece igual)
    useEffect(() => {
        const interceptor = apiClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                const status = error.response?.status;
                if (status === 401 || status === 403) {
                    if (userToken) {
                        console.log("Token de usuário expirou (interceptado). Fazendo logout de turno.");
                        await logout();
                    }
                    else if (deviceToken) {
                        console.log("Token de dispositivo expirou (interceptado). Fazendo logout completo.");
                        await logoutCompleto();
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => { apiClient.interceptors.response.eject(interceptor); };
    }, [userToken, deviceToken]);

    // Função 1: Parear o Dispositivo (Admin)
    const pairDevice = async (tokenPareamento: string) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post('/dispositivos/parear', {
                token_pareamento: tokenPareamento.toUpperCase()
            });
            if (response.data.cargo !== 'garcom') {
                throw new Error('Este token não é para um app de funcionário.');
            }
            const newDeviceToken = response.data.token;
            await saveStorage(DEVICE_TOKEN_KEY, newDeviceToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newDeviceToken}`;
            setDeviceToken(newDeviceToken);
            setActiveToken(newDeviceToken); // <<< 4. ATUALIZA O TOKEN ATIVO
            console.log("Dispositivo PAREADO com sucesso!");
        } catch (error) {
            let errorMessage = 'Erro desconhecido.';
            if (error instanceof AxiosError && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error instanceof Error) { errorMessage = error.message; }
            console.error('Erro no pareamento:', errorMessage);
            throw new Error(errorMessage); 
        } finally {
            setIsLoading(false);
        }
    };

    // Função 2: Login com PIN (Garçom)
    const loginWithPin = async (email: string, pin: string) => {
        setIsLoading(true);
        try {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${deviceToken}`;
            
            const response = await apiClient.post('/auth/login-funcionario', {
                email: email.toLowerCase().trim(),
                pin: pin
            });
            
            const newUserToken = response.data.token;
            const decoded = jwtDecode<DecodedToken>(newUserToken);
            
            await saveStorage(USER_TOKEN_KEY, newUserToken);
            setNomeUsuario(decoded.nome);
            setUserToken(newUserToken);
            
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newUserToken}`;
            setActiveToken(newUserToken); // <<< 5. ATUALIZA O TOKEN ATIVO
            console.log(`Login de ${decoded.nome} bem-sucedido!`);
        
        } catch (error) {
            let errorMessage = 'Erro desconhecido.';
            if (error instanceof AxiosError && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error instanceof Error) { errorMessage = error.message; }
            console.error('Erro no login:', errorMessage);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${deviceToken}`;
            throw new Error(errorMessage); 
        } finally {
            setIsLoading(false);
        }
    };

    // Função 3: Troca de Turno (limpa só o usuário)
    const logout = async () => {
        console.log("Realizando logout de turno...");
        await deleteStorage(USER_TOKEN_KEY);
        setUserToken(null);
        setNomeUsuario(null);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${deviceToken}`;
        setActiveToken(deviceToken); // <<< 6. REVERTE O TOKEN ATIVO
    };

    // Função 4: Esquecer Dispositivo (limpa tudo)
    const logoutCompleto = async () => {
        console.log("Realizando logout COMPLETO (esquecendo dispositivo)...");
        await deleteStorage(USER_TOKEN_KEY);
        await deleteStorage(DEVICE_TOKEN_KEY);
        setUserToken(null);
        setNomeUsuario(null);
        setDeviceToken(null);
        setActiveToken(null); // <<< 7. LIMPA O TOKEN ATIVO
        delete apiClient.defaults.headers.common['Authorization'];
    };

    const value = {
        token: activeToken, // <<< 8. EXPORTA O NOVO TOKEN ATIVO
        isAuthenticated: !!deviceToken && !!userToken, 
        isDevicePaired: !!deviceToken, 
        isLoading,
        nomeUsuario,
        pairDevice,
        loginWithPin,
        logout,
        logoutCompleto
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) { throw new Error('useAuth must be used within an AuthProvider'); }
    return context;
}