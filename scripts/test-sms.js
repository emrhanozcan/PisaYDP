const https = require('https');
const fs = require('fs');
const path = require('path');

// Manually parse .env since we might not have dotenv installed
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

console.log('--- SMS Configuration Test ---');
console.log('API Key:', apiKey ? apiKey.substring(0, 5) + '...' : 'MISSING');
console.log('API Hash:', apiHash ? apiHash.substring(0, 5) + '...' : 'MISSING');
console.log('Sender:', sender);

if (!apiKey || !apiHash) {
    console.error('ERROR: Missing credentials in .env');
    process.exit(1);
}

const body = JSON.stringify({
    request: {
        authentication: {
            key: apiKey,
            hash: apiHash
        },
        order: {
            sender: sender,
            sendDateTime: [],
            iys: "1",
            iysList: "BIREYSEL",
            message: {
                text: "PisaYDP SMS Test Mesaji",
                receipents: {
                    number: ["5423297878"]
                }
            }
        }
    }
});

const options = {
    hostname: 'api.iletimerkezi.com',
    port: 443,
    path: '/v1/send-sms/json',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
    }
};

console.log('Sending Request Body:', JSON.stringify(JSON.parse(body), null, 2));

const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', data);
        fs.writeFileSync('sms-response.json', data);
        try {
            const json = JSON.parse(data);
            if (json.response && json.response.status && json.response.status.code === '200') {
                console.log('SUCCESS: SMS sent successfully.');
            } else {
                console.log('FAILURE: API returned error.');
            }
        } catch (e) {
            console.log('Could not parse JSON response');
        }
    });
});

req.on('error', (error) => {
    console.error('Network Error:', error);
});

req.write(body);
req.end();
