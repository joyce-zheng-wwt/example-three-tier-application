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

// DELETE /tasks/:id — delete a task
app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const { rows } = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  res.status(204).end();
});

// GET /alarms — list all alarms
app.get('/alarms', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM alarms ORDER BY time ASC');
  res.json(rows);
});

// POST /alarms — create an alarm
app.post('/alarms', async (req, res) => {
  const { title, time, days } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (!time || typeof time !== 'string') {
    return res.status(400).json({ error: 'time is required (HH:MM format)' });
  }
  const daysValue = days || 'daily';
  const { rows } = await db.query(
    'INSERT INTO alarms (title, time, days) VALUES ($1, $2, $3) RETURNING *',
    [title.trim(), time, daysValue]
  );
  res.status(201).json(rows[0]);
});

// PATCH /alarms/:id — update an alarm
app.patch('/alarms/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { enabled, title, time, days } = req.body;

  const { rows } = await db.query('SELECT * FROM alarms WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const current = rows[0];
  const newEnabled = enabled !== undefined ? Boolean(enabled) : current.enabled;
  const newTitle = title !== undefined ? title.trim() : current.title;
  const newTime = time !== undefined ? time : current.time;
  const newDays = days !== undefined ? days : current.days;

  const { rows: updated } = await db.query(
    'UPDATE alarms SET enabled = $1, title = $2, time = $3, days = $4 WHERE id = $5 RETURNING *',
    [newEnabled, newTitle, newTime, newDays, id]
  );
  res.json(updated[0]);
});

// DELETE /alarms/:id — delete an alarm
app.delete('/alarms/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const { rows } = await db.query('DELETE FROM alarms WHERE id = $1 RETURNING *', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
