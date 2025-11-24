
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) env[key.trim()] = value.trim()
})

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY'])

async function runMigration() {
    console.log('Running migration to add columns to transacoes table...')

    const sql = `
-- Adicionar colunas necessárias
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS produto_id UUID;
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS valor DECIMAL(10, 2);
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS qtd_tokens INTEGER;
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS metodo_pagamento VARCHAR(50);
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_transacoes_produto_id ON transacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_created_at ON transacoes(created_at);
    `

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
        console.error('Error running migration:', error.message)
        console.log('Note: You may need to run this SQL manually in the Supabase SQL Editor:')
        console.log(sql)
    } else {
        console.log('✅ Migration completed successfully!')
    }
}

runMigration()
