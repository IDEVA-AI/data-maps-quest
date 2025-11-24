import { supabase } from '@/lib/supabase'

export interface CreditRequest {
  userId: number
  tokens: number
  source: string
  transactionId?: string
}

export interface BalanceResponse {
  tokens: number
}

class TokenService {
  async debitViaSupabase(req: CreditRequest): Promise<{ success: boolean; data?: BalanceResponse; error?: string }> {
    try {
      const { data: userData, error: fetchError } = await supabase
        .from('usuarios')
        .select('saldo_tokens')
        .eq('id_usuario', req.userId)
        .single()
      if (fetchError) {
        return { success: false, error: 'Erro ao buscar saldo do usuário' }
      }
      const currentBalance = userData?.saldo_tokens || 0
      const cost = Math.abs(req.tokens || 0)
      if (currentBalance < cost) {
        return { success: false, error: 'Saldo insuficiente' }
      }
      const newBalance = currentBalance - cost
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ saldo_tokens: newBalance })
        .eq('id_usuario', req.userId)
      if (updateError) {
        return { success: false, error: 'Erro ao atualizar saldo' }
      }
      return { success: true, data: { tokens: newBalance } }
    } catch (e) {
      return { success: false, error: 'Erro inesperado ao debitar tokens' }
    }
  }
  // Creditar tokens via Supabase (para ser chamado pelo webhook ou callback)
  async creditViaSupabase(req: CreditRequest): Promise<{ success: boolean; data?: BalanceResponse; error?: string }> {
    try {
      // Buscar saldo atual do usuário
      const { data: userData, error: fetchError } = await supabase
        .from('usuarios')
        .select('saldo_tokens')
        .eq('id_usuario', req.userId)
        .single()

      if (fetchError) {
        console.error('Error fetching user balance:', fetchError)
        return { success: false, error: 'Erro ao buscar saldo do usuário' }
      }

      const currentBalance = userData?.saldo_tokens || 0
      const newBalance = currentBalance + req.tokens

      // Atualizar saldo
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ saldo_tokens: newBalance })
        .eq('id_usuario', req.userId)

      if (updateError) {
        console.error('Error updating balance:', updateError)
        return { success: false, error: 'Erro ao atualizar saldo' }
      }

      return { success: true, data: { tokens: newBalance } }
    } catch (e) {
      console.error('Unexpected error crediting tokens:', e)
      return { success: false, error: 'Erro inesperado ao creditar tokens' }
    }
  }

  // Método antigo usando localStorage (para compatibilidade)
  private key(userId: number) {
    return `user_tokens:${userId}`
  }

  async credit(req: CreditRequest): Promise<{ success: boolean; data?: BalanceResponse; error?: string }> {
    // Tentar via Supabase primeiro
    const supabaseResult = await this.creditViaSupabase(req)
    if (supabaseResult.success) {
      // Sincronizar com localStorage também
      const k = this.key(req.userId)
      if (supabaseResult.data) {
        localStorage.setItem(k, String(supabaseResult.data.tokens))
      }
      return supabaseResult
    }

    // Fallback para localStorage (caso Supabase falhe)
    try {
      const k = this.key(req.userId)
      const current = parseInt(localStorage.getItem(k) || '0', 10)
      const next = current + (req.tokens || 0)
      localStorage.setItem(k, String(next))
      return { success: true, data: { tokens: next } }
    } catch (e) {
      return { success: false, error: 'Falha ao atualizar tokens' }
    }
  }

  async debit(req: CreditRequest): Promise<{ success: boolean; data?: BalanceResponse; error?: string }> {
    const supabaseResult = await this.debitViaSupabase(req)
    if (supabaseResult.success) {
      const k = this.key(req.userId)
      if (supabaseResult.data) {
        localStorage.setItem(k, String(supabaseResult.data.tokens))
      }
      return supabaseResult
    }
    try {
      const k = this.key(req.userId)
      const current = parseInt(localStorage.getItem(k) || '0', 10)
      const cost = Math.abs(req.tokens || 0)
      if (current < cost) return { success: false, error: 'Saldo insuficiente' }
      const next = current - cost
      localStorage.setItem(k, String(next))
      return { success: true, data: { tokens: next } }
    } catch (e) {
      return { success: false, error: 'Falha ao atualizar tokens' }
    }
  }

  async getBalance(userId: number): Promise<{ success: boolean; data?: BalanceResponse; error?: string }> {
    try {
      // Buscar do Supabase
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('saldo_tokens')
        .eq('id_usuario', userId)
        .single()

      if (error) {
        console.error('Error fetching balance:', error)
        // Fallback para localStorage
        const k = this.key(userId)
        const current = parseInt(localStorage.getItem(k) || '0', 10)
        return { success: true, data: { tokens: current } }
      }

      const tokens = userData?.saldo_tokens || 0

      // Sincronizar com localStorage
      const k = this.key(userId)
      localStorage.setItem(k, String(tokens))

      return { success: true, data: { tokens } }
    } catch (e) {
      console.error('Error getting balance:', e)
      return { success: false, error: 'Falha ao recuperar tokens' }
    }
  }
}

export const tokenService = new TokenService()
