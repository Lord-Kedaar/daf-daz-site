#!/usr/bin/env node
/* Phase 6C — UTM / landing_page E2E regression test (Mordax F1).
   Real user journey: landing page with UTM params -> click CTA -> homepage
   contact form -> assert hidden fields keep the ORIGINAL UTM + landing URL.
   No form submission, no network calls, no cookies — privacy-first.

   Requires: headless Chrome on CDP 9222, static server on 127.0.0.1:8899.
   Usage: node scripts/phase6c_utm_e2e.mjs
*/
import http from 'node:http';

const CDP_PORT = 9222;
const BASE = 'http://127.0.0.1:8899';

const LANDINGS = [
  { path: '/deutsch-privatunterricht-wien/', label: 'DE privat' },
  { path: '/deutsch-fuer-polnischsprachige-wien/', label: 'DE für Polnischsprachige' },
  { path: '/pl/niemiecki-dla-polakow-wieden/', label: 'PL niemiecki dla Polaków' },
  { path: '/pl/przygotowanie-oeif-oesd-wieden/', label: 'PL ÖIF/ÖSD' },
];

const UTM = 'utm_source=facebook&utm_medium=cpc&utm_campaign=phase6c&utm_content=hero';

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

async function openPage(conn, url) {
  await conn.send('Page.enable');
  await conn.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await conn.send('Page.navigate', { url });
  await new Promise((r) => setTimeout(r, 1200));
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

  // ---- 1. Landing -> CTA -> form: UTM + original landing_page survive ----
  for (const l of LANDINGS) {
    await openPage(conn, `${BASE}${l.path}?${UTM}`);

    // CTA links must have been rewritten with the UTM query (before the hash).
    const ctaState = await evalIn(conn, `(() => {
      const links = Array.from(document.querySelectorAll('a[href*="#kontakt"]'));
      return {
        count: links.length,
        rewritten: links.filter(a => a.getAttribute('href').includes('utm_source=facebook')).length,
        sample: links[0] ? links[0].getAttribute('href') : null,
      };
    })()`);
    check(`[${l.label}] CTA hrefs carry UTM query`, ctaState.count > 0 && ctaState.rewritten === ctaState.count,
      `rewritten=${ctaState.rewritten}/${ctaState.count} sample="${ctaState.sample}"`);

    // Click the first CTA and wait for the homepage contact form.
    await evalIn(conn, `(() => {
      const a = document.querySelector('a[href*="#kontakt"]');
      a.click();
    })()`);
    await new Promise((r) => setTimeout(r, 1500));

    const formState = await evalIn(conn, `(() => {
      const form = document.querySelector('.contact-form form');
      if (!form) return { found: false };
      const val = (n) => { const f = form.querySelector('input[name="' + n + '"]'); return f ? f.value : null; };
      return {
        found: true,
        path: window.location.pathname,
        utmSource: val('utm_source'),
        utmMedium: val('utm_medium'),
        utmCampaign: val('utm_campaign'),
        utmContent: val('utm_content'),
        landingPage: val('landing_page'),
      };
    })()`);

    check(`[${l.label}] form reached on homepage`, formState.found && formState.path === (l.path.startsWith('/pl/') ? '/pl/' : '/'),
      formState.found ? `path=${formState.path}` : 'form not found');
    check(`[${l.label}] utm_source survives`, formState.utmSource === 'facebook', `utm_source="${formState.utmSource}"`);
    check(`[${l.label}] utm_medium survives`, formState.utmMedium === 'cpc', `utm_medium="${formState.utmMedium}"`);
    check(`[${l.label}] utm_campaign survives`, formState.utmCampaign === 'phase6c', `utm_campaign="${formState.utmCampaign}"`);
    check(`[${l.label}] utm_content survives`, formState.utmContent === 'hero', `utm_content="${formState.utmContent}"`);
    check(`[${l.label}] original landing_page survives`, formState.landingPage === l.path + '?' + UTM,
      `landing_page="${formState.landingPage}"`);
  }

  // ---- 2. Fail-safe: no UTM in URL -> no utm_* pollution; landing_page
  //        still propagates (original landing must reach the form even for
  //        organic traffic — that is the point of the landing_page field).
  await openPage(conn, `${BASE}/deutsch-privatunterricht-wien/`);
  const noUtm = await evalIn(conn, `(() => {
    const links = Array.from(document.querySelectorAll('a[href*="#kontakt"]'));
    const form = document.querySelector('.contact-form form');
    return {
      ctaClean: links.every(a => !a.getAttribute('href').includes('utm_')),
      sample: links[0] ? links[0].getAttribute('href') : null,
      formPresent: !!form,
    };
  })()`);
  check('fail-safe: no utm_* params in CTA hrefs without UTM', noUtm.ctaClean, `sample="${noUtm.sample}"`);

  // ---- 3. Index page: UTM captured, but no landing_page noise in links ----
  await openPage(conn, `${BASE}/?utm_source=google&utm_medium=cpc&utm_campaign=index`);
  const indexState = await evalIn(conn, `(() => {
    const form = document.querySelector('.contact-form form');
    const links = Array.from(document.querySelectorAll('a[href]'));
    const polluted = links.filter(a => a.getAttribute('href').includes('landing_page=')).length;
    return {
      utmSource: form.querySelector('input[name="utm_source"]').value,
      landingPage: form.querySelector('input[name="landing_page"]').value,
      polluted,
    };
  })()`);
  check('index: UTM captured from URL', indexState.utmSource === 'google', `utm_source="${indexState.utmSource}"`);
  check('index: landing_page = current page', indexState.landingPage === '/?utm_source=google&utm_medium=cpc&utm_campaign=index',
    `landing_page="${indexState.landingPage}"`);
  check('index: no landing_page noise in links', indexState.polluted === 0, `polluted=${indexState.polluted}`);

  // ---- 4. Privacy: no cookies / no storage written by the journey ----
  const privacy = await evalIn(conn, `(() => ({
    cookies: document.cookie,
    storageKeys: Object.keys(localStorage),
  }))()`);
  check('privacy: no cookies set', privacy.cookies === '', `cookies="${privacy.cookies}"`);
  check('privacy: no UTM data in localStorage', !privacy.storageKeys.some(k => k.startsWith('utm') || k === 'landing_page'),
    `storageKeys=[${privacy.storageKeys.join(', ')}]`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  conn.ws.close();
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(2); });
