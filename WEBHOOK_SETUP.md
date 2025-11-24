# Configuração do Webhook AbacatePay

## 1. Para Desenvolvimento Local

### Opção A: Usar ngrok (Recomendado)
1. Instale ngrok: `brew install ngrok` (Mac) ou baixe de https://ngrok.com
2. Execute: `ngrok http 8787`
3. Copie a URL HTTPS gerada (ex: `https://abc123.ngrok.io`)
4. Configure no painel do AbacatePay: `https://abc123.ngrok.io/api/abacatepay/webhook`

### Opção B: Simular Localmente
```bash
node scripts/test-webhook.js
```

## 2. Configuração no Painel AbacatePay

1. Acesse: https://www.abacatepay.com/app
2. Vá em **Configurações** → **Webhooks**
3. Clique em **Criar Webhook**
4. Preencha:
   - **URL**: Seu endpoint (produção: `https://seudominio.com/api/abacatepay/webhook` ou dev: URL do ngrok)
   - **Evento**: Selecione `billing.paid`
   - **Secret** (opcional): Para validação adicional
5. Salve

## 3. Testar

### Desenvolvimento (com ngrok):
```bash
# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2: Iniciar ngrok
ngrok http 8787

# Fazer uma compra de teste e verificar logs
```

### Simular webhook localmente:
```bash
# Edite scripts/test-webhook.js com dados reais
# Execute:
node scripts/test-webhook.js
```

## 4. Verificar Logs

Os logs do webhook aparecerão no terminal onde `npm run dev` está rodando:
```
[Webhook] Received: { event: 'billing.paid', ... }
[Webhook] Processing payment: { ... }
[Webhook] Payment processed! User X should receive Y tokens
```

## 5. Produção

Para produção, use sua URL real:
- Webhook URL: `https://seudominio.com/api/abacatepay/webhook`
- O servidor precisa estar rodando e acessível pela internet
