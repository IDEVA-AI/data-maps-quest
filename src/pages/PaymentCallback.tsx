import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { paymentService } from '@/services/paymentService'
import { productService } from '@/services/productService'
import { createTransacao } from '@/services/transacaoService'
import { tokenService } from '@/services/tokenService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const PaymentCallback = () => {
  const [statusText, setStatusText] = useState('Processando pagamento...')
  const [error, setError] = useState<string | null>(null)
  const [credited, setCredited] = useState<number | null>(null)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const processedRef = useRef(false)

  useEffect(() => {
    const run = async () => {
      if (processedRef.current) return

      let transactionId = params.get('transaction_id') || params.get('id') || params.get('billing_id') || params.get('bill_id') || ''
      let productId = params.get('product_id') || ''
      console.log('[PaymentCallback] Params:', Array.from(params.entries()))
      if (!transactionId) {
        const last = localStorage.getItem('last_billing_id')
        if (last) transactionId = last
      }
      if (!productId) {
        const last = localStorage.getItem('last_billing_product_id')
        if (last) productId = last
      }

      console.log('[PaymentCallback] Starting...', { transactionId, productId, user })

      if (!transactionId) {
        console.error('[PaymentCallback] Missing transaction id', { transactionId, productId })
        setError('Dados inválidos')
        return
      }

      if (!user) {
        console.log('[PaymentCallback] No user yet, waiting...')
        setStatusText('Aguardando sessão do usuário...')
        return
      }

      // Usar localStorage para idempotência (já que não temos transaction_id no banco)
      const txKey = `paid_tx:${transactionId}`
      if (localStorage.getItem(txKey) === '1') {
        setError(null)
        setStatusText('Pagamento já processado')
        const bal = await tokenService.getBalance(user.id_usuario)
        if (bal.success && bal.data) setCredited(bal.data.tokens)
        setTimeout(() => navigate('/tokens'), 1500)
        processedRef.current = true
        return
      }

      // Verificar status do pagamento no AbacatePay
      console.log('[PaymentCallback] Checking payment status...')
      setStatusText('Verificando status do pagamento...')
      const statusResp = await paymentService.getStatus(transactionId)
      console.log('[PaymentCallback] Status response:', statusResp)

      if (!statusResp.success || !statusResp.data) {
        console.error('[PaymentCallback] Status check failed:', statusResp.error)
        setError(statusResp.error || 'Falha ao verificar pagamento')
        return
      }

      if (statusResp.data.status !== 'paid') {
        console.error('[PaymentCallback] Payment not paid:', statusResp.data.status)
        setError('Pagamento não confirmado. Status: ' + statusResp.data.status)
        return
      }

      console.log('[PaymentCallback] Payment confirmed, fetching product...')

      // Buscar produto do banco
      setStatusText('Buscando informações do produto...')
      const productsResp = await productService.getProducts()
      if (!productsResp.success || !productsResp.data) {
        setError('Erro ao buscar produto')
        return
      }

      // Tentar por id; se não houver, tentar por external_id vindo do status
      const productExternalId = (statusResp.data as any)?.productExternalId
      let product = productsResp.data.find(p => p.id === productId)
      if (!product && productExternalId) {
        product = productsResp.data.find(p => p.external_id === productExternalId)
        if (product) productId = product.id
      }
      if (!product) {
        setError('Produto não encontrado')
        return
      }

      // Registrar transação caso ainda não tenha sido gravada pelo proxy
      if (!(statusResp.data as any)?.recorded) {
        setStatusText('Registrando transação...')
        const txResp = await createTransacao({
          id_usuario: user.id_usuario,
          produto_id: productId,
          valor: product.preco,
          qtd_tokens: product.qtd_tokens,
          metodo_pagamento: 'PIX'
        })
        if (!txResp.success) {
          console.error('Erro ao registrar transação:', txResp.error)
          // Continuar mesmo se falhar o registro (para não bloquear o crédito)
        }
      }

      // Creditar tokens
      setStatusText('Creditando tokens...')
      const creditResp = await tokenService.credit({
        userId: user.id_usuario,
        tokens: product.qtd_tokens,
        source: 'abacatepay',
        transactionId
      })

      if (!creditResp.success || !creditResp.data) {
        setError(creditResp.error || 'Falha ao creditar tokens')
        return
      }

      // Marcar como processado
      localStorage.setItem(txKey, '1')
      try {
        localStorage.removeItem('last_billing_id')
        localStorage.removeItem('last_billing_product_id')
      } catch {}
      setError(null)
      setCredited(creditResp.data.tokens)
      setStatusText(`Pagamento confirmado! ${product.qtd_tokens} tokens creditados.`)
      processedRef.current = true
      setTimeout(() => navigate('/tokens'), 2500)
    }

    run()
  }, [params, navigate, user])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Retorno de Pagamento</CardTitle>
          <CardDescription>AbacatePay</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{statusText}</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          {credited !== null && <p className="text-sm text-green-600 mt-2 font-semibold">Saldo atualizado: {credited} tokens</p>}
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentCallback
