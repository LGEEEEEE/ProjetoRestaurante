// Substitua o conteúdo completo do seu arquivo: src/components/AdminPanel.jsx

import React, { useState } from 'react';
import MenuManagementScreen from './MenuManagementScreen';
import SettingsScreen from './SettingsScreen';
import DashboardScreen from './DashboardScreen';
import CategoryManagementScreen from './CategoryManagementScreen';
import DevicePairingScreen from './DevicePairingScreen';
import CancellationHistoryScreen from './CancellationHistoryScreen'; 
import EquipeScreen from './EquipeScreen'; // <<< 1. IMPORTE A NOVA TELA

const styles = {
    // ... (seus estilos continuam os mesmos) ...
    panelContainer: {
        display: 'flex',
        height: '100vh', 
    },
    sidebar: {
        width: '260px',
        backgroundColor: '#1a202c',
        color: 'white',
        height: '100%',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box', 
    },
    sidebarHeader: {
        marginBottom: '2rem',
        textAlign: 'center',
    },
    sidebarTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'white',
        margin: 0,
        paddingBottom: '1rem',
        borderBottom: '1px solid #4a5568',
    },
    sidebarNav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem', 
    },
    sidebarButton: {
        background: 'transparent',
        border: 'none',
        color: '#a0aec0',
        padding: '0.75rem 1rem',
        width: '100%',
        textAlign: 'left',
        fontSize: '1rem',
        fontWeight: '500',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    activeButton: {
        backgroundColor: '#4299e1',
        color: '#ffffff',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px -1px rgba(66, 153, 225, 0.4)', 
    },
    mainContent: {
        flex: 1,
        padding: '2.5rem',
        backgroundColor: '#f4f7f9',
        overflowY: 'auto', 
    },
    logoutButton: {
        background: 'transparent',
        border: '1px solid #e53e3e',
        color: '#e53e3e',
        padding: '0.75rem',
        width: '100%',
        textAlign: 'center',
        fontSize: '1rem',
        fontWeight: 'bold',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginTop: 'auto', 
    },
};

function AdminPanel({ onLogout }) {
    const [activeScreen, setActiveScreen] = useState('dashboard');

    const renderScreen = () => {
        switch (activeScreen) {
            case 'dashboard':
                return <DashboardScreen />;
            case 'categories':
                return <CategoryManagementScreen />;
            case 'menu':
                return <MenuManagementScreen />;
            case 'equipe': // <<< 2. ADICIONE O NOVO 'CASE'
                return <EquipeScreen />;
            case 'settings':
                return <SettingsScreen />;
            case 'devices':
                return <DevicePairingScreen />;
            case 'problems': 
                return <CancellationHistoryScreen />;
            default:
                return <DashboardScreen />;
        }
    };

    const MenuButton = ({ id, label, icon }) => (
        <button
            style={{ ...styles.sidebarButton, ...(activeScreen === id && styles.activeButton) }}
            onClick={() => setActiveScreen(id)}
        >
            <span>{icon}</span>
            {label}
        </button>
    );

    return (
        <div style={styles.panelContainer}>
            <div style={styles.sidebar}>
                <div>
                    <div style={styles.sidebarHeader}>
                        <h2 style={styles.sidebarTitle}>Gestão do Restaurante</h2>
                    </div>
                    
                    <nav style={styles.sidebarNav}>
                        <MenuButton id="dashboard" label="Início" icon="🏠" />
                        <MenuButton id="categories" label="Categorias" icon="📂" />
                        <MenuButton id="menu" label="Cardápio" icon="🍔" />
                        <MenuButton id="equipe" label="Equipe" icon="👥" /> {/* <<< 3. ADICIONE O NOVO BOTÃO */}
                        <MenuButton id="settings" label="Configurações" icon="⚙️" />
                        <MenuButton id="problems" label="Histórico de Problemas" icon="⚠️" />
                        <MenuButton id="devices" label="Parear Dispositivo" icon="📱" />
                    </nav>
                </div>
                
                <button 
                    onClick={onLogout} 
                    style={styles.logoutButton}
                    onMouseOver={(e) => { e.target.style.backgroundColor = '#e53e3e'; e.target.style.color = 'white'; }}
                    onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#e53e3e'; }}
                >
                    Sair do Sistema
                </button>
            </div>
            
            <main style={styles.mainContent}>
                {renderScreen()}
            </main>
        </div>
    );
}

export default AdminPanel;