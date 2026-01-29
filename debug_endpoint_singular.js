
const https = require('https');

const API_BASE = 'https://api.openf1.org/v1';
const SESSION_KEY = 9472; // Bahrain 2024

function fetchUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, error: 'JSON parse error' });
                }
            });
        }).on('error', (e) => resolve({ error: e.message }));
    });
}

async function main() {
    console.log(`Checking /session_result?session_key=${SESSION_KEY}...`);
    const res = await fetchUrl(`${API_BASE}/session_result?session_key=${SESSION_KEY}`);

    if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
        console.log(`[SUCCESS] Found data: ${res.data.length} items.`);
        console.log('Sample item:', res.data[0]);
    } else {
        console.log(`[FAILED] Status: ${res.status}, Data: ${JSON.stringify(res.data).slice(0, 100)}...`);
    }
}

main();
