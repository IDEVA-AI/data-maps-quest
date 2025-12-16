-- Desabilitar RLS na tabela 'resultados' para permitir inserção via aplicação
-- Motivo: A autenticação atual utiliza uma tabela própria 'usuarios' e não o Supabase Auth nativo.
-- Portanto, o banco de dados não consegue identificar o usuário logado via auth.uid(), causando erros de permissão e tipagem.

ALTER TABLE public.resultados DISABLE ROW LEVEL SECURITY;

-- Se precisar reabilitar no futuro com Supabase Auth integrado:
-- ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
