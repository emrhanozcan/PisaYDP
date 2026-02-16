
interface SMSResult {
    success: boolean;
    orderId?: string;
    error?: string;
}

export async function sendSMS(phones: string[], message: string): Promise<SMSResult> {
    const apiKey = process.env.ILETIMERKEZI_API_KEY;
    const apiHash = process.env.ILETIMERKEZI_API_HASH;
    const sender = process.env.SMS_SENDER || 'Pisa Edu';

    if (!apiKey || !apiHash) {
        console.error('SMS Configuration missing');
        return { success: false, error: 'Configuration missing' };
    }

    // Sanitize phones: Remove all non-digits
    // If starts with 90, remove it? If starts with 0, remove it?
    // Docs say: 5321234567
    const cleanPhones = phones.map(p => {
        let clean = p.replace(/\D/g, '');
        if (clean.length === 12 && clean.startsWith('90')) clean = clean.substring(2);
        if (clean.length === 11 && clean.startsWith('0')) clean = clean.substring(1);
        return clean;
    }).filter(p => p.length === 10);

    if (cleanPhones.length === 0) {
        return { success: false, error: 'No valid phone numbers' };
    }

    const body = {
        request: {
            authentication: {
                key: apiKey,
                hash: apiHash
            },
            order: {
                sender: sender,
                sendDateTime: [],
                iys: "1", // According to doc advice for commercial/notifications
                iysList: "BIREYSEL",
                message: {
                    text: message,
                    receipents: {
                        number: cleanPhones
                    }
                }
            }
        }
    };

    return new Promise<SMSResult>((resolve) => {
        const https = require('https');
        const options = {
            hostname: 'api.iletimerkezi.com',
            port: 443,
            path: '/v1/send-sms/json',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(body))
            }
        };

        const req = https.request(options, (res: any) => {
            let data = '';
            res.on('data', (chunk: any) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.response && result.response.status && result.response.status.code == 200) {
                        resolve({ success: true, orderId: result.response.order?.id });
                    } else {
                        console.error('SMS API Error:', result);
                        resolve({ success: false, error: result.response?.status?.message || 'Unknown error' });
                    }
                } catch (e) {
                    resolve({ success: false, error: 'Invalid JSON response' });
                }
            });
        });

        req.on('error', (e: any) => {
            console.error('SMS Send Error:', e);
            resolve({ success: false, error: 'Network error' });
        });

        req.write(JSON.stringify(body));
        req.end();
    });
}
