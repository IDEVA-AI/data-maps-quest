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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY || process.env.SERVICE_KEY
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: { persistSession: false, autoRefreshToken: false }
  }
)

console.log('[Proxy] Supabase URL:', supabaseUrl ? 'set' : 'missing')
console.log('[Proxy] Using service role:', Boolean(supabaseServiceKey))

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
      const productExternalId = product.externalId;

      const customerEmail = customer?.metadata?.email || customer?.email
      console.log('[Webhook] Processing payment:', {
        billingId,
        productId,
        customerEmail,
        amount
      })

      // Buscar usuário pelo email
      const { data: users, error: userError } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('email', customerEmail)
        .single()

      if (userError || !users) {
        console.error('[Webhook] User not found:', customerEmail)
        return send(res, 404, { error: 'User not found' })
      }

      const userId = users.id_usuario

      // Buscar produto no banco pelo external_id
      const { data: productData, error: productError } = await supabase
        .from('produto')
        .select('id, nome, preco, qtd_tokens, external_id')
        .eq('external_id', productExternalId)
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
          produto_id: productData.id,
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

      const apiResp = await fetch(`${API_BASE}/billing/list`, {
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
      const list = json?.data || json
      const bill = Array.isArray(list) ? list.find(b => b?.id === transactionId) : null
      if (!bill) {
        return send(res, 404, { data: null, error: 'Not Found' })
      }
      const status = bill?.status === 'PAID' ? 'paid' : bill?.status === 'FAILED' ? 'failed' : 'pending'
      const productExternalId = Array.isArray(bill?.products) && bill.products.length ? bill.products[0]?.externalId : undefined

      let recorded = false
      if (status === 'paid' && supabaseServiceKey) {
        try {
          const email = bill?.customer?.metadata?.email || bill?.customer?.email
          const { data: userRow } = await supabase
            .from('usuarios')
            .select('id_usuario')
            .eq('email', email)
            .single()

          if (userRow && productExternalId) {
            const { data: productRow } = await supabase
              .from('produto')
              .select('id, preco, qtd_tokens')
              .eq('external_id', productExternalId)
              .single()

            if (productRow) {
              const recentISO = new Date(Date.now() - 10 * 60 * 1000).toISOString()
              const { data: existing } = await supabase
                .from('transacoes')
                .select('id_transacao')
                .eq('id_usuario', userRow.id_usuario)
                .eq('produto_id', productRow.id)
                .eq('valor', productRow.preco)
                .eq('qtd_tokens', productRow.qtd_tokens)
                .gte('created_at', recentISO)
                .limit(1)

              if (!existing || existing.length === 0) {
                const { error: insertError } = await supabase
                  .from('transacoes')
                  .insert({
                    id_usuario: userRow.id_usuario,
                    produto_id: productRow.id,
                    valor: productRow.preco,
                    qtd_tokens: productRow.qtd_tokens,
                    metodo_pagamento: 'PIX'
                  })
                if (!insertError) recorded = true
              } else {
                recorded = true
              }
            }
          }
        } catch {}
      }

      return send(res, 200, { data: { status, transactionId: bill?.id, productId: bill?.metadata?.productId, productExternalId, recorded } })
    } catch (e) {
      return send(res, 500, { data: null, error: e?.message || 'Unexpected error' })
    }
  }

  if (u.pathname === '/api/abacatepay/products') {
    if (req.method !== 'GET' && req.method !== 'POST') return methodNotAllowed(res)
    try {
      const { data, error } = await supabase
        .from('produto')
        .select('id, nome, preco, qtd_tokens, external_id, validade_dias, eh_popular')
        .order('preco', { ascending: true })
      if (error) return send(res, 500, { data: null, error: error.message })
      return send(res, 200, { data })
    } catch (e) {
      return send(res, 500, { data: null, error: e?.message || 'Unexpected error' })
    }
  }

  if (u.pathname === '/api/abacatepay/users') {
    if (req.method !== 'GET' && req.method !== 'POST') return methodNotAllowed(res)
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id_usuario, nome, email')
        .order('id_usuario', { ascending: true })
        .limit(50)
      if (error) return send(res, 500, { data: null, error: `${error.message}${error.code ? ` (${error.code})` : ''}` })
      return send(res, 200, { data })
    } catch (e) {
      return send(res, 500, { data: null, error: e?.message || 'Unexpected error' })
    }
  }

  if (u.pathname === '/api/abacatepay/users/create') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    try {
      const body = await readBody(req)
      const email = String(body?.email || '').toLowerCase()
      const nome = String(body?.nome || 'Teste')
      const perfil = String(body?.perfil || 'cliente')
      if (!email) return send(res, 400, { data: null, error: 'Missing email' })
      const nowISO = new Date().toISOString()
      const ins = await supabase
        .from('usuarios')
        .insert({
          nome,
          email,
          senhahash: null,
          saldotokens: 0,
          createdat: nowISO,
          lastupdate: nowISO,
          active: true,
          perfil,
          telefone: ''
        })
      if (ins.error) return send(res, 500, { data: null, error: ins.error.message })

      const { data: got, error: selErr } = await supabase
        .from('usuarios')
        .select('id_usuario, nome, email, perfil')
        .eq('email', email)
        .single()
      if (selErr || !got) return send(res, 500, { data: null, error: `${selErr?.message || 'Not Found'}${selErr?.code ? ` (${selErr.code})` : ''}` })
      return send(res, 200, { data: got })
    } catch (e) {
      return send(res, 500, { data: null, error: e?.message || 'Unexpected error' })
    }
  }

  if (u.pathname === '/api/abacatepay/transactions') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    if (!supabaseServiceKey) return send(res, 500, { data: null, error: 'Missing service role key' })
    try {
      const body = await readBody(req)
      const email = String(body?.email || '')
      const userId = body?.userId
      if (!email && !userId) return send(res, 400, { data: null, error: 'Missing email or userId' })

      let uid = userId
      if (!uid && email) {
        const { data: userRow, error: userErr } = await supabase
          .from('usuarios')
          .select('id_usuario')
          .eq('email', email)
          .single()
        if (userErr || !userRow) return send(res, 404, { data: null, error: 'User not found' })
        uid = userRow.id_usuario
      }

      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('id_usuario', uid)
        .order('created_at', { ascending: false })
      if (error) return send(res, 500, { data: null, error: error.message })

      const ids = Array.from(new Set((data || [])
        .map(r => r.produto_id || r.id_produto)
        .filter(Boolean)))

      let productMap = {}
      if (ids.length > 0) {
        const { data: prods } = await supabase
          .from('produto')
          .select('id, preco, qtd_tokens')
          .in('id', ids)
        productMap = Object.fromEntries((prods || []).map(p => [p.id, p]))
      }

      const normalized = (data || []).map(r => {
        const pid = r.produto_id || r.id_produto
        const p = pid ? productMap[pid] : null
        return {
          id_transacao: r.id_transacao,
          id_usuario: r.id_usuario,
          produto_id: pid,
          valor: r.valor ?? p?.preco ?? r.valorpago ?? 0,
          qtd_tokens: r.qtd_tokens ?? p?.qtd_tokens ?? 0,
          metodo_pagamento: r.metodo_pagamento ?? r.statuspagamento ?? 'PIX',
          created_at: r.created_at ?? r.createdat ?? new Date().toISOString(),
          updated_at: r.updated_at ?? r.lastupdate ?? null
        }
      })

      return send(res, 200, { data: normalized })
    } catch (e) {
      return send(res, 500, { data: null, error: e?.message || 'Unexpected error' })
    }
  }

  if (u.pathname === '/api/abacatepay/record') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    if (!supabaseServiceKey) return send(res, 500, { data: null, error: 'Missing service role key' })
    try {
      const body = await readBody(req)
      const userId = Number(body?.userId)
      const productId = body?.productId
      const productExternalId = body?.productExternalId
      let valor = Number(body?.valor)
      let qtd_tokens = Number(body?.qtd_tokens)
      const metodo = String(body?.metodo_pagamento || 'PIX')
      if (!userId || (!productId && !productExternalId)) {
        return send(res, 400, { data: null, error: 'Missing required fields' })
      }
      if (!supabaseUrl) return send(res, 500, { data: null, error: 'Missing Supabase URL' })

      const { data: pRowById } = productId ? await supabase
        .from('produto')
        .select('id, preco, qtd_tokens, external_id')
        .eq('id', productId)
        .single() : { data: null }

      const { data: pRowByExternal } = (!pRowById && productExternalId) ? await supabase
        .from('produto')
        .select('id, preco, qtd_tokens, external_id')
        .eq('external_id', productExternalId)
        .single() : { data: null }

      const pRow = pRowById || pRowByExternal
      if (!pRow) return send(res, 404, { data: null, error: 'Product not found' })
      if (!Number.isFinite(valor)) valor = pRow.preco
      if (!Number.isFinite(qtd_tokens) || qtd_tokens <= 0) qtd_tokens = pRow.qtd_tokens

      // Map plan (legacy) by price or tokens
      let id_plano = null
      try {
        const { data: planByPrice } = await supabase
          .from('planos')
          .select('id_plano')
          .eq('valor', valor)
          .limit(1)
        id_plano = planByPrice && planByPrice.length ? planByPrice[0]?.id_plano : null
        if (!id_plano) {
          const { data: planByTokens } = await supabase
            .from('planos')
            .select('id_plano')
            .eq('quantidadetokens', qtd_tokens)
            .limit(1)
          id_plano = planByTokens && planByTokens.length ? planByTokens[0]?.id_plano : null
        }
      } catch {}
      if (!id_plano) {
        // Fallback: Starter plan id if available; otherwise 1
        const { data: starter } = await supabase
          .from('planos')
          .select('id_plano')
          .eq('nome', 'Plano Starter')
          .limit(1)
        id_plano = starter && starter.length ? starter[0]?.id_plano : 1
      }

      const nowISO = new Date().toISOString()

      const { error } = await supabase
        .from('transacoes')
        .insert({
          id_usuario: userId,
          produto_id: pRow.id,
          valor: valor,
          qtd_tokens,
          metodo_pagamento: metodo,
          // Legacy columns for compatibility with NOT NULL constraints
          id_plano: id_plano,
          valorpago: valor,
          statuspagamento: metodo,
          createdat: nowISO,
          lastupdate: nowISO,
          active: true
        })
      if (error) return send(res, 500, { data: null, error: error.message })
      return send(res, 200, { data: { recorded: true } })
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
