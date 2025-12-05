// Substitua o conteúdo do seu arquivo: servidor-backend/init-db.js

const pool = require('./db');

const setupQuery = `
CREATE TABLE IF NOT EXISTS restaurantes (
  id SERIAL PRIMARY KEY,
  nome_fantasia VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  logo_url TEXT,
  cor_primaria VARCHAR(7),
  cor_secundaria VARCHAR(7),
  chave_pix VARCHAR(255),
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  restaurante_id INT NOT NULL,
  nome VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  cargo VARCHAR(50) NOT NULL DEFAULT 'gerente',
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_restaurante
    FOREIGN KEY(restaurante_id) 
    REFERENCES restaurantes(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  restaurante_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  ordem_exibicao INT,
  CONSTRAINT fk_restaurante_cat
    FOREIGN KEY(restaurante_id)
    REFERENCES restaurantes(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  categoria_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  imagem_url TEXT,
  disponivel BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_categoria
    FOREIGN KEY(categoria_id)
    REFERENCES categorias(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mesas (
  id SERIAL PRIMARY KEY,
  restaurante_id INT NOT NULL,
  numero INT NOT NULL,
  status VARCHAR(50) DEFAULT 'livre',
  CONSTRAINT fk_restaurante_mesa
    FOREIGN KEY(restaurante_id)
    REFERENCES restaurantes(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  mesa_id INT NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'recebido',
  data_hora_pedido TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_mesa
    FOREIGN KEY(mesa_id)
    REFERENCES mesas(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario_momento DECIMAL(10, 2) NOT NULL,
  observacoes TEXT,
  CONSTRAINT fk_pedido
    FOREIGN KEY(pedido_id)
    REFERENCES pedidos(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_produto
    FOREIGN KEY(produto_id)
    REFERENCES produtos(id)
);

CREATE TABLE IF NOT EXISTS tokens_pareamento (
  id SERIAL PRIMARY KEY,
  restaurante_id INT NOT NULL,
  token VARCHAR(10) NOT NULL UNIQUE,
  usado BOOLEAN DEFAULT FALSE,
  expira_em TIMESTAMPTZ NOT NULL,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  cargo_destino VARCHAR(50) NOT NULL DEFAULT 'tablet',
  CONSTRAINT fk_restaurante_token
    FOREIGN KEY(restaurante_id)
    REFERENCES restaurantes(id)
    ON DELETE CASCADE
);

ALTER TABLE IF EXISTS tokens_pareamento
  ADD COLUMN IF NOT EXISTS cargo_destino VARCHAR(50) NOT NULL DEFAULT 'tablet';

CREATE INDEX IF NOT EXISTS idx_tokens_pareamento_token ON tokens_pareamento(token);
`;

pool.query(setupQuery)
  .then(res => {
    console.log('Todas as tabelas (incluindo tokens_pareamento) foram verificadas/criadas com sucesso!');
    pool.end();
  })
  .catch(err => {
    console.error('Erro ao configurar tabelas:', err);
    pool.end();
  });