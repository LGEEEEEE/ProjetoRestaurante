// Substitua o conteúdo COMPLETO do arquivo: painel-admin/src/components/ProductForm.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

function ProductForm({ product, onSave, onCancel }) {
  // Estado inicial agora inclui os novos campos
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria_id: '',
    imagem_url: '',
    disponivel: true,
    permite_observacoes: true, 
    opcoes_predefinidas: '',
    tipo_modificador: 'single', // <<< NOVO ESTADO (padrão 'single')
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Carrega dados do produto se estiver editando
    if (product) {
      setFormData({
        nome: product.nome || '',
        descricao: product.descricao || '',
        preco: product.preco || '',
        categoria_id: product.categoria_id || '',
        imagem_url: product.imagem_url || '',
        disponivel: product.disponivel !== undefined ? product.disponivel : true,
        permite_observacoes: product.permite_observacoes !== undefined ? product.permite_observacoes : true,
        opcoes_predefinidas: product.opcoes_predefinidas || '',
        tipo_modificador: product.tipo_modificador || 'single', // <<< CARREGA O ESTADO
      });
    }

    // Busca categorias para o <select>
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categorias');
        setCategories(response.data);
        if (!product && response.data.length > 0) {
          setFormData(prevData => ({ ...prevData, categoria_id: response.data[0].id }));
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };
    fetchCategories();
  }, [product]);

  // Handler universal para todos os inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  // Envia os dados para o componente pai (MenuManagementScreen)
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <form className="modal-content" onSubmit={handleSubmit}>
        <h2>{product ? 'Editar Prato' : 'Adicionar Novo Prato'}</h2>
        
        <div className="form-group">
          <label htmlFor="nome">Nome do Prato</label>
          <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
        </div>

        <div className="form-group">
            <label htmlFor="categoria_id">Categoria</label>
            <select id="categoria_id" name="categoria_id" value={formData.categoria_id} onChange={handleChange} required>
                <option value="" disabled>Selecione uma categoria</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
            </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea id="descricao" name="descricao" rows="3" value={formData.descricao} onChange={handleChange}></textarea>
        </div>

        <div className="form-row" style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
            <label htmlFor="preco">Preço (R$)</label>
            <input type="number" id="preco" name="preco" step="0.01" value={formData.preco} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{flex: 1}}>
            <label htmlFor="imagem_url">URL da Imagem</label>
            <input type="text" id="imagem_url" name="imagem_url" value={formData.imagem_url} onChange={handleChange} />
            </div>
        </div>

        {/* --- CAMPO NOVO DE OPÇÕES --- */}
        <div className="form-group">
            <label htmlFor="opcoes_predefinidas">Opções Pré-definidas (separadas por vírgula)</label>
            <input 
                type="text" 
                id="opcoes_predefinidas" 
                name="opcoes_predefinidas" 
                value={formData.opcoes_predefinidas} 
                onChange={handleChange}
                placeholder="Ex: Mal Passado, Ao Ponto, Bem Passado"
            />
        </div>

        {/* <<<--- NOVO SELETOR DE TIPO ---<<< */}
        <div className="form-group">
            <label htmlFor="tipo_modificador">Tipo das Opções Acima</label>
            <select 
                id="tipo_modificador" 
                name="tipo_modificador" 
                value={formData.tipo_modificador} 
                onChange={handleChange}
            >
                <option value="single">Seleção Única (ex: Ponto da carne)</option>
                <option value="multi">Múltipla Escolha (ex: Acompanhamentos)</option>
            </select>
            <small style={{color: '#777', marginTop: '5px', display: 'block'}}>
                * Se preenchido, o cliente verá botões em vez de um campo de texto livre.<br/>
                * Para adicionar preço, use colchetes: <strong><code>Extra Bacon[+5.00]</code></strong>
            </small>
        </div>

        {/* --- CHECKBOXES --- */}
        <div className="form-group" style={{display: 'flex', gap: '2rem', marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem'}}>
            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'normal'}}>
                <input
                    type="checkbox"
                    name="disponivel"
                    checked={formData.disponivel}
                    onChange={handleChange}
                    style={{width: 'auto', marginRight: '0.5rem'}}
                />
                Produto Disponível
            </label>

            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'normal'}}>
                <input
                    type="checkbox"
                    name="permite_observacoes"
                    checked={formData.permite_observacoes}
                    onChange={handleChange}
                    style={{width: 'auto', marginRight: '0.5rem'}}
                />
                Permitir Observações (se não houver opções)
            </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn-primary">Salvar</button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;