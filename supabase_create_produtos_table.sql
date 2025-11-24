CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,      -- R$ 20.00
    
    -- Dados FUNCIONAIS
    qtd_tokens INTEGER NOT NULL,        -- O saldo que será creditado
    validade_dias INTEGER DEFAULT 60,   -- A validade do crédito
    
    -- Dados VISUAIS
    beneficios_html TEXT,               -- O bloco <ul><li>...</li></ul> pronto
    eh_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Produtos são públicos" ON produtos
    FOR SELECT
    USING (true);

-- Inserir dados iniciais
INSERT INTO produtos (nome, preco, qtd_tokens, eh_popular, beneficios_html)
VALUES 
-- Produto 1 (345 Tokens)
(
    '345 tokens', 
    20.00, 
    345, 
    FALSE,
    '<ul>
        <li>Até 345 mensagens</li>
        <li>Até 345 templates personalizados de mensagem</li>
        <li>Até 23 consultas de localização</li>
        <li>Validade de crédito de 2 meses</li>
        <li>Consulta por categoria/localização</li>
        <li>Mensagem personalizada por estabelecimento</li>
        <li>Disparo de mensagens para estabelecimentos consultados</li>
    </ul>'
),
-- Produto 2 (1050 Tokens)
(
    '1050 tokens', 
    59.90, 
    1050, 
    TRUE,
    '<ul>
        <li>Até 1050 mensagens</li>
        <li>Até 1050 templates personalizados de mensagem</li>
        <li>Até 70 consultas de localização</li>
        <li>Validade de crédito de 2 meses</li>
        <li>Consulta por categoria/localização</li>
        <li>Mensagem personalizada por estabelecimento</li>
        <li>Disparo de mensagens para estabelecimentos consultados</li>
    </ul>'
),
-- Produto 3 (2070 Tokens)
(
    '2070 tokens', 
    99.00, 
    2070, 
    FALSE,
    '<ul>
        <li>Até 1800 mensagens</li>
        <li>Até 1800 templates personalizados de mensagem</li>
        <li>Até 138 consultas de localização</li>
        <li>Validade de crédito de 2 meses</li>
        <li>Consulta por categoria/localização</li>
        <li>Mensagem personalizada por estabelecimento</li>
        <li>Disparo de mensagens para estabelecimentos consultados</li>
    </ul>'
);
