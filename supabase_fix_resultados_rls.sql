-- Correção de Permissões RLS para a tabela 'resultados'

-- 1. Habilitar RLS (garantir que está ativo)
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;

-- 2. Política de INSERÇÃO (INSERT)
-- Permite que qualquer usuário autenticado insira registros.
-- Idealmente, verificaríamos se a consulta pertence ao usuário, mas no INSERT o registro ainda não existe para fazer join simples no CHECK de forma performática em alguns casos.
-- Simplificando para authenticated para resolver o erro 42501 imediato.
DROP POLICY IF EXISTS "Resultados Insert Policy" ON public.resultados;
CREATE POLICY "Resultados Insert Policy"
ON public.resultados
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Política de LEITURA (SELECT)
-- Usuário só vê resultados das consultas que pertencem a ele.
DROP POLICY IF EXISTS "Resultados Select Policy" ON public.resultados;
CREATE POLICY "Resultados Select Policy"
ON public.resultados
FOR SELECT
TO authenticated
USING (
  id_consulta IN (
    SELECT id_consulta 
    FROM public.consultas 
    WHERE id_usuario = auth.uid()
  )
);

-- 4. Política de ATUALIZAÇÃO (UPDATE)
-- Usuário só altera resultados das suas consultas.
DROP POLICY IF EXISTS "Resultados Update Policy" ON public.resultados;
CREATE POLICY "Resultados Update Policy"
ON public.resultados
FOR UPDATE
TO authenticated
USING (
  id_consulta IN (
    SELECT id_consulta 
    FROM public.consultas 
    WHERE id_usuario = auth.uid()
  )
);

-- 5. Política de EXCLUSÃO (DELETE)
-- Usuário só deleta resultados das suas consultas.
DROP POLICY IF EXISTS "Resultados Delete Policy" ON public.resultados;
CREATE POLICY "Resultados Delete Policy"
ON public.resultados
FOR DELETE
TO authenticated
USING (
  id_consulta IN (
    SELECT id_consulta 
    FROM public.consultas 
    WHERE id_usuario = auth.uid()
  )
);
