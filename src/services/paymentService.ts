export interface ApiResponse<T> { success: boolean; data?: T; error?: string }
import { supabase } from '@/lib/supabase'
const proxyBase = import.meta.env.VITE_PAYMENTS_PROXY || 'http://localhost:8787/api/abacatepay'

export interface CheckoutRequest {
  frequency: 'ONE_TIME'
  methods: ('PIX' | 'CARD')[]
  products: {
    externalId: string
    name: string
    quantity: number
    price: number // em centavos
    description?: string
  }[]
  returnUrl: string
  completionUrl: string
  customer: {
    name: string
    email: string
    cellphone: string
    taxId: string // CPF
  }
}

export interface CheckoutResponse {
  checkoutUrl: string
  transactionId?: string
}

export interface PaymentStatus {
  status: 'pending' | 'paid' | 'failed'
  transactionId: string
  productId?: string
  productExternalId?: string
  recorded?: boolean
}

class PaymentService {
  async createCheckout(req: CheckoutRequest): Promise<ApiResponse<CheckoutResponse>> {
    try {
      const url = `${proxyBase}/checkout`
      console.log({ level: 'info', action: 'edge_checkout_fetch_start', url, payload: req })
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Info': 'data-maps-quest/web',
        },
        body: JSON.stringify(req)
      })
      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        console.log({ level: 'error', action: 'edge_checkout_http_error', status: resp.status, statusText: resp.statusText, body: text })
        return { success: false, error: text || 'Falha HTTP ao criar checkout' }
      }
      const json = await resp.json()
      const data = json?.data || json
      console.log({ level: 'info', action: 'edge_checkout_ok', data })
      return { success: true, data }
    } catch (e) {
      const msg = (e as Error)?.message || 'Unknown network error'
      console.log({ level: 'error', action: 'edge_checkout_exception', url, error: msg })
      return { success: false, error: msg }
    }
  }

  async getStatus(transactionId: string): Promise<ApiResponse<PaymentStatus>> {
    try {
      const url = `${proxyBase}/status`
      console.log({ level: 'info', action: 'edge_status_fetch_start', url, transactionId })
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Info': 'data-maps-quest/web',
        },
        body: JSON.stringify({ action: 'status', transactionId })
      })
      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        console.log({ level: 'error', action: 'edge_status_http_error', status: resp.status, statusText: resp.statusText, body: text })
        return { success: false, error: text || 'Falha HTTP ao consultar status' }
      }
      const json = await resp.json()
      const data = json?.data || json
      console.log({ level: 'info', action: 'edge_status_ok', data })
      return { success: true, data }
    } catch (e) {
      const msg = (e as Error)?.message || 'Unknown network error'
      console.log({ level: 'error', action: 'edge_status_exception', url, error: msg })
      return { success: false, error: msg }
    }
  }
}

export const paymentService = new PaymentService()
