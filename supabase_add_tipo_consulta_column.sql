-- Adiciona coluna para indicar a origem da consulta
alter table if exists public.consultas
  add column if not exists tipo_consulta text;

comment on column public.consultas.tipo_consulta is 'Origem da consulta (ex: API). Campo vazio indica execução via N8N';


