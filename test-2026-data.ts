const API_BASE = 'https://api.openf1.org/v1';

async function check2026() {
  try {
    console.log('Fetching 2026 sessions...');
    const res = await fetch(`${API_BASE}/sessions?year=2026`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      console.log('Failed to fetch:', res.status, res.statusText);
      return;
    }
    const data = await res.json();
    console.log(`Found ${data.length} sessions for 2026.`);
    if (data.length > 0) {
      console.log('Sample session:', data[0]);
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

check2026();
