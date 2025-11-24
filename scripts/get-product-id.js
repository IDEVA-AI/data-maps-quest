
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

async function getProductId() {
    const { data, error } = await supabase
        .from('produto')
        .select('id, nome, qtd_tokens')
        .limit(1)
        .single()

    if (error) {
        console.error('Error:', error)
        return null
    }

    console.log('Product found:', data)
    return data.id
}

getProductId().then(id => {
    if (id) {
        console.log('\nProduct ID to use:', id)
    }
})
