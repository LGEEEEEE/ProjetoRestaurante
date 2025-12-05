// Substitua o conteúdo do seu arquivo: app-tablet/src/context/CartContext.tsx

import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
// <<< --- CORREÇÃO AQUI (Linhas 4 e 5) --- <<<
import { Product } from './RestaurantContext'; // Era ../RestaurantContext
import { useAuth } from './AuthContext'; // Era ../AuthContext
import { Platform } from 'react-native'; 

export interface CartItem {
    product: Product;
    quantity: number;
    notes?: string; 
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, notes?: string) => void; 
    changeQuantity: (productId: string, amount: number) => void;
    removeFromCart: (productId: string) => void;
    totalPrice: number;
    clearCart: () => void;
    updateNotes: (productId: string, notes: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartLoading, setIsCartLoading] = useState(true); 
    const { mesaId } = useAuth(); 
    
    const CART_KEY = `tabletCart_${mesaId}`;

    // EFEITO 1: Carregar o carrinho
    useEffect(() => {
        if (!mesaId) return; 

        let storedCart: string | null = null;
        if (Platform.OS === 'web') {
            storedCart = localStorage.getItem(CART_KEY);
        }
        
        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                setItems(parsedCart);
            } catch (e) {
                console.error("Erro ao carregar carrinho salvo:", e);
                setItems([]); 
            }
        }
        setIsCartLoading(false); 
    }, [mesaId]); 

    // EFEITO 2: Salvar o carrinho
    useEffect(() => {
        if (isCartLoading || !mesaId) return; 

        if (Platform.OS === 'web') {
            localStorage.setItem(CART_KEY, JSON.stringify(items));
        }
    }, [items, mesaId, isCartLoading]); 

    // --- (Funções do Carrinho) ---

    const totalPrice = items.reduce((sum, item) => sum + item.product.preco * item.quantity, 0);

    const addToCart = (product: Product, notes?: string) => {
        setItems(currentItems => {
            const existingItemIndex = currentItems.findIndex(
                item => item.product.id === product.id && (item.notes || '') === (notes || '')
            );

            if (existingItemIndex > -1) {
                const newItems = [...currentItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + 1
                };
                return newItems;
            }
            return [...currentItems, { product, quantity: 1, notes: notes || '' }];
        });
    };

    const changeQuantity = (productId: string, amount: number) => {
        setItems(currentItems => {
            return currentItems.map(item => {
                if (item.product.id === productId) {
                    const newQuantity = item.quantity + amount;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter((item): item is CartItem => item !== null);
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(currentItems => {
            return currentItems.filter(item => item.product.id !== productId);
        });
    };

    const clearCart = () => {
        setItems([]);
        if (Platform.OS === 'web') {
            localStorage.removeItem(CART_KEY);
        }
    };
    
    const updateNotes = (productId: string, notes: string) => {
        setItems(currentItems => 
            currentItems.map(item => 
                item.product.id === productId ? { ...item, notes: notes } : item
            )
        );
    };

    if (isCartLoading && mesaId) {
        return null; 
    }

    return (
        <CartContext.Provider 
            value={{ items, addToCart, changeQuantity, removeFromCart, totalPrice, clearCart, updateNotes }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartContext');
    }
    return context;
}