import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function loadEnv(envFilePath) {
  try {
    const content = fs.readFileSync(envFilePath, 'utf8')
    const env = {}
    for (const raw of content.split('\n')) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const idx = line.indexOf('=')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      env[key] = value
    }
    return env
  } catch (e) {
    return {}
  }
}

const envPath = path.resolve(process.cwd(), '.env')
const env = loadEnv(envPath)

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis do Supabase ausentes em .env (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  const { data, error } = await supabase
    .from('cupom')
    .select('id, cupom, active, createat, lastupdate')
    .order('createat', { ascending: false })

  if (error) {
    console.error('Erro ao consultar cupons:', error.message)
    process.exit(1)
  }

  console.log(JSON.stringify(data ?? [], null, 2))
}

main()