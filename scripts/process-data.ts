import {
  getSeasonPoints,
  getSeasonTyreData,
  getTeamBattles,
} from '../src/lib/openf1';

// We need to polyfill fetch for Node environment if openf1.ts uses it (Next.js usually handles it, but tsx might not)
// However, tsx/node usually has fetch in modern versions.
// openf1.ts uses `fetch`. If running with `tsx`, it should be fine in Node 18+.

async function processYear(year: number) {
  console.log(`Processing data for ${year}...`);

  console.log(`Generating Standings...`);
  // This function now internally reads from raw data (via patched openf1.ts) and writes to processed cache
  await getSeasonPoints(year);

  console.log(`Generating Tyre Stats...`);
  await getSeasonTyreData(year);

  console.log(`Generating Team Battles...`);
  await getTeamBattles(year);

  console.log(`Completed processing for ${year}`);
}

async function main() {
  const years = [2023, 2024, 2025];
  for (const year of years) {
    await processYear(year);
  }
}

main().catch(console.error);
