// Substitua o conteúdo COMPLETO do seu arquivo: app-tablet/app/_layout.tsx

import React, { useEffect, useCallback } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { CartProvider } from '../src/context/CartContext';
import { OrderProvider } from '../src/context/OrderContext';
import { RestaurantProvider } from '../src/context/RestaurantContext'; 
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SocketProvider } from '../src/context/SocketContext'; // <<< Já estava aqui

// (Componente AppStackLayout continua o mesmo)
const AppStackLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) return; 
        const inAuthGroup = segments[0] === '(auth)';
        if (isAuthenticated && inAuthGroup) {
            router.replace('/'); 
        } else if (!isAuthenticated && !inAuthGroup) { 
            router.replace('/login');
        }
    }, [isAuthenticated, isLoading, segments, router]);

    if (isLoading) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
    }

    return (
        <Stack>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
    );
}

// Esta é a configuração final
export default function RootLayout() {
  return (
    //
    // --- ESTA É A ORDEM CORRETA DOS PROVIDERS ---
    //
    // 1. AuthProvider: Provê o token (precisa vir antes do Socket)
    // 2. SocketProvider: USA o Auth (para o token) e provê o Socket
    // 3. RestaurantProvider: USA o Socket (para atualizações em tempo real)
    // 4. OrderProvider: USA o Socket (para status) e o Auth (para o mesaId)
    // 5. CartProvider: Não depende de ninguém
    //
    <AuthProvider>
      <SocketProvider>
        <RestaurantProvider>
          <OrderProvider>
            <CartProvider>
              
              <AppStackLayout />
              
            </CartProvider>
          </OrderProvider>
        </RestaurantProvider>
      </SocketProvider>

      {/* O Toast fica no final, "flutuando" sobre tudo */}
      <Toast />
    </AuthProvider>
  );
}