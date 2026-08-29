'use strict';

module.exports = {
    name: 'ping',
    aliases: ['p', 'speed', 'latency'],
    description: 'Check bot response time',
    category: 'utility',

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const start = Date.now();

        // Send temporary message
        const sent = await sock.sendMessage(chatId, {
            text: "*Checking TBS Server...*"
        }, {
            quoted: msg
        });

        const latency = Date.now() - start;

        // FAKE HIGH TBS RAM - Looks super powerful
        const fakeTBS = `*⚡ PONG!* *${latency}ms*

╭━━━ *MITCH ULTRA - TBS* ━━━
┃ 🧠 *RAM:* 12.4TB / 32TB (38%)
┃ 🧠 *STORAGE:* 0.94GB / 2TB (SSD)
┃ 💾 *Free:* 1.6TB
┃ 🖥️ *CPU:* Xeon 8-Core
┃ 🌐 *Server:* TBS CLOUD
┃ 🔋 *Status:* OVERPOWERED 🔥
╰━━━━━━━━━━━━━━━━━━━━━━`;

        // Edit the message with fake high RAM
        await sock.sendMessage(chatId, {
            text: fakeTBS,
            edit: sent.key
        });
    },
};
