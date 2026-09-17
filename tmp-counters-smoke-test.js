// Temporary smoke test for the counters endpoints (deleted after running).
const path = require('path');
const Module = require('module');

const dbPath = path.resolve(__dirname, 'src/api/db.js');

let nextId = 1;
const counters = [];

function fakeQuery(sql, params = []) {
  if (/^SELECT \* FROM counters/.test(sql)) {
    return { rows: counters.slice(), rowCount: counters.length };
  }
  if (/^INSERT INTO counters/.test(sql)) {
    const name = params[0];
    if (counters.some((c) => c.name === name)) return { rows: [], rowCount: 0 };
    const row = { id: nextId++, name, value: 0, created_at: new Date().toISOString() };
    counters.push(row);
    return { rows: [row], rowCount: 1 };
  }
  if (/^UPDATE counters SET value = \$1 WHERE id = \$2/.test(sql)) {
    const row = counters.find((c) => c.id === params[1]);
    if (!row) return { rows: [], rowCount: 0 };
    row.value = params[0];
    return { rows: [row], rowCount: 1 };
  }
  if (/^UPDATE counters SET value = value \+ \$1 WHERE id = \$2/.test(sql)) {
    const row = counters.find((c) => c.id === params[1]);
    if (!row) return { rows: [], rowCount: 0 };
    row.value += params[0];
    return { rows: [row], rowCount: 1 };
  }
  if (/^DELETE FROM counters/.test(sql)) {
    const i = counters.findIndex((c) => c.id === params[0]);
    if (i === -1) return { rows: [], rowCount: 0 };
    counters.splice(i, 1);
    return { rows: [], rowCount: 1 };
  }
  throw new Error('unexpected sql: ' + sql);
}

const stub = new Module(dbPath);
stub.filename = dbPath;
stub.loaded = true;
stub.exports = { query: async (sql, params) => fakeQuery(sql, params) };
require.cache[dbPath] = stub;

process.env.PORT = '3999';
require(path.resolve(__dirname, 'src/api/index.js'));

const base = 'http://127.0.0.1:3999';
let failures = 0;

function check(label, cond, extra) {
  if (cond) {
    console.log('PASS', label);
  } else {
    failures++;
    console.log('FAIL', label, JSON.stringify(extra));
  }
}

async function main() {
  await new Promise((r) => setTimeout(r, 400));

  let res = await fetch(`${base}/counters`);
  check('GET /counters empty', res.status === 200 && (await res.json()).length === 0);

  res = await fetch(`${base}/counters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '  pushups  ' }),
  });
  let body = await res.json();
  check('POST /counters creates', res.status === 201 && body.name === 'pushups' && body.value === 0, body);
  const id = body.id;

  res = await fetch(`${base}/counters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '' }),
  });
  check('POST /counters rejects empty name', res.status === 400, await res.json());

  res = await fetch(`${base}/counters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'pushups' }),
  });
  check('POST /counters rejects duplicate', res.status === 409, await res.json());

  res = await fetch(`${base}/counters/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta: 1 }),
  });
  body = await res.json();
  check('PATCH delta +1', res.status === 200 && body.value === 1, body);

  res = await fetch(`${base}/counters/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta: -3 }),
  });
  body = await res.json();
  check('PATCH delta -3', res.status === 200 && body.value === -2, body);

  res = await fetch(`${base}/counters/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: 0 }),
  });
  body = await res.json();
  check('PATCH value 0 resets', res.status === 200 && body.value === 0, body);

  res = await fetch(`${base}/counters/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta: 1.5 }),
  });
  check('PATCH rejects non-integer delta', res.status === 400, await res.json());

  res = await fetch(`${base}/counters/9999`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta: 1 }),
  });
  check('PATCH unknown id 404', res.status === 404, await res.json());

  res = await fetch(`${base}/counters/${id}`, { method: 'DELETE' });
  check('DELETE removes', res.status === 204);

  res = await fetch(`${base}/counters/${id}`, { method: 'DELETE' });
  check('DELETE unknown id 404', res.status === 404);

  console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
