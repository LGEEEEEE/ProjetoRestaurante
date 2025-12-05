// Substitua o conteúdo do seu arquivo: src/components/MenuManagementScreen.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import ProductTable from './ProductTable';
import ProductForm from './ProductForm';

function MenuManagementScreen() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          apiClient.get('/produtos'),
          apiClient.get('/categorias')
        ]);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        alert('Não foi possível carregar os dados do cardápio.');
      }
    };
    fetchData();
  }, []);

  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        const response = await apiClient.put(`/produtos/${editingProduct.id}`, productData);
        const updatedProduct = response.data;
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      } else {
        const response = await apiClient.post('/produtos', productData);
        const newProduct = response.data;
        setProducts(currentProducts => [...currentProducts, newProduct]);
      }
      setIsFormVisible(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Erro ao salvar o produto:', error);
      alert('Não foi possível salvar o produto.');
    }
  };
  
  const handleAddNew = () => { 
    setEditingProduct(null); 
    setIsFormVisible(true); 
  };

  const handleEdit = (product) => { 
    setEditingProduct(product); 
    setIsFormVisible(true); 
  };
  
  const handleDelete = async (productId) => { 
    if (window.confirm('Tem certeza que deseja excluir este prato? Esta ação não pode ser desfeita.')) {
        try {
            await apiClient.delete(`/produtos/${productId}`);
            setProducts(products.filter(p => p.id !== productId));
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            alert('Não foi possível excluir o produto.');
        }
    }
  };
  
  const handleCancel = () => { 
    setIsFormVisible(false); 
    setEditingProduct(null); 
  };

  const handleToggleAvailability = async (product) => {
    const newAvailability = !product.disponivel;
    setProducts(products.map(p => 
      p.id === product.id ? { ...p, disponivel: newAvailability } : p
    ));

    try {
      await apiClient.put(`/produtos/${product.id}/disponibilidade`, { 
        disponivel: newAvailability 
      });
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      alert('Não foi possível atualizar o status. Revertendo.');
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, disponivel: !newAvailability } : p
      ));
    }
  };

  const filteredProducts = products.filter(product => 
    product.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="header">
        <h1>Gerenciamento de Cardápio</h1>
        <button className="btn-primary" onClick={handleAddNew}>Adicionar Novo Prato</button>
      </div>

      <div className="search-bar-container">
        <input 
          type="text"
          placeholder="Pesquisar prato pelo nome..."
          className="search-bar-input"
          value={searchTerm}
          // <<<--- CORREÇÃO DO BUG DE DIGITAÇÃO ---<<<
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <ProductTable 
        products={filteredProducts} 
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggleAvailability}
      />
      
      {isFormVisible && (
        <ProductForm 
          product={editingProduct}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default MenuManagementScreen;