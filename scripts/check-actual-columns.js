
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

async function checkColumns() {
    console.log('Checking actual columns in transacoes table...')

    // Buscar da view existente que funciona
    const { data, error } = await supabase
        .from('view_relatorio_transacoes')
        .select('*')
        .limit(1)

    if (error) {
        console.log('Error fetching from view:', error.message)
    } else {
        if (data && data.length > 0) {
            console.log('Columns available in view_relatorio_transacoes:')
            console.log(Object.keys(data[0]))
            console.log('\nSample data:')
            console.log(data[0])
        } else {
            console.log('No data in view')
        }
    }
}

checkColumns()
