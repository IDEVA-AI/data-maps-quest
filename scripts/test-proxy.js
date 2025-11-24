
// Test the local proxy instead of AbacatePay directly
async function testProxy() {
    console.log('Testing LOCAL proxy (localhost:8787)...')

    const payload = {
        frequency: "ONE_TIME",
        methods: ["PIX"],
        returnUrl: "https://google.com",
        completionUrl: "https://google.com",
        products: [
            {
                externalId: "test_prod_1050",
                name: "1050 tokens",
                quantity: 1,
                price: 5990,
                description: "Compra de 1050 tokens"
            }
        ],
        customer: {
            name: "IGOR GABRIEL DE OLIVEIRA FARIA",
            email: "igor.gabrielg@gmail.com",
            cellphone: "(11) 99999-9999",
            taxId: "008.263.381-94"
        }
    }

    try {
        console.log('Sending request to proxy...')
        const response = await fetch('http://localhost:8787/api/abacatepay/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Info': 'data-maps-quest/web'
            },
            body: JSON.stringify(payload)
        })

        const text = await response.text()
        console.log('Status:', response.status)

        try {
            const json = JSON.parse(text)
            console.log('Response JSON:', JSON.stringify(json, null, 2))
        } catch (e) {
            console.log('Response Text:', text)
        }

    } catch (error) {
        console.error('Request failed:', error.message)
    }
}

testProxy()
