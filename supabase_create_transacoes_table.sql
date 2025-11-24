-- Tabela para registrar transações de pagamento
CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    produto_id UUID REFERENCES produto(id),
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL, -- 'pending', 'paid', 'failed'
    valor DECIMAL(10, 2) NOT NULL,
    qtd_tokens INTEGER NOT NULL,
    metodo_pagamento VARCHAR(50), -- 'PIX', 'CARD'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_transacoes_usuario ON transacoes(id_usuario);
CREATE INDEX IF NOT EXISTS idx_transacoes_transaction_id ON transacoes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);

-- RLS
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas suas próprias transações
CREATE POLICY "Usuários veem suas transações" ON transacoes
    FOR SELECT
    USING (id_usuario = (SELECT id_usuario FROM usuarios WHERE id_usuario = auth.uid()::integer));

-- Política: permitir inserção (para o sistema creditar)
CREATE POLICY "Sistema pode inserir transações" ON transacoes
    FOR INSERT
    WITH CHECK (true);
