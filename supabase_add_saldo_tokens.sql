-- Adicionar coluna saldo_tokens na tabela usuarios
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS saldo_tokens INTEGER DEFAULT 0;

-- Criar índice para otimização
CREATE INDEX IF NOT EXISTS idx_usuarios_saldo_tokens ON usuarios(saldo_tokens);

-- Comentário na coluna
COMMENT ON COLUMN usuarios.saldo_tokens IS 'Saldo atual de tokens do usuário';
