
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

async function getTableStructure() {
    console.log('Getting transacoes table structure...')

    // Tentar inserir e ver os campos retornados
    const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .limit(1)

    if (error) {
        console.log('Error:', error.message)
    } else {
        if (data && data.length > 0) {
            console.log('Columns in transacoes:')
            console.log(Object.keys(data[0]))
            console.log('\nSample row:')
            console.log(data[0])
        } else {
            console.log('No data in table, trying to get column names from error...')
            // Tentar inserir dados inválidos para ver o erro
            const testResp = await supabase.from('transacoes').insert([{}]).select()
            console.log('Insert error:', testResp.error)
        }
    }
}

getTableStructure()
