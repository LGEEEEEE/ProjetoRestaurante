// Substitua o arquivo: app-tablet/src/context/RestaurantContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { apiClient, API_BASE_URL } from '../api/apiClient'; 
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext'; // <<<--- 1. IMPORTAR O SOCKET

// (Interfaces Product, Category, RestaurantConfig continuam iguais...)
interface ApiProduct {
    id: string; categoria_id: string; nome: string; 
    preco: string; descricao: string; imagem_url: string; 
    disponivel: boolean;
    permite_observacoes?: boolean;
    opcoes_predefinidas?: string;
    tipo_modificador?: string;
}
export interface Product { 
    id: string; categoria_id: string; nome: string; 
    preco: number; descricao: string; imagem_url: string; 
    disponivel: boolean;
    permite_observacoes?: boolean; 
    opcoes_predefinidas?: string;  
    tipo_modificador?: string;
}
export interface Category { id: string; nome: string; }
interface RestaurantConfig {
    nome_fantasia: string; logo_url: string; cor_primaria: string;
    cor_secundaria: string; taxa_servico: string | number; chave_pix: string;
}
interface RestaurantContextType {
    config: RestaurantConfig | null;
    menu: { categories: Category[]; products: Product[] };
    loading: boolean;
}
// (Função fixImageUrl continua igual...)
const fixImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<RestaurantConfig | null>(null);
    const [menu, setMenu] = useState<{ categories: Category[], products: Product[] }>({ categories: [], products: [] });
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const socket = useSocket(); // <<<--- 2. USAR O HOOK DO SOCKET

    // Efeito para buscar dados iniciais (sem mudanças)
    useEffect(() => {
        if (authLoading || !isAuthenticated) {
            setLoading(false); 
            return;
        }
        const fetchData = async () => { /* ... (código igual ao anterior) ... */ 
            console.log("📡 RestaurantContext: Buscando config e menu...");
            setLoading(true);
            try {
                const [configResponse, menuResponse] = await Promise.all([
                    apiClient.get('/restaurante/config'),
                    apiClient.get('/menu') 
                ]);
                const configData = configResponse.data;
                configData.logo_url = fixImageUrl(configData.logo_url);
                setConfig(configData);
                const menuData = menuResponse.data;
                const productsWithFixedUrls = menuData.products.map((product: ApiProduct) => ({
                    ...product,
                    preco: parseFloat(product.preco), 
                    imagem_url: fixImageUrl(product.imagem_url),
                }));
                setMenu({ categories: menuData.categories, products: productsWithFixedUrls });
                console.log("✅ Config e Menu carregados.");
            } catch (error) { console.error("❌ Falha ao buscar dados do restaurante:", error);
            } finally { setLoading(false); }
        };
        fetchData();
    }, [isAuthenticated, authLoading]);

    // <<<--- 3. NOVO EFEITO PARA OUVIR O SOCKET ---<<<
    useEffect(() => {
        // Só executa se o socket estiver conectado
        if (!socket) return;

        // Função que o socket vai chamar
        const handleStockUpdate = (data: { productId: string, disponivel: boolean }) => {
            console.log(`🔔 Socket: Estoque atualizado para ${data.productId}`, data);
            
            // Atualiza o estado do 'menu' localmente
            setMenu(currentMenu => ({
                ...currentMenu,
                products: currentMenu.products.map(p => 
                    // Encontra o produto pelo ID e atualiza seu status 'disponivel'
                    p.id.toString() === data.productId ? { ...p, disponivel: data.disponivel } : p
                )
            }));
        };

        // Começa a ouvir o evento
        socket.on('estoque_atualizado', handleStockUpdate);

        // Limpa o listener quando o componente desmontar
        return () => {
            socket.off('estoque_atualizado', handleStockUpdate);
        };
    }, [socket]); // Depende apenas do socket

    const value = { config, menu, loading };

    return (
        <RestaurantContext.Provider value={value}>
            {children}
        </RestaurantContext.Provider>
    );
}

export function useRestaurant() {
    const context = useContext(RestaurantContext);
    if (context === undefined) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
}