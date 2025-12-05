// Substitua o conteúdo COMPLETO do arquivo: app-tablet/src/context/AuthContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../api/apiClient'; 
import { AxiosError } from 'axios';
import { Platform } from 'react-native';

// Chave usada para salvar os dados no armazenamento do dispositivo/navegador
const TABLET_AUTH_DATA_KEY = 'tabletAuthData';

interface AuthData {
    token: string;
    mesaId: number;
    mesaNumero: string;
}

interface AuthContextType {
    token: string | null;
    mesaId: number | null; 
    mesaNumero: string | null; 
    isAuthenticated: boolean;
    isLoading: boolean;
    pairDevice: (token_pareamento: string, mesaNumero: string) => Promise<void>; 
    logout: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- FUNÇÕES AUXILIARES DE ARMAZENAMENTO ---
async function saveAuthData(data: AuthData) {
    try {
        const dataString = JSON.stringify(data);
        if (Platform.OS === 'web') {
            localStorage.setItem(TABLET_AUTH_DATA_KEY, dataString);
        } else {
            await SecureStore.setItemAsync(TABLET_AUTH_DATA_KEY, dataString);
        }
    } catch (e) {
        console.error('❌ Erro ao salvar dados de autenticação:', e);
    }
}

async function getAuthData(): Promise<AuthData | null> {
    try {
        let dataString: string | null = null;
        if (Platform.OS === 'web') {
            dataString = localStorage.getItem(TABLET_AUTH_DATA_KEY);
        } else {
            dataString = await SecureStore.getItemAsync(TABLET_AUTH_DATA_KEY);
        }
        
        if (dataString) {
            return JSON.parse(dataString) as AuthData;
        }
    } catch (e) {
        console.error('❌ Erro ao ler dados de autenticação:', e);
    }
    return null;
}

async function deleteAuthData() {
    try {
        if (Platform.OS === 'web') {
            localStorage.removeItem(TABLET_AUTH_DATA_KEY);
        } else {
            await SecureStore.deleteItemAsync(TABLET_AUTH_DATA_KEY);
        }
    } catch (e) {
        console.error('❌ Erro ao deletar dados de autenticação:', e);
    }
}

// --- PROVEDOR DE AUTENTICAÇÃO ---
export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [mesaId, setMesaId] = useState<number | null>(null); 
    const [mesaNumero, setMesaNumero] = useState<string | null>(null); 
    const [isLoading, setIsLoading] = useState(true);

    // EFEITO 1: Tenta restaurar a sessão ao abrir o app (F5)
    useEffect(() => {
        const restoreSession = async () => {
            console.log("🔄 AuthProvider: Tentando restaurar sessão...");
            try {
                const savedData = await getAuthData();
                if (savedData && savedData.token && savedData.mesaId) {
                    console.log(`✅ Sessão restaurada! Mesa ${savedData.mesaNumero}`);
                    
                    // 1. Configura o Axios IMEDIATAMENTE
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${savedData.token}`;
                    
                    // 2. Restaura os estados
                    setToken(savedData.token);
                    setMesaId(savedData.mesaId);
                    setMesaNumero(savedData.mesaNumero);
                } else {
                    console.log("ℹ️ Nenhuma sessão encontrada.");
                }
            } catch (e) {
                console.error('❌ Falha fatal ao restaurar sessão:', e);
            } finally {
                // Sempre finaliza o loading, mesmo se não achou nada
                setIsLoading(false);
            }
        };
        
        restoreSession();
    }, []);

    // EFEITO 2: Monitora respostas 403 (Token expirado/inválido) para fazer logout automático
    useEffect(() => {
        const interceptor = apiClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    console.warn("⚠️ Auth: Token inválido ou expirado. Realizando logout forçado.");
                    await logout(); 
                }
                return Promise.reject(error);
            }
        );
        // Remove o interceptor quando o componente desmontar
        return () => { apiClient.interceptors.response.eject(interceptor); };
    }, []); 

    // Função de Login/Pareamento
    const pairDevice = async (token_pareamento: string, mesaNumeroStr: string) => {
        setIsLoading(true);
        try {
            console.log(`🔐 Iniciando pareamento para Mesa ${mesaNumeroStr}...`);
            
            // 1. Obtém o token do dispositivo (rota universal)
            const response = await apiClient.post('/dispositivos/parear', {
                token_pareamento
            });
            const newToken = response.data.token;
            
            // 2. Configura o token temporariamente para a próxima chamada
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            // 3. Registra ou encontra a mesa no backend
            const mesaResponse = await apiClient.post('/mesas/parear-tablet', { numero: mesaNumeroStr });
            const newMesaId = mesaResponse.data.id;
            
            // 4. Prepara os dados para salvar
            const authData: AuthData = {
                token: newToken,
                mesaId: newMesaId,
                mesaNumero: mesaNumeroStr
            };

            // 5. Salva no armazenamento persistente
            await saveAuthData(authData);

            // 6. Atualiza o estado da aplicação (isso fará a tela mudar)
            setToken(newToken);
            setMesaId(newMesaId);
            setMesaNumero(mesaNumeroStr);
            console.log("✅ Pareamento concluído com sucesso!");
        
        } catch (error) {
            // Tratamento de erro robusto
            let errorMessage = 'Erro desconhecido ao parear.';
            if (error instanceof AxiosError && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error('❌ Erro no pareamento:', errorMessage);
            throw new Error(errorMessage); 
        } finally {
            setIsLoading(false);
        }
    };

    // Função de Logout
    const logout = async () => {
        console.log("🚪 Realizando logout...");
        try {
            await deleteAuthData();
            delete apiClient.defaults.headers.common['Authorization'];
            setToken(null);
            setMesaId(null);
            setMesaNumero(null);
        } catch (e) {
            console.error("Erro ao fazer logout:", e);
        }
    };

    // O valor que será disponibilizado para toda a aplicação
    const value = {
        token, 
        mesaId, 
        mesaNumero,
        isAuthenticated: !!token && !!mesaId, // Só é autenticado se tiver token E mesa
        isLoading,
        pairDevice,
        logout,
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