
const https = require('https');

const API_BASE = 'https://api.openf1.org/v1';
const SESSION_KEY = 9693; // Australia 2025 (or 2024 equivalent was 9488) -> Let's use known 2024 session: 9472 (Bahrain)

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
    const sessionKey = 9472; // Bahrain 2024

    const endpoints = [
        `position?session_key=${sessionKey}&driver_number=1`, // Known
        `session_results?session_key=${sessionKey}`,          // User suggestion?
        `results?session_key=${sessionKey}`,                  // Common convention
        `sessions/${sessionKey}/results`,                     // RESTful
        `classification?session_key=${sessionKey}`,           // F1 term
    ];

    for (const ep of endpoints) {
        console.log(`Checking /${ep}...`);
        const res = await fetchUrl(`${API_BASE}/${ep}`);
        if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
            console.log(`[SUCCESS] Found data at /${ep}: ${res.data.length} items.`);
            console.log('Sample item:', res.data[0]);
        } else {
            console.log(`[FAILED] Status: ${res.status}, Data: ${Array.isArray(res.data) ? res.data.length + ' items' : 'Not array'}`);
        }
    }
}

main();
