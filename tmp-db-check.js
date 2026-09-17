// Temporary: run the counters migration + API SQL against PGlite (real Postgres in WASM).
const path = require('path');
const { createRequire } = require('module');
const req = createRequire('/tmp/pgcheck/index.js');
const { PGlite } = req('@electric-sql/pglite');
const { MigrationBuilder } = req('node-pg-migrate');

async function main() {
  const pg = await PGlite.create();

  const migration = require(
    path.resolve(__dirname, 'src/db/migrations/1718500002000_create-counters.js')
  );

  const dbAdapter = { query: async (q) => pg.query(q), select: async (q) => (await pg.query(q)).rows };
  const upBuilder = new MigrationBuilder(dbAdapter, { schema: 'public' }, false, console);
  migration.up(upBuilder);
  const upSql = upBuilder.getSql();
  console.log('--- migration up SQL ---');
  console.log(upSql.trim());
  await pg.exec(upSql);

  let r = await pg.query(
    `SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns WHERE table_name = 'counters' ORDER BY ordinal_position`
  );
  console.log('--- counters columns ---');
  console.log(r.rows);

  let failures = 0;
  const check = (label, cond, extra) => {
    if (cond) console.log('PASS', label);
    else { failures++; console.log('FAIL', label, JSON.stringify(extra)); }
  };

  // Exercise exactly the SQL statements from src/api/index.js
  r = await pg.query(
    'INSERT INTO counters (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
    ['pushups']
  );
  check('insert returns row with default value 0', r.rows.length === 1 && r.rows[0].value === 0, r.rows);
  const id = r.rows[0].id;

  r = await pg.query(
    'INSERT INTO counters (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
    ['pushups']
  );
  check('duplicate name insert returns no rows (409 path)', r.rows.length === 0, r.rows);

  r = await pg.query('UPDATE counters SET value = value + $1 WHERE id = $2 RETURNING *', [1, id]);
  check('increment delta +1', r.rows[0].value === 1, r.rows);

  r = await pg.query('UPDATE counters SET value = value + $1 WHERE id = $2 RETURNING *', [-3, id]);
  check('decrement delta -3 (negative allowed)', r.rows[0].value === -2, r.rows);

  r = await pg.query('UPDATE counters SET value = $1 WHERE id = $2 RETURNING *', [0, id]);
  check('set absolute value 0', r.rows[0].value === 0, r.rows);

  r = await pg.query('UPDATE counters SET value = value + $1 WHERE id = $2 RETURNING *', [1, 9999]);
  check('update unknown id returns no rows (404 path)', r.rows.length === 0, r.rows);

  r = await pg.query('SELECT * FROM counters ORDER BY created_at ASC');
  check('list query works', r.rows.length === 1, r.rows);

  r = await pg.query('DELETE FROM counters WHERE id = $1', [id]);
  check('delete removes row', (r.affectedRows ?? r.rowCount ?? 0) === 1, r);

  r = await pg.query('DELETE FROM counters WHERE id = $1', [id]);
  check('delete unknown id affects 0 rows (404 path)', (r.affectedRows ?? r.rowCount ?? 0) === 0, r);

  // Migration down
  const downBuilder = new MigrationBuilder(dbAdapter, { schema: 'public' }, false, console);
  migration.down(downBuilder);
  const downSql = downBuilder.getSql();
  console.log('--- migration down SQL ---');
  console.log(downSql.trim());
  await pg.exec(downSql);
  r = await pg.query(`SELECT to_regclass('public.counters') AS t`);
  check('migration down drops table', r.rows[0].t === null, r.rows);

  console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
