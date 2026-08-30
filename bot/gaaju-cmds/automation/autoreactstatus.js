const {
  get,
  set
} = require("../../lib/autoconfig");
const {
  getBotName
} = require("../../lib/botname");
const DEFAULT_EMOJIS = ["❤️", "🔥", "😍", "👍", "🎉", "💯", "😂", "🥰", "🫶", "✨"];
function getCfg() {
  const _0x3d6bbb = get("autoreactstatus");
  return {
    enabled: false,
    mode: _0x3d6bbb?.mode ?? "fixed",
    emoji: _0x3d6bbb?.emoji ?? "❤️",
    emojis: Array.isArray(_0x3d6bbb?.emojis) && _0x3d6bbb.emojis.length ? _0x3d6bbb.emojis : [...DEFAULT_EMOJIS]
  };
}
function saveCfg(_0x254641) {
  const _0x9c0cfb = getCfg();
  set("autoreactstatus", Object.assign(_0x9c0cfb, _0x254641));
}
function pickEmoji(_0x5620af) {
  if (_0x5620af.mode === "random") {
    const _0x1f95f3 = _0x5620af.emojis.length ? _0x5620af.emojis : DEFAULT_EMOJIS;
    return _0x1f95f3[Math.floor(Math.random() * _0x1f95f3.length)];
  }
  return _0x5620af.emoji || "❤️";
}
async function handleAutoReact(_0x4337b0, _0x1d522b) {
  // PERMANENTLY DISABLED
  return;
}
module.exports = {
  handleAutoReact: handleAutoReact,
  name: "autolikestatus",
  aliases: ["als", "autoreactstatus", "ars", "autoreact"],
  description: "Auto-react to WhatsApp status updates (fixed or random emoji)",
  category: "automation",
  async execute(_0x152a76, _0x480677, _0x335524, _0x544347, _0x273b9c) {
    const _0x20fcf7 = _0x480677.key.remoteJid;
    const _0x369328 = getBotName();
    return _0x152a76.sendMessage(_0x20fcf7, {
      text: "╔═|〔  AUTO REACT STATUS 〕\n║\n║ ▸ *Status* : ❌ PERMANENTLY DISABLED\n║\n╚═|〔 " + _0x369328 + " 〕"
    }, {
      quoted: _0x480677
    });
  }
};
