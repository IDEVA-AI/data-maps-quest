// Simular o webhook do AbacatePay billing.paid
async function simulateWebhook() {
    const webhookPayload = {
        id: 'log_test_123',
        event: 'billing.paid',
        devMode: true,
        data: {
            payment: {
                amount: 5990,
                fee: 80,
                method: 'PIX'
            },
            billing: {
                id: 'bill_test_456',
                products: [
                    {
                        externalId: '2541e564-ed5d-4046-b8d4-1b3d63183e77', // ID do produto no banco
                        name: '345 tokens',
                        quantity: 1,
                        price: 3450
                    }
                ],
                customer: {
                    id: 'cust_test',
                    metadata: {
                        name: 'IGOR GABRIEL',
                        email: 'igor.gabrielg@gmail.com'
                    }
                }
            }
        }
    }

    console.log('Sending webhook to localhost:8787/api/abacatepay/webhook')
    console.log('Payload:', JSON.stringify(webhookPayload, null, 2))

    try {
        const response = await fetch('http://localhost:8787/api/abacatepay/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
        })

        const result = await response.json()
        console.log('Response status:', response.status)
        console.log('Response body:', result)
    } catch (error) {
        console.error('Error:', error.message)
    }
}

simulateWebhook()
