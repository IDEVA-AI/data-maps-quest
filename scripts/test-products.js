
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Simple .env parser
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
        env[key.trim()] = value.trim()
    }
})

const supabaseUrl = env['VITE_SUPABASE_URL']
const supabaseKey = env['VITE_SUPABASE_ANON_KEY']

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProducts() {
    console.log('Testing connection to Supabase...')
    const { data, error } = await supabase
        .from('produtos')
        .select('*')

    if (error) {
        console.error('Error fetching products:', error)
        console.error('Details:', JSON.stringify(error, null, 2))
    } else {
        console.log('Successfully fetched products:', data)
    }
}

testProducts()
