// Substitua o conteúdo do seu arquivo: src/api/apiClient.ts

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native'; 

const getBaseUrl = () => {
  return 'https://ffe61343b43a.ngrok-free.app'; // <<< Sua URL do ngrok
};

const API_BASE_URL = getBaseUrl();
console.log(`API_BASE_URL configurada para: ${API_BASE_URL}`); 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  
  // <<<--- CORREÇÃO ADICIONADA AQUI ---<<<
  // Adiciona o cabeçalho para pular a tela de aviso do Ngrok
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

apiClient.interceptors.request.use(
  async (config) => {
    let dataString: string | null = null;
    if (Platform.OS === 'web') {
        dataString = localStorage.getItem('tabletAuthData'); // <<< Lendo a chave correta
    } else {
        dataString = await SecureStore.getItemAsync('tabletAuthData'); // <<< Lendo a chave correta
    }
    
    if (dataString) {
        try {
            const authData = JSON.parse(dataString); 
            if (authData.token) {
                config.headers.Authorization = `Bearer ${authData.token}`;
            }
        } catch (e) {
            console.error('Interceptor: Falha ao parsear authData', e);
        }
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