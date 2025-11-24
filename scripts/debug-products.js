
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

async function debugProducts() {
    console.log('--- Debugging Products Table ---')
    console.log('URL:', supabaseUrl)

    // 1. Try to select all products
    console.log('\n1. Fetching all products...')
    const { data, error } = await supabase
        .from('produtos')
        .select('*')

    if (error) {
        console.error('❌ Error fetching products:')
        console.error('Code:', error.code)
        console.error('Message:', error.message)
        console.error('Hint:', error.hint)

        if (error.code === '42P01') { // undefined_table
            console.log('\n⚠️  DIAGNOSIS: The table "produtos" does not exist.')
            console.log('👉 ACTION REQUIRED: You must run the SQL script in Supabase SQL Editor.')
        } else if (error.code === '42501') { // insufficient_privilege
            console.log('\n⚠️  DIAGNOSIS: RLS Policy error. The table exists but you cannot read it.')
            console.log('👉 ACTION REQUIRED: Check RLS policies.')
        }
    } else {
        console.log('✅ Success! Found', data.length, 'products.')
        if (data.length === 0) {
            console.log('⚠️  Warning: Table is empty.')
        } else {
            console.log('Sample product:', data[0].nome)
        }
    }
}

debugProducts()
