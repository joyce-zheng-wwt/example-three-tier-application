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

// Normalize a "HH:MM" or "HH:MM:SS" string to "HH:MM:SS", or return null if invalid
function normalizeTime(value) {
  if (typeof value !== 'string') return null;
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(value.trim());
  if (!match) return null;
  return `${match[1]}:${match[2]}:${match[3] || '00'}`;
}

// GET /alarms — list all alarms
app.get('/alarms', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM alarms ORDER BY time ASC, id ASC');
  res.json(rows);
});

// POST /alarms — create an alarm
app.post('/alarms', async (req, res) => {
  const { time, label } = req.body;

  const normalizedTime = normalizeTime(time);
  if (!normalizedTime) {
    return res.status(400).json({ error: 'time is required in HH:MM format' });
  }

  const trimmedLabel = typeof label === 'string' && label.trim() ? label.trim() : 'Alarm';
  if (trimmedLabel.length > 200) {
    return res.status(422).json({ error: 'label must be 200 characters or fewer' });
  }

  const { rows } = await db.query(
    'INSERT INTO alarms (time, label) VALUES ($1, $2) RETURNING *',
    [normalizedTime, trimmedLabel]
  );
  res.status(201).json(rows[0]);
});

// PATCH /alarms/:id — update an alarm (enable/disable, retime or relabel)
app.patch('/alarms/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { enabled, time, label } = req.body;

  const { rows } = await db.query('SELECT * FROM alarms WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const current = rows[0];

  let newTime = current.time;
  if (time !== undefined) {
    newTime = normalizeTime(time);
    if (!newTime) return res.status(400).json({ error: 'time must be in HH:MM format' });
  }

  let newLabel = current.label;
  if (label !== undefined) {
    if (typeof label !== 'string' || !label.trim()) {
      return res.status(400).json({ error: 'label must be a non-empty string' });
    }
    newLabel = label.trim();
    if (newLabel.length > 200) {
      return res.status(422).json({ error: 'label must be 200 characters or fewer' });
    }
  }

  const newEnabled = enabled !== undefined ? Boolean(enabled) : current.enabled;

  const { rows: updated } = await db.query(
    'UPDATE alarms SET time = $1, label = $2, enabled = $3 WHERE id = $4 RETURNING *',
    [newTime, newLabel, newEnabled, id]
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
