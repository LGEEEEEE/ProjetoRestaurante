// Confirme que seu arquivo está assim: app-funcionario/src/context/SocketContext.tsx

import React, { createContext, useContext, ReactNode, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api/apiClient';
import { useAuth } from './AuthContext'; // Depende do AuthContext

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context.socket;
}

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const { token } = useAuth(); // <<< ELE PEGA O 'activeToken' AQUI

    useEffect(() => {
        // <<< O [token] AQUI FAZ TUDO FUNCIONAR
        // Quando o activeToken mudar (de null -> deviceToken -> userToken)
        // este useEffect vai rodar e reconectar o socket com o token certo.
        
        if (!token) { 
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null); 
            }
            return;
        }

        // Desconecta o socket antigo (se existir) para conectar com o novo token
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null); 
        }

        console.log('SocketProvider (Funcionário): Conectando ao servidor socket com token...');
        
        const newSocket = io(API_BASE_URL, {
            transports: ['websocket'],
            auth: { token: token }, // <<< Usa o token (device ou user)
            extraHeaders: {
                'ngrok-skip-browser-warning': 'true'
            }
        });

        newSocket.on('connect', () => {
            console.log('SocketProvider (Funcionário): Conectado com ID:', newSocket.id);
            if (token) {
                newSocket.emit('autenticar', token);
            }
            socketRef.current = newSocket;
            setSocket(newSocket); 
        });

        newSocket.on('disconnect', () => {
            console.log('SocketProvider (Funcionário): Desconectado.');
            socketRef.current = null;
            setSocket(null); 
        });

        return () => {
            if (newSocket) {
                newSocket.disconnect();
                socketRef.current = null;
                setSocket(null); 
                console.log('SocketProvider (Funcionário): Limpando conexão.');
            }
        };
    }, [token]); // <<< A DEPENDÊNCIA DO 'activeToken'

    const value = {
        socket: socket,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}