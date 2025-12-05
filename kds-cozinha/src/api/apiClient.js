// Substitua o conteúdo: kds-cozinha/src/api/apiClient.js

import axios from 'axios';

// <<<--- CORREÇÃO APLICADA AQUI ---<<<
// Use a URL do Ngrok, a mesma do app-funcionario e do server.js
const API_BASE_URL = 'https://ffe61343b43a.ngrok-free.app'; 
// const API_BASE_URL = 'http://localhost:4000'; // Deixe esta comentada

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

// Interceptor para adicionar o token automaticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('kdsToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para lidar com token expirado (Erro 403/401)
apiClient.interceptors.response.use((response) => response, (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('kdsToken');
        window.location.reload(); // Força recarregamento para voltar ao login
    }
    return Promise.reject(error);
});

export { apiClient, API_BASE_URL };