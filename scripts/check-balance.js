import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) env[k.trim()] = v.trim();
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function getUserBalance(email) {
    const { data: user, error: userErr } = await supabase
        .from('usuarios')
        .select('id_usuario, saldo_tokens')
        .eq('email', email)
        .single();
    if (userErr) {
        console.error('User error', userErr);
        return;
    }
    console.log('User', user);
}

getUserBalance('igor.gabrielg@gmail.com');
