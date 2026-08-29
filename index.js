// Credits to Silent Wolf - Kenya
// Launcher + process manager + PING SERVER FOR RENDER
'use strict';
const path = require('path');
const fs = require('fs');
const https = require('https');
const { spawn } = require('child_process');

// ── PING SERVER - THIS FIXES 502 ERROR ──────────────────
const express = require('express');
const app = express();
app.head('/', (req, res) => res.status(200).end());
app.get('/ping', (req,res) => res.send('GAAJU MD ONLINE'));
app.get('/', (req,res) => res.send('GAAJU MD ONLINE - Bot is running'));
app.listen(process.env.PORT || 3000, () => {
  console.log('[launcher] Ping server running on port ' + (process.env.PORT || 3000));
});
// ─────────────────────────────────────────────────────────

const BOT_DIR = path.join(__dirname, 'bot');
const YT_DLP = path.join(BOT_DIR, 'yt-dlp');
const YT_DLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

const LOCK_FILE = path.join(__dirname, '.launcher.pid');

function acquireLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const oldPid = parseInt(fs.readFileSync(LOCK_FILE, 'utf8').trim(), 10);
      if (oldPid && oldPid!== process.pid) {
        try {
          process.kill(oldPid, 'SIGTERM');
          console.log(`[launcher] Sent SIGTERM to old launcher PID ${oldPid}`);
        } catch (e) {}
        const deadline = Date.now() + 3000;
        while (Date.now() < deadline) {
          try { process.kill(oldPid, 0); } catch { break; }
        }
      }
    }
    fs.writeFileSync(LOCK_FILE, String(process.pid), 'utf8');
    console.log(`[launcher] Lock acquired (PID ${process.pid})`);
  } catch (e) {
    console.error('[launcher] Could not acquire lock:', e.message);
  }
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
  console.log(`[launcher] ${signal} received — stopping child bot...`);
  if (currentBot) {
    try {
      currentBot.kill('SIGTERM');
      setTimeout(() => {
        try { currentBot.kill('SIGKILL'); } catch {}
      }, 5000);
    } catch {}
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
  console.log('[launcher] yt-dlp missing — downloading latest...');
  await download(YT_DLP_URL, YT_DLP);
  fs.chmodSync(YT_DLP, '755');
  console.log('[launcher] yt-dlp ready.');
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
      console.log('[launcher] Bot exited with code 1 — restarting in 3s...');
      setTimeout(startBot, 3000);
    } else {
      console.log(`[launcher] Bot stopped (code ${code}). Launcher staying alive.`);
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
    console.log('[launcher] node_modules missing or incomplete — running npm install in bot/...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install --omit=dev', { cwd: BOT_DIR, stdio: 'inherit', timeout: 180000 });
      console.log('[launcher] npm install complete.');
    } catch (e) {
      console.error('[launcher] npm install failed:', e.message);
    }
    resolve();
  });
}

acquireLock();
ensureDeps()
 .then(() => ensureYtDlp().catch((err) => console.error('[launcher] yt-dlp download failed:', err.message)))
 .finally(startBot);
