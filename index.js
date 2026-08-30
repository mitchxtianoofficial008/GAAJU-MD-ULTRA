// Credits to Silent Wolf - Kenya
// Launcher + process manager + PING SERVER FOR RENDER (no express)
'use strict';
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { spawn } = require('child_process');

// ── PING SERVER - FIXES 502 - Uses built-in http ──
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  if (req.method === 'HEAD') {
    res.writeHead(200);
    return res.end();
  }
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('GAAJU MD ONLINE');
}).listen(PORT, () => {
  console.log(`[launcher] Ping server running on port ${PORT}`);
});

// ─────────────────────────────────────────

const BOT_DIR = path.join(__dirname, 'bot');
const YT_DLP = path.join(BOT_DIR, 'yt-dlp');
const YT_DLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

const LOCK_FILE = path.join(__dirname, '.launcher.pid');

function acquireLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const oldPid = parseInt(fs.readFileSync(LOCK_FILE, 'utf8').trim(), 10);
      if (oldPid && oldPid!== process.pid) {
        try { process.kill(oldPid, 'SIGTERM'); } catch (e) {}
        const deadline = Date.now() + 3000;
        while (Date.now() < deadline) {
          try { process.kill(oldPid, 0); } catch { break; }
        }
      }
    }
    fs.writeFileSync(LOCK_FILE, String(process.pid), 'utf8');
  } catch (e) {}
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const stored = parseInt(fs.readFileSync(LOCK_FILE, 'utf8').trim(), 10);
      if (stored === process.pid) fs.unlinkSync(LOCK_FILE);
    }
  } catch {}
}

let currentBot = null;
let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (currentBot) {
    try { currentBot.kill('SIGTERM'); } catch {}
    setTimeout(() => { try { currentBot.kill('SIGKILL'); } catch {} }, 5000);
  }
  releaseLock();
  setTimeout(() => process.exit(0), 6000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('exit', () => releaseLock());

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = (u) => https.get(u, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) return get(res.headers.location);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
    get(url);
  });
}

async function ensureYtDlp() {
  if (fs.existsSync(YT_DLP)) return;
  console.log('[launcher] yt-dlp missing — downloading...');
  await download(YT_DLP_URL, YT_DLP);
  fs.chmodSync(YT_DLP, '755');
}

function startBot() {
  if (shuttingDown) return;
  console.log('[launcher] Starting bot...');
  const bot = spawn(process.execPath, [path.join(__dirname, 'bot', 'index.js')], {
    stdio: 'inherit',
    env: process.env,
    cwd: BOT_DIR,
  });
  currentBot = bot;
  bot.on('exit', (code) => {
    currentBot = null;
    if (shuttingDown) return;
    if (code === 1) {
      console.log('[launcher] Bot exited 1 — restarting in 3s...');
      setTimeout(startBot, 3000);
    } else {
      console.log(`[launcher] Bot stopped (code ${code}).`);
    }
  });
}

function ensureDeps() {
  return new Promise((resolve) => {
    const nmDir = path.join(BOT_DIR, 'node_modules');
    const pkg = path.join(BOT_DIR, 'package.json');
    const testMod = path.join(nmDir, 'dotenv');
    if (fs.existsSync(testMod)) return resolve();
    if (!fs.existsSync(pkg)) return resolve();
    console.log('[launcher] node_modules missing — npm install in bot/...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install --omit=dev', { cwd: BOT_DIR, stdio: 'inherit', timeout: 180000 });
    } catch (e) {}
    resolve();
  });
}

acquireLock();
ensureDeps()
.then(() => ensureYtDlp().catch(()=>{}))
.finally(startBot);
