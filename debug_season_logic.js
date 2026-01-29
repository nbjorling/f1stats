
const { getSeasonPoints } = require('./src/lib/openf1');

async function main() {
    console.log('Running getSeasonPoints(2024)...');
    try {
        const stats = await getSeasonPoints(2024);
        console.log(`Success! Retrieved ${stats.length} drivers.`);
        if (stats.length > 0) {
            const max = stats.find(d => d.driver_number === 1);
            if (max && max.history.length > 0) {
                console.log('Max Verstappen first race:', max.history[0]);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
