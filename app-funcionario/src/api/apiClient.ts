// Substitua o conteúdo do seu arquivo: app-funcionario/src/api/apiClient.ts

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native'; 

// ATENÇÃO: Use a mesma URL do ngrok do app-tablet
const API_BASE_URL = 'https://ffe61343b43a.ngrok-free.app'; 

console.log(`API_BASE_URL (Funcionário) configurada para: ${API_BASE_URL}`);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  
  // <<<--- CORREÇÃO ADICIONADA AQUI ---<<<
  // Adiciona o cabeçalho para pular a tela de aviso do Ngrok
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

// Interceptor que adiciona o token do FUNCIONÁRIO em cada requisição
apiClient.interceptors.request.use(
  async (config) => {
    let token: string | null = null;
    if (Platform.OS === 'web') {
        token = localStorage.getItem('funcionarioAuthToken'); 
    } else {
        token = await SecureStore.getItemAsync('funcionarioAuthToken'); 
    }
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // <<<--- ADICIONADO TAMBÉM NO INTERCEPTOR (GARANTIA) ---<<<
    // Garante que o cabeçalho anti-ngrok esteja em TODAS as requisições
    config.headers['ngrok-skip-browser-warning'] = 'true';

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { apiClient, API_BASE_URL };