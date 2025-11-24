
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

async function checkView() {
    console.log('Checking if view_relatorio_transacoes exists...')
    const { data, error } = await supabase.from('view_relatorio_transacoes').select('*').limit(1)

    if (error) {
        console.log('View does not exist or error:', error.message)
    } else {
        console.log('View exists! Sample data:', data)
    }
}

checkView()
