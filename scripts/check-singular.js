
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

async function checkSingular() {
    console.log('Checking table "produto" (singular)...')
    const { data, error } = await supabase.from('produto').select('*').limit(1)
    if (error) {
        console.log('Error accessing "produto":', error.message)
    } else {
        console.log('Success accessing "produto"! Data:', data)
    }
}

checkSingular()
