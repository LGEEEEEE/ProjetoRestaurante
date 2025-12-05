// Crie este arquivo em: src/components/EquipeScreen.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

// (Estilos no final do arquivo)

function EquipeScreen() {
    const [equipe, setEquipe] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingFuncionario, setEditingFuncionario] = useState(null);
    
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cargo: 'garcom',
        pin: ''
    });

    useEffect(() => {
        fetchEquipe();
    }, []);

    const fetchEquipe = async () => {
        try {
            setLoading(true);
            setErrorMessage('');
            const response = await apiClient.get('/funcionarios');
            setEquipe(response.data);
        } catch (error) {
            console.error('Erro ao buscar equipe:', error);
            setErrorMessage('Não foi possível carregar a equipe.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingFuncionario(null);
        setFormData({ nome: '', email: '', cargo: 'garcom', pin: '' });
        setIsFormVisible(true);
    };

    const handleEdit = (func) => {
        setEditingFuncionario(func);
        setFormData({
            nome: func.nome,
            email: func.email,
            cargo: func.cargo,
            pin: func.pin || ''
        });
        setIsFormVisible(true);
    };

    const handleCancel = () => {
        setIsFormVisible(false);
        setEditingFuncionario(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'pin' && value.length > 4) return; // Limita PIN a 4 dígitos
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingFuncionario) {
                const response = await apiClient.put(`/funcionarios/${editingFuncionario.id}`, formData);
                setEquipe(equipe.map(f => f.id === editingFuncionario.id ? response.data : f));
                setToastMessage('Funcionário atualizado com sucesso!');
            } else {
                const response = await apiClient.post('/funcionarios', formData);
                setEquipe([...equipe, response.data]);
                setToastMessage('Funcionário adicionado!');
            }
            handleCancel(); // Fecha e limpa o formulário
        } catch (error) {
            console.error('Erro ao salvar funcionário:', error);
            setErrorMessage('Não foi possível salvar o funcionário.');
        }
    };

    const handleDelete = async (funcId) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            try {
                await apiClient.delete(`/funcionarios/${funcId}`);
                setEquipe(equipe.filter(f => f.id !== funcId));
                setToastMessage('Funcionário removido.');
            } catch (error) {
                console.error('Erro ao deletar funcionário:', error);
                setErrorMessage('Não foi possível excluir o funcionário.');
            }
        }
    };

    return (
        <div>
            <div className="header">
                <h1>Gerenciar Equipe</h1>
                <button className="btn-primary" onClick={handleAddNew}>Adicionar Funcionário</button>
            </div>
            {(errorMessage || toastMessage) && (
                <div className={`alert ${errorMessage ? 'alert-error' : 'alert-success'}`}>
                    {errorMessage || toastMessage}
                    <button onClick={() => { setErrorMessage(''); setToastMessage(''); }}>×</button>
                </div>
            )}

            {loading ? (
                <div className="loading-state">Carregando equipe...</div>
            ) : equipe.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum funcionário cadastrado ainda.</p>
                    <button className="btn-secondary" onClick={handleAddNew}>Cadastrar primeiro</button>
                </div>
            ) : (
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Cargo</th>
                        <th>PIN</th>
                        <th style={{ width: '150px' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {equipe.map((func) => (
                        <tr key={func.id}>
                            <td>{func.nome}</td>
                            <td>{func.email}</td>
                            <td><span style={styles.cargoBadge(func.cargo)}>{func.cargo}</span></td>
                            <td>{func.pin ? '****' : 'N/A'}</td>
                            <td className="actions">
                                <button onClick={() => handleEdit(func)}>✏️ Editar</button>
                                <button onClick={() => handleDelete(func.id)}>🗑️ Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}

            {isFormVisible && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleSave}>
                        <h2>{editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
                        
                        <div className="form-group">
                            <label htmlFor="nome">Nome Completo</label>
                            <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">Email (para login)</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="cargo">Cargo</label>
                                <select id="cargo" name="cargo" value={formData.cargo} onChange={handleChange} required>
                                    <option value="garcom">Garçom</option>
                                    <option value="cozinha">Cozinha</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="pin">PIN de 4 dígitos</label>
                                <input 
                                    type="password" // para mascarar, mas pode ser "text"
                                    id="pin" 
                                    name="pin" 
                                    value={formData.pin} 
                                    onChange={handleChange} 
                                    maxLength={4} 
                                    placeholder="Ex: 1234"
                                    required 
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={handleCancel}>Cancelar</button>
                            <button type="submit" className="btn-primary">Salvar</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

// Estilos para os cargos
const styles = {
    cargoBadge: (cargo) => {
        let backgroundColor = '#e2e8f0';
        let color = '#4a5568';
        if (cargo === 'admin') {
            backgroundColor = '#fed7d7';
            color = '#c53030';
        } else if (cargo === 'garcom') {
            backgroundColor = '#c6f6d5';
            color = '#2f855a';
        } else if (cargo === 'cozinha') {
            backgroundColor = '#feebc8';
            color = '#c05621';
        }
        return {
            backgroundColor,
            color,
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        };
    }
};

export default EquipeScreen;