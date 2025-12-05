// Substitua o conteúdo completo do arquivo: kds-cozinha/src/components/LoginScreen.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a202c', // Fundo escuro moderno
    },
    box: {
        backgroundColor: 'white',
        padding: '3rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#2d3748',
        marginBottom: '0.5rem',
        marginTop: 0
    },
    subtitle: {
        color: '#a0aec0',
        fontSize: '0.9rem',
        marginBottom: '2rem',
        marginTop: 0
    },
    input: {
        width: '100%',
        padding: '1rem 0', // Padding vertical apenas, ajuda a centralizar
        fontSize: '2.2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: '0.6rem',
        marginBottom: '1.5rem',
        border: 'none',
        backgroundColor: '#edf2f7', // Fundo cinza claro para o input
        borderRadius: '12px',
        color: '#2d3748',
        fontFamily: 'monospace',
        outline: 'none',
        boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
        paddingLeft: '0.6rem', // Compensação visual para o letter-spacing
        boxSizing: 'border-box'
    },
    button: {
        width: '100%',
        padding: '1.2rem',
        backgroundColor: '#ed8936', // Laranja para combinar com cozinha (ou use #48bb78 para verde)
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        letterSpacing: '1px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 4px 6px -1px rgba(237, 137, 54, 0.3)'
    },
    buttonDisabled: {
        backgroundColor: '#f6ad55',
        cursor: 'not-allowed',
        opacity: 0.8
    },
    error: {
        color: '#c53030',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        backgroundColor: '#fff5f5',
        padding: '0.75rem',
        borderRadius: '8px',
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid #feb2b2'
    }
};

function LoginScreen() {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginWithToken } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!token) return;
        
        setLoading(true);
        setError('');
        
        try {
            await loginWithToken(token);
            // Sucesso! O componente pai (App.jsx) vai detectar a mudança no AuthContext
            // e trocar automaticamente para a tela do KDSBoard.
        } catch (err) {
            console.error(err);
            // Tenta pegar a mensagem de erro da API, ou usa uma genérica
            const msg = err.response?.data?.message || err.message || 'Falha ao conectar. Verifique o código.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form style={styles.box} onSubmit={handleLogin}>
                {/* Ícone ou Emoji opcional para dar um charme */}
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🍳</div>
                
                <h1 style={styles.title}>Login da Cozinha</h1>
                <p style={styles.subtitle}>Digite o código gerado no Painel Admin</p>
                
                <ol style={{ textAlign: 'left', color: '#718096', fontSize: '0.85rem', marginBottom: '1rem', paddingLeft: '1rem' }}>
                    <li>Pergunte ao gerente pelo código de pareamento</li>
                    <li>Digite abaixo exatamente como aparece (ex: ABC-123)</li>
                    <li>Confirme para conectar este KDS à cozinha</li>
                </ol>
                
                {error && <div style={styles.error}>{error}</div>}

                <input 
                    style={styles.input} 
                    value={token} 
                    onChange={(e) => setToken(e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase())}
                    placeholder="---"
                    maxLength={7}
                    autoFocus
                />
                
                <button 
                    type="submit" 
                    style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}} 
                    disabled={loading || token.length < 6}
                >
                    {loading ? 'CONECTANDO...' : 'CONECTAR'}
                </button>
            </form>
        </div>
    );
}

export default LoginScreen;