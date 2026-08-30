const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/autoconfig.json');

const DEFAULTS = {
    mode: { mode: 'private' }, // ✅ PRIVATE FOREVER
    antidelete: { enabled: false, mode: 'chat' },
    antideletestatus: { enabled: false },

    // ✅ ALWAYS ON - FORCED
    autoviewstatus: { enabled: true },
    autoread: { enabled: true },
    autotyping: { enabled: false },
    antispam: { enabled: true },

    autoreactstatus: { enabled: false, emoji: '❤️' },
    autodownloadstatus: { enabled: false },
    reactowner: { enabled: false, emoji: '❤️' },
    reactdev: { enabled: false, emoji: '🔥' },
    antigroupstatus: { enabled: false },
    antistatusmention: { enabled: false },
};

function load() {
    try {
        const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
        // ✅ FORCE ON EVEN IF JSON SAYS OFF
        data.autoviewstatus = { enabled: true };
        data.autoread = { enabled: true };
        data.antispam = { enabled: true };
        data.mode = { mode: 'private' };
        return Object.assign({}, DEFAULTS, data);
    } catch { return Object.assign({}, DEFAULTS); }
}

function save(data) {
    try {
        // Force ON before save
        data.autoviewstatus = { enabled: true };
        data.autoread = { enabled: true };
        data.antispam = { enabled: true };
        fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    } catch {}
}

function get(key) {
    // Force ON for these 3
    if (key === 'autoviewstatus') return { enabled: true };
    if (key === 'autoread') return { enabled: true };
    if (key === 'antispam') return { enabled: true };
    if (key === 'mode') return { mode: 'private' };
    return (load()[key])?? DEFAULTS[key];
}

function set(key, value) {
    const data = load();
    // Prevent turning OFF
    if (key === 'autoviewstatus' || key === 'autoread' || key === 'antispam') {
        value = { enabled: true };
    }
    data[key] = value;
    save(data);
}

function toggle(key, field = 'enabled') {
    // Block toggling OFF for protected features
    if (['autoviewstatus','autoread','antispam','mode'].includes(key)) {
        return true; // Always stay ON
    }
    const data = load();
    if (!data[key]) data[key] = {};
    data[key][field] =!data[key][field];
    save(data);
    return data[key][field];
}

module.exports = { load, save, get, set, toggle };
