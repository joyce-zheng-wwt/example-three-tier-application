const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /tasks — list all tasks
app.get('/tasks', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM tasks ORDER BY created_at ASC');
  res.json(rows);
});

// POST /tasks — create a task
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const { rows } = await db.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title.trim()]
  );
  res.status(201).json(rows[0]);
});

// PATCH /tasks/:id — update a task (complete/uncomplete or rename)
app.patch('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { completed, title } = req.body;

  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const current = rows[0];
  const newCompleted = completed !== undefined ? Boolean(completed) : current.completed;
  const newTitle = title !== undefined ? title.trim() : current.title;

  const { rows: updated } = await db.query(
    'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *',
    [newCompleted, newTitle, id]
  );
  res.json(updated[0]);
});

// GET /counters — list all counters
app.get('/counters', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM counters ORDER BY created_at ASC');
  res.json(rows);
});

// POST /counters — create a counter
app.post('/counters', async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  const { rows } = await db.query(
    'INSERT INTO counters (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
    [name.trim()]
  );
  if (rows.length === 0) {
    return res.status(409).json({ error: 'A counter with that name already exists' });
  }
  res.status(201).json(rows[0]);
});

// PATCH /counters/:id — increment/decrement (delta) or set an absolute value
app.patch('/counters/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { delta, value } = req.body;

  if (delta !== undefined && !Number.isInteger(delta)) {
    return res.status(400).json({ error: 'delta must be an integer' });
  }
  if (value !== undefined && !Number.isInteger(value)) {
    return res.status(400).json({ error: 'value must be an integer' });
  }

  const sql =
    value !== undefined
      ? 'UPDATE counters SET value = $1 WHERE id = $2 RETURNING *'
      : 'UPDATE counters SET value = value + $1 WHERE id = $2 RETURNING *';
  const amount = value !== undefined ? value : delta !== undefined ? delta : 0;

  const { rows } = await db.query(sql, [amount, id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// DELETE /counters/:id — remove a counter
app.delete('/counters/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { rowCount } = await db.query('DELETE FROM counters WHERE id = $1', [id]);
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
