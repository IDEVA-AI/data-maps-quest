-- Recriar view para relatório de transações
-- DROP e CREATE para garantir que a estrutura está correta

DROP VIEW IF EXISTS view_relatorio_transacoes;

CREATE OR REPLACE VIEW view_relatorio_transacoes AS
SELECT 
    t.id_transacao,
    t.id_usuario,
    u.nome as nome_usuario,
    u.email as email_usuario,
    t.produto_id,
    p.nome as produto_nome,
    t.qtd_tokens,
    t.valor as valor_pago,
    t.metodo_pagamento,
    t.created_at as data_transacao,
    t.updated_at as ultima_atualizacao
FROM 
    transacoes t
    INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
    LEFT JOIN produto p ON t.produto_id = p.id
ORDER BY 
    t.created_at DESC;

-- Dar permissão de leitura para usuários autenticados
GRANT SELECT ON view_relatorio_transacoes TO authenticated;
