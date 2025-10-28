-- =====================================================
-- MIGRAÇÃO PARA SISTEMA DE DISPARO
-- Adiciona campos 'status' e 'template' na tabela resultados
-- =====================================================

-- 1. Adicionar campo 'status' com valor padrão 'Pendente'
ALTER TABLE resultados 
ADD COLUMN status VARCHAR(50) DEFAULT 'Pendente';

-- 2. Adicionar campo 'template' com template padrão
ALTER TABLE resultados 
ADD COLUMN template TEXT DEFAULT 'Olá, 
 
 Nossa equipe preparou um novo site para a sua empresa e gostaríamos de apresentá-lo, sem nenhum custo ou compromisso. 
 
 Qual seria o melhor horário para agendarmos uma breve demonstração? 
 
 Atenciosamente, 
 Equipe IDEVA(Especialistas em Automação de Sistemas)';

-- 3. Adicionar campos de controle de disparo
ALTER TABLE resultados 
ADD COLUMN sent_at TIMESTAMP NULL,
ADD COLUMN error_message TEXT NULL,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Criar índices para otimização
CREATE INDEX idx_resultados_status ON resultados(status);
CREATE INDEX idx_resultados_sent_at ON resultados(sent_at);
CREATE INDEX idx_resultados_updated_at ON resultados(updated_at);

-- 5. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resultados_updated_at 
    BEFORE UPDATE ON resultados 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS SOBRE OS NOVOS CAMPOS
-- =====================================================

COMMENT ON COLUMN resultados.status IS 'Status do disparo: Pendente, Gerado, Enviado, Erro';
COMMENT ON COLUMN resultados.template IS 'Template da mensagem personalizada para o contato';
COMMENT ON COLUMN resultados.sent_at IS 'Data e hora do envio da mensagem';
COMMENT ON COLUMN resultados.error_message IS 'Mensagem de erro caso o disparo falhe';
COMMENT ON COLUMN resultados.updated_at IS 'Data da última atualização do registro';

-- =====================================================
-- VALORES POSSÍVEIS PARA STATUS
-- =====================================================
-- 'Pendente'  - Contato identificado, aguardando geração de template
-- 'Gerado'    - Template criado, aguardando envio
-- 'Enviado'   - Mensagem enviada com sucesso  
-- 'Erro'      - Falha no processo (template ou envio)

-- =====================================================
-- EXEMPLO DE CONSULTAS ÚTEIS
-- =====================================================

-- Contar resultados por status
-- SELECT status, COUNT(*) FROM resultados GROUP BY status;

-- Buscar resultados pendentes de uma consulta específica
-- SELECT * FROM resultados WHERE consulta_id = 'UUID_DA_CONSULTA' AND status = 'Pendente';

-- Buscar resultados com erro
-- SELECT * FROM resultados WHERE status = 'Erro' AND error_message IS NOT NULL;

-- Atualizar status de um resultado específico
-- UPDATE resultados SET status = 'Enviado', sent_at = CURRENT_TIMESTAMP WHERE id = 'UUID_DO_RESULTADO';