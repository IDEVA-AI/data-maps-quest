
import path from 'path'
import fs from 'fs'

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) env[key.trim()] = value.trim()
})

const API_KEY = env['ABACATEPAY_API_KEY']
const API_BASE = 'https://api.abacatepay.com/v1'

if (!API_KEY) {
    console.error('Missing ABACATEPAY_API_KEY in .env')
    process.exit(1)
}

async function testCheckout() {
    console.log('Testing AbacatePay Checkout (PIX ONLY)...')
    console.log('API Key:', API_KEY.substring(0, 10) + '...')

    const payload = {
        frequency: "ONE_TIME",
        methods: ["PIX"], // Changed to PIX only
        returnUrl: "https://google.com",
        completionUrl: "https://google.com",
        products: [
            {
                externalId: "test_prod_1050",
                name: "1050 tokens",
                quantity: 1,
                price: 5990, // 59.90
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
        const response = await fetch(`${API_BASE}/billing/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
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
        console.error('Request failed:', error)
    }
}

testCheckout()
