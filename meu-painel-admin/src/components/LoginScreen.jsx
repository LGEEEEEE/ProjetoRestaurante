// Substitua o conteúdo do seu arquivo: src/components/LoginScreen.jsx

import React, { useState } from 'react';
// <<<--- CORREÇÃO: Importar seu apiClient em vez do 'axios'
import apiClient from '../api/axiosConfig'; 

const styles = {
    loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f9' },
    loginBox: { padding: '2rem 3rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
    loginTitle: { marginBottom: '2rem', fontSize: '1.75rem' },
    formGroup: { marginBottom: '1rem', textAlign: 'left' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '0.25rem', boxSizing: 'border-box' },
    button: { width: '100%', backgroundColor: '#4299e1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' },
    toggleLink: { marginTop: '1.5rem', color: '#4299e1', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' },
    errorText: { color: 'red', textAlign: 'center', marginBottom: '1rem' }
};

function LoginScreen({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
        // <<<--- CORREÇÃO: Usar apiClient (URL já está configurada)
        const response = await apiClient.post('/auth/login', {
            email: email,
            senha: password,
        });
        
        localStorage.setItem('authToken', response.data.token);
        onLoginSuccess();

    } catch (error) {
        console.error('Erro no login:', error);
        const errorMessage = error.response?.data?.message || 'Não foi possível fazer o login.';
        setError(errorMessage);
    }
  };
  
  const handleRegister = async () => {
    setError(''); 
    const registrationData = {
      nome_fantasia: restaurantName,
      cnpj: cnpj,
      email: email,
      senha: password,
    };

    try {
      // <<<--- CORREÇÃO: Usar apiClient (URL já está configurada)
      const response = await apiClient.post('/auth/register', registrationData);
      alert(response.data.message);
      setIsRegistering(false);

    } catch (error) {
      console.error('Erro no registro:', error);
      const errorMessage = error.response?.data?.message || 'Não foi possível registrar. Tente novamente.';
      alert(errorMessage);
    }
  };
  
  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        {isRegistering ? (
          <>
            <h1 style={styles.loginTitle}>Registrar sua Empresa</h1>
            <div style={styles.formGroup}><label style={styles.label} htmlFor="restaurantName">Nome do Restaurante</label><input style={styles.input} type="text" id="restaurantName" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label} htmlFor="cnpj">CNPJ</label><input style={styles.input} type="text" id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label} htmlFor="email">Email do Administrador</label><input style={styles.input} type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label} htmlFor="password">Senha</label><input style={styles.input} type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <button style={styles.button} onClick={handleRegister}>Registrar</button>
            <p style={styles.toggleLink} onClick={() => setIsRegistering(false)}>Já tem uma conta? Faça o login</p>
          </>
        ) : (
          <>
            <h1 style={styles.loginTitle}>Painel Administrativo</h1>
            <div style={styles.formGroup}><label style={styles.label} htmlFor="email">Email</label><input style={styles.input} type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label} htmlFor="password">Senha</label><input style={styles.input} type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {error && <p style={styles.errorText}>{error}</p>}
            <button style={styles.button} onClick={handleLogin}>Entrar</button>
            <p style={styles.toggleLink} onClick={() => setIsRegistering(true)}>Não tem uma conta? Registre-se</p>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginScreen;