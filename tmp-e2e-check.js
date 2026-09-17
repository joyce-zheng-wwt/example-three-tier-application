// Temporary end-to-end check: web (next start) -> API (express) -> Postgres (PGlite).
// Submits each rendered <form> the way a browser without JS would: POST back to the
// same URL with every hidden input the server rendered.
const path = require('path');
const Module = require('module');
const { spawn } = require('child_process');
const { createRequire } = require('module');

const req = createRequire('/tmp/pgcheck/index.js');
const { PGlite } = req('@electric-sql/pglite');
const { MigrationBuilder } = req('node-pg-migrate');

const repo = __dirname;
const dbPath = path.resolve(repo, 'src/api/db.js');

let failures = 0;
const check = (label, cond, extra) => {
  if (cond) console.log('PASS', label);
  else { failures++; console.log('FAIL', label, String(extra).slice(0, 400)); }
};

function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Parse forms into { fields: {name: value}, html }
function parseForms(html) {
  return [...html.matchAll(/<form[\s\S]*?<\/form>/g)].map((m) => {
    const formHtml = m[0];
    const fields = {};
    for (const inp of formHtml.matchAll(/<input\b[^>]*>/g)) {
      const tag = inp[0];
      const name = tag.match(/name="([^"]*)"/);
      if (!name) continue;
      const value = tag.match(/value="([^"]*)"/);
      fields[decodeEntities(name[1])] = value ? decodeEntities(value[1]) : '';
    }
    return { fields, html: formHtml };
  });
}

const boundary = '----formboundaryE2E';
function multipart(fields) {
  let body = '';
  for (const [k, v] of Object.entries(fields)) {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`;
  }
  return body + `--${boundary}--\r\n`;
}

async function main() {
  const pg = await PGlite.create();
  const adapter = { query: async (q) => pg.query(q), select: async (q) => (await pg.query(q)).rows };

  // Apply all repo migrations in order, like the migrate service does.
  const fs = require('fs');
  const dir = path.resolve(repo, 'src/db/migrations');
  for (const file of fs.readdirSync(dir).sort()) {
    const m = require(path.join(dir, file));
    const b = new MigrationBuilder(adapter, { schema: 'public' }, false, console);
    m.up(b);
    await pg.exec(b.getSql());
    console.log('migrated', file);
  }

  // Point the API at PGlite instead of a pg Pool.
  const stub = new Module(dbPath);
  stub.filename = dbPath;
  stub.loaded = true;
  stub.exports = {
    query: async (sql, params = []) => {
      const r = await pg.query(sql, params);
      return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length };
    },
  };
  require.cache[dbPath] = stub;

  process.env.PORT = '3921';
  require(path.resolve(repo, 'src/api/index.js'));
  await new Promise((r) => setTimeout(r, 500));

  const api = 'http://127.0.0.1:3921';
  let res = await fetch(`${api}/health`);
  check('api /health', res.status === 200, res.status);

  const web = spawn('node', ['.next/standalone/server.js'], {
    cwd: path.resolve(repo, 'src/web'),
    env: { ...process.env, PORT: '3922', HOSTNAME: '127.0.0.1', API_URL: api, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  web.stderr.on('data', (d) => process.stderr.write('[web:err] ' + d));

  const site = 'http://127.0.0.1:3922';
  const load = async (p = '/counters') => {
    const r = await fetch(site + p);
    return { status: r.status, html: await r.text() };
  };
  const submit = async (form, extra = {}) =>
    fetch(`${site}/counters`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: multipart({ ...form.fields, ...extra }),
      redirect: 'manual',
    });

  let up = false;
  for (let i = 0; i < 40 && !up; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const r = await fetch(`${site}/counters`);
      if (r.status < 500) up = true;
    } catch {}
  }
  check('next server responds', up, up);

  let page = await load();
  check('GET /counters renders 200', page.status === 200, page.status);
  check('empty state rendered', page.html.includes('No counters yet'), '');

  // Create via the UI form
  let forms = parseForms(page.html);
  check('one form when empty (create)', forms.length === 1, forms.length);
  res = await submit(forms[0], { name: 'coffees' });
  check('create form POST ok', res.status < 400, res.status);
  let rows = (await pg.query('SELECT * FROM counters')).rows;
  check('counter created in db via UI form', rows.length === 1 && rows[0].name === 'coffees', JSON.stringify(rows));

  // Reload; identify row forms by their button aria-labels / text
  page = await load();
  check('page shows counter name', page.html.includes('coffees'), '');
  forms = parseForms(page.html);
  const find = (needle) => forms.find((f) => f.html.includes(needle));
  const inc = find('Increment coffees');
  const dec = find('Decrement coffees');
  const reset = find('>Reset<');
  const del = find('Delete coffees');
  check('increment form present', !!inc, '');
  check('decrement form present', !!dec, '');
  check('reset form present', !!reset, '');
  check('delete form present', !!del, '');

  await submit(inc);
  await submit(inc);
  rows = (await pg.query('SELECT value FROM counters')).rows;
  check('two increments -> value 2', rows[0].value === 2, JSON.stringify(rows));

  page = await load();
  check('page renders value 2', />2</.test(page.html), '');
  check('page shows total', page.html.includes('Total:'), '');

  // Re-parse: action refs are per-render, so use the fresh forms.
  forms = parseForms(page.html);
  await submit(forms.find((f) => f.html.includes('Decrement coffees')));
  rows = (await pg.query('SELECT value FROM counters')).rows;
  check('decrement -> value 1', rows[0].value === 1, JSON.stringify(rows));

  page = await load();
  forms = parseForms(page.html);
  await submit(forms.find((f) => f.html.includes('>Reset<')));
  rows = (await pg.query('SELECT value FROM counters')).rows;
  check('reset -> value 0', rows[0].value === 0, JSON.stringify(rows));

  page = await load();
  forms = parseForms(page.html);
  await submit(forms.find((f) => f.html.includes('Delete coffees')));
  rows = (await pg.query('SELECT * FROM counters')).rows;
  check('delete -> row removed', rows.length === 0, JSON.stringify(rows));

  page = await load();
  check('page back to empty state', page.html.includes('No counters yet'), '');

  // Duplicate name is rejected by the API and does not create a second row
  page = await load();
  forms = parseForms(page.html);
  await submit(forms[0], { name: 'tea' });
  page = await load();
  forms = parseForms(page.html);
  await submit(forms[0], { name: 'tea' });
  rows = (await pg.query("SELECT * FROM counters WHERE name = 'tea'")).rows;
  check('duplicate name does not create second row', rows.length === 1, JSON.stringify(rows));

  // Home page unaffected and links to counters
  page = await load('/');
  check('home page renders 200', page.status === 200, page.status);
  check('home links to /counters', page.html.includes('href="/counters"'), '');
  check('home still renders to-do list', page.html.includes('To-Do List'), '');

  web.kill('SIGKILL');
  console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
