// Substitua o conteúdo COMPLETO do arquivo: app-tablet/src/context/OrderContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react'; 
import { apiClient, API_BASE_URL } from '../api/apiClient';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext'; 
import Toast from 'react-native-toast-message';

// Tipos usados no contexto
export interface CartItem {
    product: {
        id: string;
        nome: string;
        preco: number;
        imagem_url: string;
        descricao?: string;
        categoria_id?: string;
        disponivel?: boolean;
    };
    quantity: number;
    notes?: string; // <<<--- CORREÇÃO APLICADA AQUI ---<<<
}

export type OrderStatus = 'recebido' | 'em_preparo' | 'pronto' | 'finalizado' | 'cancelado' | 'estornado';

export interface Order {
    id: string;
    items: CartItem[]; // Este CartItem agora tem 'notes'
    status: OrderStatus;
    createdAt: Date;
}

interface OrderContextType {
    orders: Order[];
    // A função agora aceita CartItem[] (que pode ter 'notes')
    addOrder: (items: CartItem[]) => Promise<void>; 
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Helpers
const formatStatusForNotification = (status: OrderStatus): string => {
    switch (status) {
        case 'em_preparo': return 'está em preparo!';
        case 'pronto': return 'está pronto! Um funcionário levará até você.';
        case 'cancelado': return 'foi cancelado. Chame um funcionário se tiver dúvidas.';
        default: return '';
    }
}

const fixImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
};

export function OrderProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const { mesaId, isAuthenticated, isLoading: authLoading } = useAuth();
    const socket = useSocket(); 
    const showNotificationRef = useRef(Toast.show);

    useEffect(() => { showNotificationRef.current = Toast.show; }, []);

    // 1. BUSCA INICIAL DE PEDIDOS
    useEffect(() => {
        if (authLoading || !isAuthenticated || !mesaId) return;

        const fetchMyOrders = async () => {
            console.log(`📡 OrderContext: Buscando pedidos da Mesa ${mesaId}...`);
            try {
                const response = await apiClient.get('/pedidos/minha-mesa', {
                    params: { mesa_id: mesaId }
                });
                
                const loadedOrders = response.data.map((order: any) => ({
                    ...order,
                    createdAt: new Date(order.createdAt),
                    items: order.items.map((item: any) => ({
                        ...item,
                        // O backend (server.js) já manda o campo 'notes' (como 'observacoes')
                        // Ele já está sendo salvo aqui
                        product: {
                            ...item.product,
                            imagem_url: fixImageUrl(item.product.imagem_url)
                        }
                    }))
                }));

                console.log(`✅ Pedidos carregados: ${loadedOrders.length}`);
                setOrders(loadedOrders);
            } catch (error) {
                console.error("❌ Erro ao buscar pedidos da mesa:", error);
            }
        };

        fetchMyOrders();
    }, [authLoading, isAuthenticated, mesaId]); 

    // 2. FUNÇÃO PARA ATUALIZAR STATUS MANUALMENTE
    const updateOrderStatus = (orderId: string, status: OrderStatus) => {
        setOrders(currentOrders =>
            currentOrders.map(order =>
                order.id === orderId ? { ...order, status: status } : order
            )
        );
    };

    // 3. LISTENERS DO SOCKET.IO
    useEffect(() => {
        if (!socket) return; 

        const handleStatusUpdate = (data: { pedidoId: string, novoStatus: OrderStatus }) => {
            console.log('🔔 Socket: Status do pedido atualizado', data);
            
            let firstItemName = 'Seu pedido'; 

            setOrders(currentOrders => {
                const orderExists = currentOrders.some(o => o.id === data.pedidoId);
                if (!orderExists) return currentOrders;

                return currentOrders.map(order => {
                    if (order.id === data.pedidoId) {
                        if (order.items.length > 0) {
                            firstItemName = order.items[0].product.nome;
                        }
                        return { ...order, status: data.novoStatus };
                    }
                    return order; 
                });
            });

            const message = formatStatusForNotification(data.novoStatus);
            if (message) {
                showNotificationRef.current({
                    type: 'info',
                    text1: firstItemName, 
                    text2: message,       
                    position: 'top',
                    visibilityTime: 4000
                });
            }
        };

        socket.on('status_atualizado', handleStatusUpdate);

        return () => {
            socket.off('status_atualizado', handleStatusUpdate);
        };
    }, [socket]); 

    // 4. FUNÇÃO PARA ENVIAR NOVO PEDIDO (MODIFICADA)
    const addOrder = async (items: CartItem[]) => {
        if (items.length === 0) return;
        if (!mesaId) {
            Toast.show({ type: 'error', text1: 'Erro: Mesa não identificada.' });
            throw new Error('mesaId é nulo.');
        }
        
        const valor_total = items.reduce((sum, item) => sum + item.product.preco * item.quantity, 0);

        // Mapeia os itens para o formato que o backend espera
        // O backend (server.js) espera 'item.notes'
        const itemsParaApi = items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            notes: item.notes || '' // Garante que o campo 'notes' (observações) seja enviado
        }));

        try {
            const response = await apiClient.post('/pedidos', {
                mesa_id: mesaId,
                valor_total: valor_total,
                items: itemsParaApi // Envia o array formatado
            });

            const novoPedido: Order = {
                id: response.data.pedido_id.toString(), 
                items: items, // Salva o item original (com 'notes') no estado local
                status: 'recebido',
                createdAt: new Date(),
            };
            
            setOrders(currentOrders => [novoPedido, ...currentOrders]);
            console.log('✅ Pedido enviado com sucesso:', novoPedido.id);

        } catch (error) {
            console.error('❌ Erro ao enviar pedido:', error);
            throw error; 
        }
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
}