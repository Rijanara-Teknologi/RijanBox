const fs = require('fs');
const file = 'src/renderer/app.js';
let s = fs.readFileSync(file, 'utf8');

// Fix duplication
const magic = '* ═══════════════════════════════════════════════';
const splitIdx = s.lastIndexOf(magic);
if (splitIdx > 0 && splitIdx > 1000) {
    s = '/' + s.substring(splitIdx);
}

// Replace array
const regexArray = /const EMOJI_LIST = \[[\s\S]*?\];/;
const patch = `let EMOJI_LIST = [];\n
    async function loadEmojis() {
        if (EMOJI_LIST.length > 0) return;
        try {
            const res = await fetch('../data/emojis.json');
            EMOJI_LIST = await res.json();
        } catch (e) {
            console.error('Failed to load emojis:', e);
            EMOJI_LIST = ['😀', '❤️', '🔥', '⭐', '💼', '💻', '🎮', '🎵'];
        }
    }`;
s = s.replace(regexArray, patch);

// Patch openIconPicker
s = s.replace('function openIconPicker(serviceId) {', 'async function openIconPicker(serviceId) {');

const populateTarget = `        // Populate emoji grid\n        grid.innerHTML = '';\n        EMOJI_LIST.forEach(`;
const populatePatch = `        // Populate emoji grid\n        if (EMOJI_LIST.length === 0) await loadEmojis();\n        grid.innerHTML = '';\n        EMOJI_LIST.forEach(`;
s = s.replace(populateTarget, populatePatch);

fs.writeFileSync(file, s);
console.log('Fixed app.js successfully.');
