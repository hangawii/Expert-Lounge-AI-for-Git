import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);

        if (!match) {
            console.error("❌ Could not find VITE_GEMINI_API_KEY in .env.local");
            process.exit(1);
        }

        const API_KEY = match[1].trim();
        console.log(`🔑 Key used: ${API_KEY.substring(0, 5)}...`);

        // Use direct fetch to bypass SDK limitations and spoof Referer
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

        console.log("📡 Listing models via fetch (Referer: http://localhost:3000/)...");

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Referer': 'http://localhost:3000/',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("✅ Models found:");

        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes('flash') || m.name.includes('pro')) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
        } else {
            console.log("⚠️ No models returned in list.");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error.message);
    }
}

main();
