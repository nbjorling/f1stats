
const https = require('https');

const API_BASE = 'https://api.openf1.org/v1';
const SESSION_KEY_2025 = 9693; // Austria 2025 (from cache inspection)

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
    console.log(`Checking /drivers?session_key=${SESSION_KEY_2025}...`);
    const res = await fetchUrl(`${API_BASE}/drivers?session_key=${SESSION_KEY_2025}`);

    if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
        console.log(`[SUCCESS] Found ${res.data.length} drivers.`);
        const sample = res.data.find(d => d.driver_number === 4); // Lando
        console.log('Lando Norris (4) data:', sample);
        const nullCountries = res.data.filter(d => !d.country_code).length;
        console.log(`Drivers with null country_code: ${nullCountries}/${res.data.length}`);
    } else {
        console.log(`[FAILED] Status: ${res.status}`);
    }
}

main();
