// Substitua o conteúdo COMPLETO do arquivo: app-tablet/app/(app)/_layout.tsx

import React from 'react';
import { Stack, useRouter } from 'expo-router'; // <<< 1. Importar useRouter
import { useRestaurant } from '../../src/context/RestaurantContext'; 
import { TouchableOpacity } from 'react-native'; // <<< 2. Importar TouchableOpacity
import { Feather } from '@expo/vector-icons'; // <<< 3. Importar Feather (para o ícone da seta)

export default function AppLayout() {
  const { config } = useRestaurant();
  const router = useRouter(); // <<< 4. Inicializar o router
  
  const primaryColor = config?.cor_primaria || '#e34040';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: primaryColor,
        },
        headerTintColor: '#fff', 
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      
      <Stack.Screen 
        name="menu" 
        options={{ 
          title: 'Cardápio',
          headerBackVisible: false,
          gestureEnabled: false,
        }} 
      />
      
      <Stack.Screen 
        name="product/[productId]" 
        options={{ 
          title: 'Detalhes do Produto',
          headerBackTitle: "Voltar", 
        }} 
      />
      
      <Stack.Screen 
        name="cart" 
        options={{ 
          title: 'Carrinho',
          headerBackTitle: "Voltar",
        }} 
      />
      
      <Stack.Screen 
        name="orders" 
        options={{ 
          title: 'Meus Pedidos',
          // <<< 5. ADICIONAMOS ISSO PARA FORÇAR A SETA <<<
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/menu')} // Sempre volta para o menu
              style={{ marginLeft: 10, padding: 5 }}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />

      <Stack.Screen 
        name="bill" 
        options={{ 
          title: 'Fechar a Conta',
          // Também vamos adicionar no 'bill.tsx' para garantir
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/menu')} 
              style={{ marginLeft: 10, padding: 5 }}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
    </Stack>
  );
}