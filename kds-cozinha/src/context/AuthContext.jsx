// Crie este arquivo em: kds-cozinha/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [kdsToken, setKdsToken] = useState(localStorage.getItem('kdsToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se já tem token salvo ao carregar
    const storedToken = localStorage.getItem('kdsToken');
    if (storedToken) {
        setKdsToken(storedToken);
    }
    setLoading(false);
  }, []);

  const loginWithToken = async (tokenPareamento) => {
    try {
        // Usa a mesma rota de pareamento, mas agora ela retorna um token com cargo 'cozinha'
        const response = await apiClient.post('/dispositivos/parear', {
            token_pareamento: tokenPareamento
        });

        const { token, cargo } = response.data;

        if (cargo !== 'cozinha') {
            throw new Error(`Este token é para '${cargo}', não para a Cozinha.`);
        }

        localStorage.setItem('kdsToken', token);
        setKdsToken(token);
        return true;
    } catch (error) {
        console.error("Erro no pareamento:", error);
        throw error; // Lança o erro para a tela de login mostrar
    }
  };

  const logout = () => {
      localStorage.removeItem('kdsToken');
      setKdsToken(null);
  };

  return (
    <AuthContext.Provider value={{ kdsToken, isAuthenticated: !!kdsToken, loginWithToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}