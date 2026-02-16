const https = require('https');
const fs = require('fs');
const path = require('path');

// Hardcoded from user's .env for the script
const rawKey = '57f95ccfaae207c4256dfe0f0341fci2';
const apiHash = '2508f755834ac129aa232e2823e6e724a9e6184318adf58abecaf7d3e4d6962f6';
const sender = 'Pisa Edu';

const typoIndex = rawKey.indexOf('i');

if (typoIndex === -1) {
    console.log('No "i" found in key, cannot autofix based on "i" typo assumption.');
    process.exit(0);
}

const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

console.log(`Found typo 'i' at index ${typoIndex}. Trying 16 variations...`);

async function checkKey(candidateKey) {
    return new Promise((resolve) => {
        const body = JSON.stringify({
            request: {
                authentication: {
                    key: candidateKey,
                    hash: apiHash
                },
                order: {
                    sender: sender,
                    sendDateTime: [],
                    iys: "1",
                    iysList: "BIREYSEL",
                    message: {
                        text: "Test",
                        receipents: { number: ["5423297878"] }
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

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        if (json.response?.status?.code === '200') {
                            resolve({ success: true, key: candidateKey, response: json });
                        } else {
                            resolve({ success: false, status: json.response?.status?.code });
                        }
                    } catch (e) { resolve({ success: false }); }
                } else {
                    resolve({ success: false, status: res.statusCode });
                }
            });
        });

        req.on('error', () => resolve({ success: false }));
        req.write(body);
        req.end();
    });
}

async function run() {
    for (const char of hexChars) {
        const candidate = rawKey.substring(0, typoIndex) + char + rawKey.substring(typoIndex + 1);
        process.stdout.write(`Trying ${candidate}... `);
        const result = await checkKey(candidate);

        if (result.success) {
            console.log('\n✅ SUCCESS! Found correct key:', candidate);
            console.log('RESPONSE:', JSON.stringify(result.response));

            // Write to a temporary file so I can read it back easily if needed, or just output
            fs.writeFileSync(path.join(__dirname, 'found_key.txt'), candidate);
            process.exit(0);
        } else {
            console.log(`❌ Failed (${result.status})`);
        }

        // Small delay to avoid rate limiting spam
        await new Promise(r => setTimeout(r, 200));
    }
    console.log('\n❌ All variations failed. The issue might be IP restriction or multiple typos.');
}

run();
