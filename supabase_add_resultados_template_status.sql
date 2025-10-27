-- Migration to ensure resultados.template and resultados.status exist and conform
BEGIN;

-- 1) Create enum type for status if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'resultado_status'
  ) THEN
    CREATE TYPE resultado_status AS ENUM ('Pendente','Enviado','Erro');
  END IF;
END
$$;

-- 2) Ensure status column exists and uses enum type with default 'Pendente'
DO $$
DECLARE
  status_exists BOOLEAN;
  status_is_text BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'resultados' AND column_name = 'status'
  ) INTO status_exists;

  IF NOT status_exists THEN
    ALTER TABLE public.resultados
      ADD COLUMN status resultado_status NOT NULL DEFAULT 'Pendente';
  ELSE
    -- Check if status is text/varchar
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'resultados' AND column_name = 'status'
        AND data_type IN ('text','character varying')
    ) INTO status_is_text;

    -- Backfill NULLs to 'Pendente'
    UPDATE public.resultados SET status = 'Pendente' WHERE status IS NULL;

    IF status_is_text THEN
      -- Force any invalid values to 'Pendente' then convert to enum
      UPDATE public.resultados SET status = 'Pendente'
      WHERE status NOT IN ('Pendente','Enviado','Erro');

      ALTER TABLE public.resultados
        ALTER COLUMN status TYPE resultado_status
        USING CASE
          WHEN status IN ('Pendente','Enviado','Erro') THEN status::resultado_status
          ELSE 'Pendente'::resultado_status
        END;
    END IF;

    -- Ensure default set to 'Pendente'
    ALTER TABLE public.resultados ALTER COLUMN status SET DEFAULT 'Pendente';
    -- Ensure NOT NULL constraint
    ALTER TABLE public.resultados ALTER COLUMN status SET NOT NULL;
  END IF;
END
$$;

-- 3) Ensure template column exists with default message and NOT NULL
DO $$
DECLARE
  template_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'resultados' AND column_name = 'template'
  ) INTO template_exists;

  IF NOT template_exists THEN
    ALTER TABLE public.resultados
      ADD COLUMN template TEXT NOT NULL DEFAULT (
        'Olá.\n\n' ||
        'Nossa equipe preparou um novo site para a sua empresa e gostaríamos de apresentá-lo, sem nenhum custo ou compromisso.\n\n' ||
        'Qual seria o melhor horário para agendarmos uma breve demonstração?\n\n' ||
        'Atenciosamente,\n\n' ||
        'Equipe IDEVA\n' ||
        '(Especialistas em Automação de Sistemas)'
      );
  ELSE
    -- Set default to the specified message and backfill NULLs
    ALTER TABLE public.resultados
      ALTER COLUMN template SET DEFAULT (
        'Olá.\n\n' ||
        'Nossa equipe preparou um novo site para a sua empresa e gostaríamos de apresentá-lo, sem nenhum custo ou compromisso.\n\n' ||
        'Qual seria o melhor horário para agendarmos uma breve demonstração?\n\n' ||
        'Atenciosamente,\n\n' ||
        'Equipe IDEVA\n' ||
        '(Especialistas em Automação de Sistemas)'
      );
    UPDATE public.resultados SET template = (
        'Olá.\n\n' ||
        'Nossa equipe preparou um novo site para a sua empresa e gostaríamos de apresentá-lo, sem nenhum custo ou compromisso.\n\n' ||
        'Qual seria o melhor horário para agendarmos uma breve demonstração?\n\n' ||
        'Atenciosamente,\n\n' ||
        'Equipe IDEVA\n' ||
        '(Especialistas em Automação de Sistemas)'
      )
      WHERE template IS NULL;
    ALTER TABLE public.resultados ALTER COLUMN template SET NOT NULL;
  END IF;
END
$$;

COMMIT;

-- After running this migration in Supabase SQL editor, go to Settings → API and click
-- "Refresh schema cache" to update PostgREST so the columns are recognized.