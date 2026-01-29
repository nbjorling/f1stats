
const https = require('https');

const API_BASE = 'https://api.openf1.org/v1';
const SESSION_KEY_BAD = 9693; // Australia 2025 (Empty in cache)
const SESSION_KEY_GOOD = 9987; // Italy 2025 (Has points)

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
    console.log('--- Probing BAD Session (Australia) ---');
    const badRes = await fetchUrl(`${API_BASE}/session_result?session_key=${SESSION_KEY_BAD}`);
    console.log(`Status: ${badRes.status}, Results count: ${Array.isArray(badRes.data) ? badRes.data.length : 'N/A'}`);
    if (Array.isArray(badRes.data) && badRes.data.length > 0) {
        console.log('Sample:', badRes.data[0]);
    } else {
        console.log('Response:', badRes.data);
    }

    console.log('\n--- Probing GOOD Session (Italy) ---');
    const goodRes = await fetchUrl(`${API_BASE}/session_result?session_key=${SESSION_KEY_GOOD}`);
    console.log(`Status: ${goodRes.status}, Results count: ${Array.isArray(goodRes.data) ? goodRes.data.length : 'N/A'}`);

    console.log('\n--- Checking Sessions List 2025 ---');
    const sessionsRes = await fetchUrl(`${API_BASE}/sessions?year=2025&session_type=Race`);
    if (Array.isArray(sessionsRes.data)) {
        console.log(`Found ${sessionsRes.data.length} Race sessions.`);
        const aus = sessionsRes.data.find(s => s.country_name === 'Australia');
        console.log('Australia Session Info:', aus);
    }
}

main();
