// Temporary: dump rendered form markup for /counters and /
const path = require('path');
const Module = require('module');
const { spawn } = require('child_process');
const { createRequire } = require('module');

const req = createRequire('/tmp/pgcheck/index.js');
const { PGlite } = req('@electric-sql/pglite');
const { MigrationBuilder } = req('node-pg-migrate');

const repo = __dirname;
const dbPath = path.resolve(repo, 'src/api/db.js');

async function main() {
  const pg = await PGlite.create();
  const adapter = { query: async (q) => pg.query(q), select: async (q) => (await pg.query(q)).rows };
  const fs = require('fs');
  const dir = path.resolve(repo, 'src/db/migrations');
  for (const file of fs.readdirSync(dir).sort()) {
    const m = require(path.join(dir, file));
    const b = new MigrationBuilder(adapter, { schema: 'public' }, false, console);
    m.up(b);
    await pg.exec(b.getSql());
  }
  await pg.query("INSERT INTO counters (name, value) VALUES ('coffees', 5)");
  await pg.query("INSERT INTO tasks (title) VALUES ('demo task')");

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

  process.env.PORT = '3911';
  require(path.resolve(repo, 'src/api/index.js'));
  await new Promise((r) => setTimeout(r, 500));

  const web = spawn('node', ['.next/standalone/server.js'], {
    cwd: path.resolve(repo, 'src/web'),
    env: { ...process.env, PORT: '3912', HOSTNAME: '127.0.0.1', API_URL: 'http://127.0.0.1:3911', NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  web.stderr.on('data', (d) => process.stderr.write('[web:err] ' + d));

  let html = '';
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const r = await fetch('http://127.0.0.1:3912/counters');
      if (r.status === 200) { html = await r.text(); break; }
    } catch {}
  }

  for (const m of html.matchAll(/<form[\s\S]*?<\/form>/g)) {
    console.log('COUNTERS FORM:', m[0].slice(0, 500));
    console.log('---');
  }

  const home = await (await fetch('http://127.0.0.1:3912/')).text();
  for (const m of home.matchAll(/<form[\s\S]*?<\/form>/g)) {
    console.log('HOME FORM:', m[0].slice(0, 500));
    console.log('---');
  }

  web.kill('SIGKILL');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
