
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

async function checkTransacoesStructure() {
    console.log('Checking transacoes table structure...')

    // Inserir e depois deletar para ver os campos
    const testData = {
        id_usuario: 1,
        produto_id: 'test',
        transaction_id: 'test_' + Date.now(),
        status: 'pending',
        valor: 10.0,
        qtd_tokens: 100,
        metodo_pagamento: 'PIX'
    }

    const { data, error } = await supabase
        .from('transacoes')
        .insert([testData])
        .select()

    if (error) {
        console.log('Error inserting test data:', error.message)
        console.log('Error details:', error)
    } else {
        console.log('Successfully inserted test data!')
        console.log('Returned fields:', Object.keys(data[0]))
        console.log('Sample row:', data[0])

        // Deletar o registro de teste
        await supabase
            .from('transacoes')
            .delete()
            .eq('transaction_id', testData.transaction_id)
        console.log('Test data deleted')
    }
}

checkTransacoesStructure()
