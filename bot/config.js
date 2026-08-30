'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const CREATORS = (process.env.CREATORS || process.env.OWNER_NUMBER || '')
   .split(',').map(n => n.replace(/\D/g, '').trim()).filter(Boolean);

// ✅ LOCKED PRIVATE - CANNOT BE CHANGED BY ENV OR COMMAND
const LOCKED_MODE = 'private';

module.exports = {
    SESSION_ID: process.env.SESSION_ID || '',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '',

    PREFIX: process.env.PREFIX || '.',
    BOT_NAME: process.env.BOT_NAME || 'MITCH CHRISTIANO-MD ULTRA',
    OWNER_NAME: process.env.OWNER_NAME || 'MITCH CHRISTIANO OFFICIAL',

    // ✅ FORCED PRIVATE - IGNORES process.env.MODE
    get MODE() { return LOCKED_MODE; },
    set MODE(v) { console.log('[config] MODE locked to private - ignoring', v); },

    TIME_ZONE: process.env.TIME_ZONE || 'Africa/Kampala',
    PORT: parseInt(process.env.PORT) || 3000,

    NEWSLETTER_JID: process.env.NEWSLETTER_JID || '',
    REACTDEV_CONFIG_URL: process.env.REACTDEV_CONFIG_URL || '',
    REACTDEV_NUMBERS: (process.env.REACTDEV_NUMBERS || '').split(',').map(n => n.replace(/\D/g, '')).filter(Boolean),
    REACTDEV_EMOJI: process.env.REACTDEV_EMOJI || '👑',

    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
    NEWSAPI_API_KEY: process.env.NEWSAPI_API_KEY || '',
    RAPIDAPI_API_KEY: process.env.RAPIDAPI_API_KEY || '',

    CREATORS,

    // ✅ EXTRA LOCKS
    PUBLIC: false,
    WORKTYPE: 'private',
    AUTO_READ: true, // Keep auto-read on as you wanted
};
