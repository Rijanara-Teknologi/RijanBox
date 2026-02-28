const fs = require('fs');
const file = 'src/renderer/app.js';
let s = fs.readFileSync(file, 'utf8');

const startStr = 'const EMOJI_LIST = [';
const endStr = '];\n\n    let iconPickerTargetId';

const startIdx = s.indexOf(startStr);
const endIdx = s.indexOf(endStr, startIdx) + 2;

if (startIdx > -1 && endIdx > -1) {
    const patch = `let EMOJI_LIST = [];

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
    s = s.substring(0, startIdx) + patch + s.substring(endIdx);

    // Also patch the openIconPicker to await loadEmojis and populate if empty
    const funcStart = 'function openIconPicker(serviceId) {';
    const funcReplacement = `async function openIconPicker(serviceId) {`;
    s = s.replace(funcStart, funcReplacement);

    const populateStart = `        // Populate emoji grid\n        grid.innerHTML = '';\n        EMOJI_LIST.forEach`;
    const populateReplacement = `        // Populate emoji grid\n        if (EMOJI_LIST.length === 0) {\n            await loadEmojis();\n        }\n        grid.innerHTML = '';\n        EMOJI_LIST.forEach`;
    s = s.replace(populateStart, populateReplacement);

    fs.writeFileSync(file, s);
    console.log('Patch applied successfully.');
} else {
    console.log('Start or end string not found.');
}
