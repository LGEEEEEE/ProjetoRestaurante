// Substitua o conteúdo COMPLETO do seu arquivo: app-tablet/src/context/SocketContext.tsx

import React, { createContext, useContext, ReactNode, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api/apiClient';
import { useAuth } from './AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_DATA_KEY = 'tabletAuthData'; 

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    // Agora retorna o 'socket' do state, que é reativo
    return context.socket;
}

export function SocketProvider({ children }: { children: ReactNode }) {
    // <<<--- MUDANÇA 1: Usar 'useState' para o socket ---<<<
    // Isso garante que os componentes que consomem o contexto 
    // sejam atualizados quando o socket for conectado.
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null); // Manter o ref para gerenciamento interno
    const { isAuthenticated } = useAuth(); 

    useEffect(() => {
        const connectSocket = async () => {
            if (!isAuthenticated) {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                    setSocket(null); // <<<--- ATUALIZA O STATE
                }
                return;
            }
            
            // Evita reconectar se já existe um socket
            if (socketRef.current) return;

            let token: string | null = null;
            try {
                let dataString: string | null = null;
                if (Platform.OS === 'web') {
                    dataString = localStorage.getItem(TOKEN_DATA_KEY);
                } else {
                    dataString = await SecureStore.getItemAsync(TOKEN_DATA_KEY);
                }
                
                if (dataString) {
                    const authData = JSON.parse(dataString);
                    if (authData.token) token = authData.token;
                }
            } catch (e) {
                console.error("SocketProvider (Tablet): Falha ao ler authData", e);
            }

            if (!token) {
                console.error("SocketProvider (Tablet): Autenticado mas não foi possível encontrar o token.");
                return;
            }

            console.log('SocketProvider (Tablet): Conectando ao servidor socket com token...');
            
            const newSocket = io(API_BASE_URL, {
                transports: ['websocket'],
                auth: { token: token },
                extraHeaders: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            newSocket.on('connect', () => {
                console.log('SocketProvider (Tablet): Conectado com ID:', newSocket.id);
                newSocket.emit('autenticar', token);
                
                // <<<--- MUDANÇA 2: Atualiza o ref E o state ---<<<
                socketRef.current = newSocket;
                setSocket(newSocket); 
            });

            newSocket.on('disconnect', () => {
                console.log('SocketProvider (Tablet): Desconectado.');
                socketRef.current = null;
                setSocket(null); // <<<--- ATUALIZA O STATE
            });
        };

        connectSocket();

        return () => {
            // Limpa a conexão ao desmontar ou ao mudar 'isAuthenticated'
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null); 
                console.log('SocketProvider (Tablet): Limpando conexão.');
            }
        };
    }, [isAuthenticated]); // Executa toda vez que o status de autenticação mudar

    // <<<--- MUDANÇA 3: O valor do provider agora é o 'socket' do state ---<<<
    const value = {
        socket: socket,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}