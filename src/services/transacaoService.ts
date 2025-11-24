import { supabase } from '@/lib/supabase';
const proxyBase = import.meta.env.VITE_PAYMENTS_PROXY || 'http://localhost:8787/api/abacatepay'

export interface Transacao {
    id_transacao?: number;
    id_usuario: number;
    produto_id: string;
    valor: number;
    qtd_tokens: number;
    metodo_pagamento?: string;
    created_at?: string;
    updated_at?: string;
}

export interface TransacaoResponse {
    success: boolean;
    data?: Transacao;
    error?: string;
}

export interface TransacaoListResponse {
    success: boolean;
    data?: Transacao[];
    error?: string;
}

export async function createTransacao(transacao: Omit<Transacao, 'id_transacao' | 'created_at' | 'updated_at'>): Promise<TransacaoResponse> {
  let resp: Response | null = null
  try {
    resp = await fetch(`${proxyBase}/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Client-Info': 'data-maps-quest/web' },
      body: JSON.stringify({
        userId: transacao.id_usuario,
        productId: transacao.produto_id,
        valor: transacao.valor,
        qtd_tokens: transacao.qtd_tokens,
        metodo_pagamento: transacao.metodo_pagamento || 'PIX'
      })
    })
  } catch (e) {
    resp = null
  }
  if (resp && resp.ok) {
    type RecordResponse = { data?: { recorded?: boolean } }
    const json: RecordResponse = await resp.json().catch(() => ({} as RecordResponse))
    const recorded = Boolean(json.data?.recorded)
    if (recorded) return { success: true, data: transacao }
    return { success: true, data: transacao }
  }

  try {
    const { data, error } = await supabase
      .from('transacoes')
      .insert([transacao])
      .select()
      .single()
    if (error) return { success: false, error: 'Erro ao registrar transação' }
    return { success: true, data: data as Transacao }
  } catch {
    return { success: false, error: 'Erro interno do servidor' }
  }
}

export async function getTransacoesByUserId(userId: number): Promise<TransacaoListResponse> {
  try {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('id_usuario', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações do usuário:', error);
      return { success: false, error: 'Erro ao buscar histórico' };
    }

    return { success: true, data: data as Transacao[] };
  } catch (error) {
    console.error('Erro inesperado ao buscar transações:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getTransacoesByEmailViaProxy(email: string, userId?: number): Promise<TransacaoListResponse> {
  try {
    const resp = await fetch(`${proxyBase}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Client-Info': 'data-maps-quest/web' },
      body: JSON.stringify({ email, userId })
    })
    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      return { success: false, error: text || 'Erro ao buscar histórico (proxy)' }
    }
    const json = await resp.json()
    const data = (json?.data || json) as Transacao[]
    return { success: true, data }
  } catch (e) {
    return { success: false, error: (e as Error)?.message || 'Erro de rede' }
  }
}
