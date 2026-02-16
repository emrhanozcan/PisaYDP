const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const apiKey = env['ILETIMERKEZI_API_KEY'];
const apiHash = env['ILETIMERKEZI_API_HASH'];
const sender = env['SMS_SENDER'] || 'Pisa Edu';

if (!apiKey || !apiHash) {
    console.error('Missing credentials');
    process.exit(1);
}

async function testFetch() {
    console.log('Testing fetch to api.iletimerkezi.com...');

    // Minimal body
    const body = {
        request: {
            authentication: { key: apiKey, hash: apiHash },
            order: {
                sender: sender,
                sendDateTime: [],
                iys: "1",
                iysList: "BIREYSEL",
                message: {
                    text: "Fetch Test",
                    receipents: { number: ["5321234567"] } // Dummy number
                }
            }
        }
    };

    try {
        const response = await fetch('https://api.iletimerkezi.com/v1/send-sms/json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
    } catch (error) {
        console.error('Fetch Failed:', error);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

testFetch();
