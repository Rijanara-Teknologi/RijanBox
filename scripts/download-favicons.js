const fs = require('fs');
const path = require('path');
const https = require('https');

const catalogPath = path.join(__dirname, '../src/data/services-catalog.json');
const faviconsDir = path.join(__dirname, '../assets/favicons');

// Read the catalog
let catalog = [];
try {
    const data = fs.readFileSync(catalogPath, 'utf8');
    catalog = JSON.parse(data);
} catch (err) {
    console.error('Failed to read services-catalog.json:', err);
    process.exit(1);
}

// Ensure dir exists
if (!fs.existsSync(faviconsDir)) {
    fs.mkdirSync(faviconsDir, { recursive: true });
}

// Helper to download a file
function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(dest, () => { });
                return reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            file.close();
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

// Safely generate an ID from a name
function generateId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
    console.log(`Starting favicon download for ${catalog.length} services...`);
    let downloaded = 0;
    let failed = 0;

    for (const service of catalog) {
        try {
            const urlObj = new URL(service.url);
            let domain = urlObj.hostname;

            // Special cases for better icons if needed, but s2/favicons usually handles redirects
            if (service.name === 'Discord') domain = 'discord.com';

            const id = generateId(service.name);
            const faviconUrl = `https://twenty-icons.com/${domain}/64`;
            const destPath = path.join(faviconsDir, `${id}.png`);

            if (fs.existsSync(destPath)) {
                console.log(`Skipping ${service.name} (${id}.png), already exists.`);
                continue;
            }

            process.stdout.write(`Downloading ${service.name} (${id}.png)... `);
            await download(faviconUrl, destPath);
            console.log('OK');
            downloaded++;
        } catch (err) {
            console.log(`FAIL: ${err.message}`);
            failed++;
        }

        // Small delay to avoid hammering the Google API
        await new Promise(r => setTimeout(r, 100));
    }

    console.log(`\nFinished! Downloaded: ${downloaded}, Failed: ${failed}`);
    console.log(`Icons saved to: ${faviconsDir}`);
}

run();
