#!/usr/bin/env node
/* Phase 3 verification: CTA visibility, form interaction WITHOUT submit, UTM capture, focus states.
   Uses CDP against headless Chrome on 9222, pages served from 127.0.0.1:8899. */
import http from 'node:http';

const CDP_PORT = 9222;
const BASE = 'http://127.0.0.1:8899';

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

  // ---- 1. Index DE: CTA above the fold + hero CTA visible ----
  await openPage(conn, BASE + '/');
  const hero = await evalIn(conn, `(() => {
    const cta = document.querySelector('.hero-cta .btn-primary');
    if (!cta) return { found: false };
    const r = cta.getBoundingClientRect();
    return { found: true, top: r.top, bottom: r.bottom, vh: window.innerHeight, visible: r.top < window.innerHeight && r.bottom > 0, text: cta.textContent.trim() };
  })()`);
  check('index DE: hero CTA above the fold', hero.found && hero.visible, hero.found ? `top=${Math.round(hero.top)}px vh=${hero.vh} text="${hero.text}"` : 'CTA not found');

  // ---- 2. Index DE: price CTA present ----
  const priceCta = await evalIn(conn, `(() => {
    const el = document.querySelector('.price-cta .btn-primary');
    if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    return { found: true, text: el.textContent.trim(), width: Math.round(r.width) };
  })()`);
  check('index DE: CTA after prices', priceCta.found, priceCta.found ? `text="${priceCta.text}"` : 'not found');

  // ---- 3. Form interaction WITHOUT submit: fill fields, check UTM capture ----
  await evalIn(conn, `(() => {
    const form = document.querySelector('.contact-form form');
    form.querySelector('input[name="name"]').value = 'Test Name';
    form.querySelector('input[name="email"]').value = 'test@example.com';
    form.querySelector('textarea[name="message"]').value = 'Test message — not sent';
    form.querySelector('input[name="privacyConsent"]').checked = true;
    form.querySelector('select[name="level"]').value = 'B1';
    form.querySelector('select[name="goal"]').value = 'arbeit';
  })()`);
  const formState = await evalIn(conn, `(() => {
    const form = document.querySelector('.contact-form form');
    return {
      name: form.querySelector('input[name="name"]').value,
      email: form.querySelector('input[name="email"]').value,
      message: form.querySelector('textarea[name="message"]').value,
      consent: form.querySelector('input[name="privacyConsent"]').checked,
      level: form.querySelector('select[name="level"]').value,
      goal: form.querySelector('select[name="goal"]').value,
      utmSource: form.querySelector('input[name="utm_source"]').value,
      landingPage: form.querySelector('input[name="landing_page"]').value,
      action: form.getAttribute('action'),
      method: form.getAttribute('method')
    };
  })()`);
  check('form: fields fillable (no submit)', formState.name === 'Test Name' && formState.email === 'test@example.com' && formState.message === 'Test message — not sent' && formState.consent === true, `level=${formState.level} goal=${formState.goal}`);
  check('form: action=Formspree, method=POST (untouched)', formState.action.includes('formspree.io') && formState.method === 'POST', formState.action);
  check('form: UTM fields empty without UTM in URL (fail-safe)', formState.utmSource === '' && formState.landingPage === '/', `utm_source="${formState.utmSource}" landing_page="${formState.landingPage}"`);

  // ---- 4. UTM capture with UTM params in URL ----
  await openPage(conn, BASE + '/?utm_source=google&utm_medium=cpc&utm_campaign=test');
  const utmState = await evalIn(conn, `(() => {
    const form = document.querySelector('.contact-form form');
    return {
      source: form.querySelector('input[name="utm_source"]').value,
      medium: form.querySelector('input[name="utm_medium"]').value,
      campaign: form.querySelector('input[name="utm_campaign"]').value,
      landing: form.querySelector('input[name="landing_page"]').value
    };
  })()`);
  check('form: UTM captured from URL', utmState.source === 'google' && utmState.medium === 'cpc' && utmState.campaign === 'test', `source=${utmState.source} medium=${utmState.medium} landing=${utmState.landing}`);

  // ---- 5. Landing DE: CTA after prices ----
  await openPage(conn, BASE + '/deutsch-privatunterricht-wien/');
  const landCta = await evalIn(conn, `(() => {
    const price = document.getElementById('preise');
    const cta = document.querySelector('.price-cta .btn-primary');
    if (!price || !cta) return { found: false };
    const pr = price.getBoundingClientRect();
    const cr = cta.getBoundingClientRect();
    return { found: true, afterPrices: cr.top >= pr.top, text: cta.textContent.trim(), href: cta.getAttribute('href') };
  })()`);
  check('landing DE: CTA after prices section', landCta.found && landCta.afterPrices, landCta.found ? `text="${landCta.text}" href="${landCta.href}"` : 'not found');

  // ---- 6. Landing PL: CTA after prices ----
  await openPage(conn, BASE + '/pl/niemiecki-dla-polakow-wieden/');
  const landCtaPl = await evalIn(conn, `(() => {
    const price = document.getElementById('ceny');
    const cta = document.querySelector('.price-cta .btn-primary');
    if (!price || !cta) return { found: false };
    const pr = price.getBoundingClientRect();
    const cr = cta.getBoundingClientRect();
    return { found: true, afterPrices: cr.top >= pr.top, text: cta.textContent.trim(), href: cta.getAttribute('href') };
  })()`);
  check('landing PL: CTA after prices section', landCtaPl.found && landCtaPl.afterPrices, landCtaPl.found ? `text="${landCtaPl.text}" href="${landCtaPl.href}"` : 'not found');

  // ---- 7. Keyboard focus: tab to CTA shows focus-visible ----
  await openPage(conn, BASE + '/');
  const focus = await evalIn(conn, `(async () => {
    const cta = document.querySelector('.hero-cta .btn-primary');
    cta.focus();
    const style = getComputedStyle(cta);
    const outline = style.outlineStyle + ' ' + style.outlineWidth;
    const boxShadow = style.boxShadow;
    return { outline, boxShadow, focused: document.activeElement === cta };
  })()`);
  check('a11y: CTA receives keyboard focus', focus.focused, `outline=${focus.outline} shadow=${focus.boxShadow.slice(0, 60)}`);

  // ---- 8. Mobile: no horizontal overflow ----
  const overflow = await evalIn(conn, `(() => ({
    scrollW: document.documentElement.scrollWidth,
    vw: window.innerWidth
  }))()`);
  check('mobile: no horizontal overflow', overflow.scrollW <= overflow.vw, `scrollW=${overflow.scrollW} vw=${overflow.vw}`);

  // ---- 9. Form hint present above form ----
  const hint = await evalIn(conn, `(() => {
    const h = document.querySelector('.form-hint');
    if (!h) return { found: false };
    const form = document.querySelector('.contact-form form');
    const hr = h.getBoundingClientRect();
    const fr = form.getBoundingClientRect();
    return { found: true, aboveForm: hr.top < fr.top, text: h.textContent.trim().slice(0, 60) };
  })()`);
  check('form: hint above form', hint.found && hint.aboveForm, hint.found ? `"${hint.text}..."` : 'not found');

  // ---- 10. Quick answer section present on index ----
  const qa = await evalIn(conn, `(() => {
    const s = document.getElementById('antwort');
    if (!s) return { found: false };
    const items = s.querySelectorAll('.qa-item').length;
    return { found: true, items };
  })()`);
  check('index: quick-answer section', qa.found && qa.items >= 4, qa.found ? `${qa.items} items` : 'not found');

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  conn.ws.close();
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(2); });
