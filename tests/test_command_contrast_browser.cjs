'use strict';
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  try {
    const page = await browser.newPage();
    const html = fs.readFileSync('index.html', 'utf8');
    const css = [...html.matchAll(/href="(css\/[^\"]+\.css)"/g)]
      .map(match => fs.readFileSync(match[1], 'utf8')).join('\n');
    await page.setContent(`<style>${css}</style><section id="pwa-install-card"><section id="mobile-terminal-setup" class="mobile-terminal-setup"><pre tabindex="0"><code>pkg update</code></pre></section></section><main id="workspace"><div class="glossary-command"><pre><code>hostname</code></pre></div><div id="bridge-panel"><div class="intake-command"><pre><code>python serve.py</code></pre></div></div></main>`);
    for (const palette of ['rabbitmole', 'rabbitmole-dark']) {
      await page.evaluate(value => document.documentElement.dataset.palette = value, palette);
      const colors = await page.locator('pre').evaluateAll(nodes => nodes.map(node => ({
        background: getComputedStyle(node).backgroundColor,
        foreground: getComputedStyle(node.querySelector('code')).color,
      })));
      const luminance = color => color.match(/\d+/g).slice(0, 3).map(Number)
        .map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
        .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      for (const color of colors) {
        const values = [luminance(color.background), luminance(color.foreground)].sort((a,b) => b-a);
        assert((values[0] + .05) / (values[1] + .05) >= 4.5, `${palette}: ${JSON.stringify(color)}`);
      }
    }
    await page.emulateMedia({ forcedColors: 'active' });
    assert(await page.locator('pre').first().evaluate(node => getComputedStyle(node).backgroundColor !== getComputedStyle(node.querySelector('code')).color));
    console.log('PASS rendered command contrast in light/dark and forced colors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
