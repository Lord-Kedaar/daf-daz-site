#!/usr/bin/env node
/* Phase 6A QA: overflow (mobile+desktop) + form control focusability across ALL public pages. */
import http from 'node:http';

const CDP_PORT = 9222;
const BASE = 'http://127.0.0.1:8899';

const PAGES = [
  '/', '/pl/', '/en/',
  '/legal/imprint.html', '/legal/privacy.html',
  '/pl/legal/imprint.html', '/pl/legal/privacy.html',
  '/en/legal/imprint.html', '/en/legal/privacy.html',
  '/deutsch-privatunterricht-wien/',
  '/deutsch-fuer-polnischsprachige-wien/',
  '/pl/niemiecki-dla-polakow-wieden/',
  '/pl/przygotowanie-oeif-oesd-wieden/',
  '/404.html',
];

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: CDP_PORT, path }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  return { ws, send };
}

async function evalIn(conn, expression) {
  const r = await conn.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.result && r.result.exceptionDetails) throw new Error('EVAL FAIL: ' + JSON.stringify(r.result.exceptionDetails));
  return r.result.result.value;
}

async function openPage(conn, url, width, height, mobile) {
  await conn.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await conn.send('Page.navigate', { url });
  await new Promise((r) => setTimeout(r, 900));
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

async function main() {
  const pages = await getJson('/json');
  const page = pages.find((p) => p.type === 'page');
  if (!page) { console.log('NO PAGE'); process.exit(1); }
  const conn = await connect(page.webSocketDebuggerUrl);
  await conn.send('Page.enable');

  // --- Overflow: mobile 390x844 and desktop 1440x900, all pages ---
  for (const [label, w, h, mobile] of [['mobile', 390, 844, true], ['desktop', 1440, 900, false]]) {
    for (const p of PAGES) {
      await openPage(conn, BASE + p, w, h, mobile);
      const ov = await evalIn(conn, `(() => {
        const de = document.documentElement;
        const offenders = [];
        if (de.scrollWidth > window.innerWidth + 1) {
          // find widest offenders
          const els = document.querySelectorAll('body *');
          for (const el of els) {
            const r = el.getBoundingClientRect();
            if (r.right > window.innerWidth + 1 && r.width > 0) {
              offenders.push(el.tagName + '.' + (el.className && el.className.toString ? String(el.className).split(' ').slice(0,2).join('.') : '') + ' right=' + Math.round(r.right));
              if (offenders.length >= 5) break;
            }
          }
        }
        return { scrollW: de.scrollWidth, vw: window.innerWidth, offenders };
      })()`);
      check(`${label} overflow: ${p}`, ov.scrollW <= ov.vw + 1, ov.scrollW <= ov.vw + 1 ? `scrollW=${ov.scrollW} vw=${ov.vw}` : `scrollW=${ov.scrollW} vw=${ov.vw} offenders=${ov.offenders.join(' | ')}`);
    }
  }

  // --- Form controls: focusable + visible on pages with forms ---
  for (const p of ['/', '/pl/', '/en/', '/deutsch-privatunterricht-wien/', '/deutsch-fuer-polnischsprachige-wien/', '/pl/niemiecki-dla-polakow-wieden/', '/pl/przygotowanie-oeif-oesd-wieden/']) {
    await openPage(conn, BASE + p, 390, 844, true);
    const fc = await evalIn(conn, `(() => {
      const form = document.querySelector('.contact-form form');
      if (!form) return { hasForm: false };
      const controls = form.querySelectorAll('input, select, textarea, button');
      const bad = [];
      for (const c of controls) {
        if (c.type === 'hidden') continue; // hidden fields are intentionally invisible
        if (c.name === 'website') continue; // honeypot anti-spam: tabindex=-1, autocomplete=off, zero-size by design
        if (c.classList && c.classList.contains('form-status-close')) continue; // inside display:none status container, shown only after submit
        const r = c.getBoundingClientRect();
        if (c.disabled) { bad.push(c.name + ':disabled'); continue; }
        if (r.width === 0 || r.height === 0) { bad.push(c.name + ':zero-size'); continue; }
        if (c.tabIndex < 0) { bad.push(c.name + ':tabindex<0'); }
      }
      return { hasForm: true, controls: controls.length, bad };
    })()`);
    if (fc.hasForm) {
      check(`form controls focusable: ${p}`, fc.bad.length === 0, fc.bad.length === 0 ? `${fc.controls} controls OK` : fc.bad.join(' | '));
    } else {
      check(`form controls focusable: ${p}`, true, 'no form on page (N/A)');
    }
  }

  // --- Keyboard tab order: first focusable element reachable, CTA tabbable ---
  await openPage(conn, BASE + '/', 390, 844, true);
  const tab = await evalIn(conn, `(async () => {
    const cta = document.querySelector('.hero-cta .btn-primary');
    const before = document.activeElement && document.activeElement.tagName;
    cta.focus();
    const focused = document.activeElement === cta;
    const tabIndex = cta.tabIndex;
    return { before, focused, tabIndex };
  })()`);
  check('a11y: hero CTA programmatically focusable', tab.focused, `tabIndex=${tab.tabIndex}`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  conn.ws.close();
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(2); });
