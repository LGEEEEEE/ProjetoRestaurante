// src/components/CategoryManagementScreen.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

function CategoryManagementScreen() {
  const [categories, setCategories] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  // Busca as categorias ao carregar a tela
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categorias');
        setCategories(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        alert('Não foi possível carregar as categorias.');
      }
    };
    fetchCategories();
  }, []);

  const handleAddNew = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsFormVisible(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.nome);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Lógica de ATUALIZAR (PUT)
        const response = await apiClient.put(`/categorias/${editingCategory.id}`, { nome: categoryName });
        setCategories(categories.map(cat => cat.id === editingCategory.id ? response.data : cat));
      } else {
        // Lógica de CRIAR (POST)
        const response = await apiClient.post('/categorias', { nome: categoryName });
        setCategories([...categories, response.data]);
      }
      handleCancel(); // Fecha e limpa o formulário
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Não foi possível salvar a categoria.');
    }
  };
  
  const handleDelete = async (categoryId) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Todos os produtos nela também serão excluídos.')) {
      try {
        await apiClient.delete(`/categorias/${categoryId}`);
        setCategories(categories.filter(cat => cat.id !== categoryId));
      } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        alert('Não foi possível excluir a categoria.');
      }
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Gerenciar Categorias</h1>
        <button className="btn-primary" onClick={handleAddNew}>Adicionar Nova Categoria</button>
      </div>
      <table className="product-table">
        <thead>
          <tr>
            <th>Nome da Categoria</th>
            <th style={{ width: '150px' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.nome}</td>
              <td className="actions">
                <button onClick={() => handleEdit(cat)}>✏️ Editar</button>
                <button onClick={() => handleDelete(cat.id)}>🗑️ Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {isFormVisible && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSave}>
            <h2>{editingCategory ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</h2>
            <div className="form-group">
              <label htmlFor="categoryName">Nome da Categoria</label>
              <input type="text" id="categoryName" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
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

export default CategoryManagementScreen;