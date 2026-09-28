const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Helper function to validate YYYY-MM-DD date format
function isValidDate(dateString) {
  if (!dateString) return true; // null/undefined is allowed
  if (typeof dateString !== 'string') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  // Check if it's a valid date
  const date = new Date(dateString + 'T00:00:00Z');
  return date instanceof Date && !isNaN(date) && date.toISOString().startsWith(dateString);
}

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
  const { title, due_date } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (!isValidDate(due_date)) {
    return res.status(400).json({ error: 'due_date must be in YYYY-MM-DD format' });
  }
  const { rows } = await db.query(
    'INSERT INTO tasks (title, due_date) VALUES ($1, $2) RETURNING *',
    [title.trim(), due_date || null]
  );
  res.status(201).json(rows[0]);
});

// PATCH /tasks/:id — update a task (complete/uncomplete or rename)
app.patch('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { completed, title, due_date } = req.body;

  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  if (!isValidDate(due_date)) {
    return res.status(400).json({ error: 'due_date must be in YYYY-MM-DD format' });
  }

  const current = rows[0];
  const newCompleted = completed !== undefined ? Boolean(completed) : current.completed;
  const newTitle = title !== undefined ? title.trim() : current.title;
  const newDueDate = due_date !== undefined ? (due_date || null) : current.due_date;

  const { rows: updated } = await db.query(
    'UPDATE tasks SET completed = $1, title = $2, due_date = $3 WHERE id = $4 RETURNING *',
    [newCompleted, newTitle, newDueDate, id]
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

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
