import { openF1Client } from '../lib/api-client';
import path from 'path';

async function testClient() {
  console.log('Testing OpenF1Client with credentials...');
  console.log('Username:', process.env.OPENF1_USERNAME ? 'SET' : 'MISSING');
  console.log('Password:', process.env.OPENF1_PASSWORD ? 'SET' : 'MISSING');

  try {
    console.log('\n--- Testing getLatestSession ---');
    const { getLatestSession, getDrivers } = await import('../lib/openf1');
    const latestSession = await getLatestSession();
    console.log('Latest Session:', latestSession);

    if (latestSession) {
      console.log('\n--- Fetching Drivers for Latest Session ---');
      const drivers = await getDrivers(latestSession.session_key);
      console.log(`Found ${drivers.length} drivers.`);
      if (drivers.length > 0) {
        console.log(
          'Sample driver:',
          drivers[0].driver_number,
          drivers[0].last_name,
        );
      }
    }
    console.log('\n--- Fetching 2025 Sessions ---');
    const sessions2025 = await openF1Client.fetch('/sessions?year=2025');
    console.log(
      `Success! Found ${Array.isArray(sessions2025) ? sessions2025.length : 'non-array'} sessions.`,
    );

    console.log('\n--- Fetching 2026 Sessions ---');
    const sessions2026 = await openF1Client.fetch('/sessions?year=2026');
    console.log(
      `Success! Found ${Array.isArray(sessions2026) ? sessions2026.length : 'non-array'} sessions.`,
    );

    if (Array.isArray(sessions2026) && sessions2026.length > 0) {
      console.log('Sample 2026 session:', sessions2026[0]);
    }
  } catch (error) {
    console.error('\n--- Test Failed ---');
    console.error(error);
  }
}

testClient();
