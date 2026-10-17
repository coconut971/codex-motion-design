import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

let failed = false;
const check = (label, valid, detail) => { console.log(`${valid ? 'OK' : 'FAIL'} ${label}: ${detail}`); if (!valid) failed = true; };
check('Node', Number(process.versions.node.split('.')[0]) >= 22, process.version);
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const version = spawnSync(ffmpeg, ['-version'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
check('FFmpeg', version.status === 0, version.error?.message || version.stdout?.split(/\r?\n/)[0] || version.stderr);
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined, timeout: 20000 });
  const page = await browser.newPage();
  const canvas = await page.evaluate(() => !!document.createElement('canvas').getContext('2d'));
  check('Chromium + Canvas 2D', canvas, browser.version());
} catch (error) { check('Chromium', false, `${error.message}\nInstall: npx playwright install chromium, or set CHROME_PATH.`); }
finally { await browser?.close(); }
process.exitCode = failed ? 1 : 0;
