-- Adicionar colunas necessárias à tabela transacoes
-- Executar este SQL no Supabase SQL Editor

-- Primeiro, garantir que a tabela produto tem PRIMARY KEY
-- (caso não tenha)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'produto_pkey' AND conrelid = 'produto'::regclass
    ) THEN
        ALTER TABLE produto ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Adicionar produto_id SEM foreign key por enquanto
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS produto_id UUID;

-- Adicionar valor da transação
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS valor DECIMAL(10, 2);

-- Adicionar quantidade de tokens
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS qtd_tokens INTEGER;

-- Adicionar método de pagamento
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS metodo_pagamento VARCHAR(50);

-- Adicionar timestamps se não existirem
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_transacoes_produto_id ON transacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_created_at ON transacoes(created_at);

-- Adicionar FK constraint após garantir que a PK existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'transacoes_produto_id_fkey'
    ) THEN
        ALTER TABLE transacoes 
        ADD CONSTRAINT transacoes_produto_id_fkey 
        FOREIGN KEY (produto_id) REFERENCES produto(id);
    END IF;
END $$;

-- Comentários nas colunas para documentação
COMMENT ON COLUMN transacoes.produto_id IS 'Referência ao produto comprado';
COMMENT ON COLUMN transacoes.valor IS 'Valor total da transação em reais';
COMMENT ON COLUMN transacoes.qtd_tokens IS 'Quantidade de tokens creditados';
COMMENT ON COLUMN transacoes.metodo_pagamento IS 'Método de pagamento utilizado (PIX, CARD, etc)';
