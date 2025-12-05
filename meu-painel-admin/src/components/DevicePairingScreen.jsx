// Substitua o conteúdo completo do seu arquivo: painel-admin/src/components/DevicePairingScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/axiosConfig';
import { io } from 'socket.io-client';

const styles = {
    container: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
    },
    title: {
        fontSize: '2rem',
        marginBottom: '1rem',
        color: '#1a202c',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#555',
        marginBottom: '2rem',
    },
    tokenBox: {
        backgroundColor: '#f0fff4',
        border: '2px dashed #48bb78',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
    },
    tokenType: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#2f855a',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
    },
    token: {
        fontSize: '3.5rem',
        fontWeight: '800',
        color: '#22543d',
        letterSpacing: '0.5rem',
        fontFamily: 'monospace',
        margin: '1rem 0',
    },
    timer: {
        fontSize: '1.1rem',
        color: '#e53e3e',
        fontWeight: 'bold',
    },
    buttonGroup: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginTop: '2rem',
    },
    button: {
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
        color: 'white',
        transition: 'transform 0.1s',
    },
    btnTablet: {
        backgroundColor: '#4299e1',
    },
    btnCozinha: {
        backgroundColor: '#ed8936',
    },
    btnGarcom: {
        backgroundColor: '#48bb78',
    },
    cancelButton: {
        marginTop: '1rem',
        backgroundColor: 'transparent',
        border: '1px solid #cbd5e0',
        color: '#718096',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    loading: {
        fontSize: '1.5rem',
        color: '#555',
    },
    successMessage: {
        color: '#48bb78',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginBottom: '1rem',
        animation: 'fadeIn 0.5s',
    }
};

function DevicePairingScreen() {
    const [tokenData, setTokenData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const socketRef = useRef(null);

    // Efeito para controlar a contagem regressiva do timer
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (timer === 0 && tokenData) {
            // Se o tempo acabou, limpa o token da tela
            setTokenData(null);
        }
    }, [timer, tokenData]);

    // Efeito para conectar ao Socket.io e ouvir quando o token for usado
    useEffect(() => {
        if (tokenData) {
            // <<<--- CORREÇÃO DA URL DO SOCKET.IO ---<<<
            const socketUrl = 'https://3560d00581bb.ngrok-free.app';
            socketRef.current = io(socketUrl, {
                 // Adicionado para pular o aviso do Ngrok na conexão do socket
                extraHeaders: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            console.log("Admin ouvindo por confirmação de pareamento...");

            socketRef.current.on('token_usado', (data) => {
                console.log('Evento token_usado recebido:', data);
                
                if (data.token === tokenData.token) {
                    setSuccessMsg('Dispositivo conectado com sucesso!');
                    setTimeout(() => {
                        setTokenData(null);
                        setSuccessMsg('');
                        setTimer(0);
                    }, 1500);
                }
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [tokenData]);

    const handleGenerateToken = async (cargo_destino) => {
        setIsLoading(true);
        setError(null);
        setSuccessMsg('');
        try {
            // O 'apiClient' já usa a URL correta do Ngrok
            const response = await apiClient.post('/dispositivos/gerar-token', {
                cargo_destino: cargo_destino
            });
            setTokenData({
                token: response.data.token,
                cargo: cargo_destino
            });
            setTimer(300); // 5 minutos em segundos
        } catch (error) {
            console.error('Erro ao gerar token:', error);
            setError('Não foi possível gerar o token. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setTokenData(null);
        setTimer(0);
        setError(null);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const cargoLabels = {
        tablet: 'Tablet (Mesa)',
        cozinha: 'Tela da Cozinha (KDS)',
        garcom: 'App do Garçom'
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Central de Dispositivos</h1>
            <p style={styles.subtitle}>
                Gere um código único para conectar cada novo dispositivo ao seu restaurante.
            </p>

            {successMsg ? (
                <div style={styles.successMessage}>
                    ✅ {successMsg}
                </div>
            ) : tokenData ? (
                <div style={styles.tokenBox}>
                    <p style={styles.tokenType}>
                        Este código é para: {cargoLabels[tokenData.cargo]}
                    </p>
                    <h2 style={styles.token}>{tokenData.token}</h2>
                    <p style={styles.timer}>Expira em: {formatTime(timer)}</p>
                    <p style={{ marginTop: '1rem', color: '#555', marginBottom: '1.5rem' }}>
                        Digite este código na tela de login do dispositivo.
                    </p>
                    <button style={styles.cancelButton} onClick={handleReset}>
                        Cancelar / Gerar Outro
                    </button>
                </div>
            ) : (
                <div>
                    <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Qual dispositivo você quer conectar?</p>
                    <div style={styles.buttonGroup}>
                        <button
                            style={{ ...styles.button, ...styles.btnTablet }}
                            onClick={() => handleGenerateToken('tablet')}
                            disabled={isLoading}
                        >
                            📱 Tablet Mesa
                        </button>
                        <button
                            style={{ ...styles.button, ...styles.btnCozinha }}
                            onClick={() => handleGenerateToken('cozinha')}
                            disabled={isLoading}
                        >
                            👨‍🍳 Tela Cozinha
                        </button>
                        <button
                            style={{ ...styles.button, ...styles.btnGarcom }}
                            onClick={() => handleGenerateToken('garcom')}
                            disabled={isLoading}
                        >
                            🤵 App Garçom
                        </button>
                    </div>
                </div>
            )}

            {isLoading && <p style={styles.loading}>Gerando código...</p>}
            {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        </div>
    );
}

export default DevicePairingScreen;