const { get, set, toggle } = require('../../lib/autoconfig');
const { getBotName }       = require('../../lib/botname');
const config               = require('../../config');

// Dedup: track message IDs already reacted to (max 200 entries)
const _reactedIds = new Set();

async function handleReactOwner(sock, msg) {
    // PERMANENTLY DISABLED
    return;
}

module.exports = {
    handleReactOwner,

    name:        'reactowner',
    aliases:     ['ro', 'ownerreact'],
    description: 'Auto-react to owner messages',
    category:    'automation',

    async execute(sock, msg, args, prefix, ctx) {
        const chatId = msg.key.remoteJid;
        const name   = getBotName();

        return sock.sendMessage(chatId, {
            text: `╔═|〔  REACT OWNER 〕\n║\n║ ▸ *Status* : ❌ PERMANENTLY DISABLED\n║\n╚═|〔 ${name} 〕`
        }, { quoted: msg });
    }
};
