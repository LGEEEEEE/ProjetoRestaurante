// Substitua o conteúdo do seu arquivo: src/components/ProductTable.jsx

import React from 'react';

// A tabela agora recebe 'onToggle' como uma nova propriedade
function ProductTable({ products, categories, onEdit, onDelete, onToggle }) {

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.nome : 'N/A';
  };

  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>Foto</th>
          <th>Nome do Prato</th>
          <th>Categoria</th>
          <th>Preço</th>
          <th>Status (Disponível)</th> {/* <<< Título Atualizado */}
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>
              <img src={product.imagem_url || 'https://via.placeholder.com/150'} alt={product.nome} />
            </td>
            <td>{product.nome}</td>
            <td>{getCategoryName(product.categoria_id)}</td>
            <td>{`R$ ${parseFloat(product.preco).toFixed(2)}`}</td>
            
            {/* --- COLUNA DE STATUS ATUALIZADA --- */}
            <td>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={product.disponivel} 
                  onChange={() => onToggle(product)} 
                />
                <span className="slider"></span>
              </label>
            </td>
            {/* --- FIM DA ATUALIZAÇÃO --- */}

            <td className="actions">
              <button onClick={() => onEdit(product)}>✏️</button>
              <button onClick={() => onDelete(product.id)}>🗑️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProductTable;