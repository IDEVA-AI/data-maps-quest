import http from 'node:http'
import { URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value && !process.env[key]) {
      process.env[key] = value.trim()
    }
  })
}

const PORT = process.env.ABACATEPAY_PORT ? Number(process.env.ABACATEPAY_PORT) : 8787
const ORIGIN = process.env.APP_ORIGIN || 'http://localhost:8080'
const API_KEY = process.env.ABACATEPAY_API_KEY
const API_BASE = process.env.ABACATEPAY_API_BASE || process.env.VITE_ABACATEPAY_BASE || 'https://api.abacatepay.com/v1'

// Supabase client – usa a Service‑role quando disponível
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: { persistSession: false, autoRefreshToken: false }
  }
)

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Client-Info',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  }
}

function send(res, status, data) {
  const headers = corsHeaders()
  res.writeHead(status, headers)
  res.end(JSON.stringify(data))
}

function notFound(res) {
  send(res, 404, { data: null, error: 'Not Found' })
}

function methodNotAllowed(res) {
  send(res, 405, { data: null, error: 'Method not allowed' })
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}) } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders())
    res.end()
    return
  }

  // Webhook endpoint
  if (u.pathname === '/api/abacatepay/webhook') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    try {
      const body = await readBody(req)
      console.log('[Proxy] Checkout request body:', JSON.stringify(body))
      console.log('[Webhook] Received:', JSON.stringify(body, null, 2))

      // Verify webhook signature (if secret is set)
      const signatureHeader = req.headers['abacatepay-signature'];
      const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;
      if (secret && signatureHeader) {
        const crypto = await import('crypto');
        const expected = crypto
          .createHmac('sha256', secret)
          .update(JSON.stringify(body))
          .digest('hex');
        if (signatureHeader !== expected) {
          console.warn('[Webhook] Invalid signature');
          return send(res, 401, { error: 'Invalid webhook signature' });
        }
      }

      // Process only billing.paid events
      if (body.event !== 'billing.paid') {
        console.log('[Webhook] Ignoring event:', body.event);
        return send(res, 200, { received: true });
      }

      // Extrair dados do pagamento
      const billingId = body.data?.billing?.id;
      const products = body.data?.billing?.products || [];
      const customer = body.data?.billing?.customer;
      const amount = body.data?.payment?.amount / 100; // centavos → reais

      if (!products.length || !customer) {
        console.error('[Webhook] Missing products or customer data');
        return send(res, 400, { error: 'Invalid webhook data' });
      }

      const product = products[0]; // Assumindo 1 produto por transação
      const productId = product.externalId;

      console.log('[Webhook] Processing payment:', {
        billingId,
        productId,
        customerEmail: customer.metadata?.email,
        amount
      })

      // Buscar usuário pelo email
      const { data: users, error: userError } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('email', customer.metadata?.email)
        .single()

      if (userError || !users) {
        console.error('[Webhook] User not found:', customer.metadata?.email)
        return send(res, 404, { error: 'User not found' })
      }

      const userId = users.id_usuario

      // Buscar produto no banco
      const { data: productData, error: productError } = await supabase
        .from('produto')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError || !productData) {
        console.error('[Webhook] Product not found:', productId)
        return send(res, 404, { error: 'Product not found' })
      }

      console.log('[Webhook] Found product:', productData.nome, 'for user:', userId)

      // Criar transação no banco
      const { data: transaction, error: txError } = await supabase
        .from('transacoes')
        .insert({
          id_usuario: userId,
          produto_id: productId,
          valor: amount,
          qtd_tokens: productData.qtd_tokens,
          metodo_pagamento: body.data?.payment?.method || 'PIX'
        })
        .select()
        .single()

      if (txError) {
        console.error('[Webhook] Error creating transaction:', txError)
        // Continuar mesmo com erro (podemos ter duplicatas)
      } else {
        console.log('[Webhook] Transaction created:', transaction.id_transacao)
      }

      // Creditar tokens ao usuário
      const { data: userData, error: userBalanceError } = await supabase
        .from('usuarios')
        .select('saldo_tokens')
        .eq('id_usuario', userId)
        .single()

      if (userBalanceError) {
        console.error('[Webhook] Error fetching user balance:', userBalanceError)
      } else {
        const newBalance = (userData?.saldo_tokens || 0) + productData.qtd_tokens
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ saldo_tokens: newBalance })
          .eq('id_usuario', userId)
        if (updateError) {
          console.error('[Webhook] Error updating user balance:', updateError)
        } else {
          console.log('[Webhook] User balance updated to', newBalance)
        }
      }

      // Log final
      console.log(`[Webhook] Payment processed! User ${userId} credited ${productData.qtd_tokens} tokens`)

      return send(res, 200, {
        received: true,
        processed: true,
        userId,
        tokens: productData.qtd_tokens,
        newBalance: (userData?.saldo_tokens || 0) + productData.qtd_tokens
      })
    } catch (e) {
      console.error('[Webhook] Error:', e)
      return send(res, 500, { data: null, error: e?.message || 'Unexpected error' })
    }
  }

  if (u.pathname === '/api/abacatepay/checkout') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    if (!API_KEY) return send(res, 500, { data: null, error: 'Missing ABACATEPAY_API_KEY' })
    try {
      const body = await readBody(req)

      // Basic validation
      if (!body.products || !body.customer || !body.methods) {
        return send(res, 400, { data: null, error: 'Invalid checkout payload: missing products, customer or methods' })
      }

      const payload = {
        frequency: body.frequency || 'ONE_TIME',
        methods: body.methods,
        products: body.products,
        returnUrl: body.returnUrl,
        completionUrl: body.completionUrl,
        customer: body.customer
      }

      console.log('[DEBUG] API_BASE:', API_BASE)
      console.log('[DEBUG] Full URL:', `${API_BASE}/billing/create`)

      const apiResp = await fetch(`${API_BASE}/billing/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(payload)
      })

      let text = ''
      let json = null
      try { text = await apiResp.text(); json = JSON.parse(text) } catch { }
      if (!apiResp.ok || (json && json.error)) {
        const err = json?.error || text || `Checkout failed (${apiResp.status})`
        console.error('[Proxy] AbacatePay API Error:', err)
        return send(res, apiResp.status, { data: null, error: err })
      }

      const data = json?.data || json
      return send(res, 200, { data: { checkoutUrl: data?.url, transactionId: data?.id } })
    } catch (e) {
      return send(res, 500, { data: null, error: e?.message || 'Unexpected error' })
    }
  }

  if (u.pathname === '/api/abacatepay/status') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    if (!API_KEY) return send(res, 500, { data: null, error: 'Missing ABACATEPAY_API_KEY' })
    try {
      const body = await readBody(req)
      const transactionId = String(body?.transactionId || '')
      if (!transactionId) return send(res, 400, { data: null, error: 'Missing transactionId' })

      const apiResp = await fetch(`${API_BASE}/billing/get?id=${encodeURIComponent(transactionId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      })

      let text = ''
      let json = null
      try { text = await apiResp.text(); json = JSON.parse(text) } catch { }
      if (!apiResp.ok || (json && json.error)) {
        const err = json?.error || text || `Status failed (${apiResp.status})`
        return send(res, apiResp.status, { data: null, error: err })
      }
      const data = json?.data || json
      const status = data?.status === 'PAID' ? 'paid' : data?.status === 'FAILED' ? 'failed' : 'pending'
      const productExternalId = Array.isArray(data?.products) && data.products.length ? data.products[0]?.externalId : undefined
      return send(res, 200, { data: { status, transactionId: data?.id, productId: data?.metadata?.productId, productExternalId } })
    } catch (e) {
      return send(res, 500, { data: null, error: e?.message || 'Unexpected error' })
    }
  }

  return notFound(res)
})

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`AbacatePay proxy listening on http://localhost:${PORT}`)
  console.log(`Webhook endpoint: http://localhost:${PORT}/api/abacatepay/webhook`)
})
