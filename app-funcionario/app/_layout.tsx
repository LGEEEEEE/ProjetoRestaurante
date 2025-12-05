// Substitua o conteúdo do seu arquivo: app-funcionario/app/_layout.tsx
// VERSÃO 100% LIMPA (com espaços normais)

import React from 'react';
import { Stack } from 'expo-router';
import { SocketProvider } from '../src/context/SocketContext';
import { AuthProvider } from '../src/context/AuthContext';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <AuthProvider> 
      <SocketProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="history" /> 
        </Stack>
        <Toast />
      </SocketProvider>
    </AuthProvider>
  );
}
// GARANTA QUE O ARQUIVO TERMINE EXATAMENTE AQUI