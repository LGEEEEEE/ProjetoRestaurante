// Substitua o conteúdo do seu arquivo: src/App.jsx

import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';

function App() {
  // <<< --- MUDANÇA PRINCIPAL: O ESTADO INICIAL AGORA VERIFICA O LOCALSTORAGE --- >>>
  // O !! transforma o valor (que pode ser uma string ou null) em um booleano (true ou false)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // <<< --- NOVO: FUNÇÃO PARA FAZER LOGOUT --- >>>
  const handleLogout = () => {
    // Remove o token do localStorage
    localStorage.removeItem('authToken');
    // Atualiza o estado para deslogado
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Passamos a função de logout para o painel poder usá-la
  return <AdminPanel onLogout={handleLogout} />;
}

export default App;