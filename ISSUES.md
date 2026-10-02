# Known Issues

This document flags bugs, sharp edges, and workarounds in the example-three-tier-application.

## Critical Issues

### 1. Missing error handling in web app API calls
**Severity:** High  
**Location:** `src/web/app/actions.ts`  
**Description:** The `createTask()`, `toggleTask()`, and `deleteTask()` functions do not check the response status or handle errors. If the API returns an error (4xx or 5xx), the functions silently fail but still call `revalidatePath()`, giving the user a false impression of success.

**Example:**
```typescript
export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  // ❌ No error check before revalidating
  revalidatePath('/');
}
```

**Fix:** Check `res.ok` and throw an error if the response is not successful:
```typescript
export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create task');
  revalidatePath('/');
}
```

---

### 2. No input validation on PATCH title field
**Severity:** High  
**Location:** `src/api/index.js` (lines 33-49)  
**Description:** The PATCH `/tasks/:id` endpoint accepts a `title` field but does not validate that it is a non-empty string after trimming. An empty string or whitespace-only string can be stored in the database.

**Example:**
```javascript
const newTitle = title !== undefined ? title.trim() : current.title;
// ❌ No check that newTitle is not empty
```

**Fix:** Add validation:
```javascript
if (title !== undefined) {
  const trimmed = title.trim();
  if (!trimmed) {
    return res.status(400).json({ error: 'title cannot be empty' });
  }
  newTitle = trimmed;
}
```

---

### 3. Database connection pool not closed on API shutdown
**Severity:** Medium  
**Location:** `src/api/index.js` and `src/api/db.js`  
**Description:** The PostgreSQL connection pool is never closed when the server shuts down. This can cause the process to hang or leave orphaned connections in production.

**Fix:** Add a graceful shutdown handler:
```javascript
const server = app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  server.close();
  await db.end();
  process.exit(0);
});
```

---

### 4. No CORS headers on API
**Severity:** High  
**Location:** `src/api/index.js`  
**Description:** The Express API does not set CORS headers. In a production deployment where the web frontend and API are on different domains (e.g., different Cloud Run services), cross-origin requests will fail with a CORS error.

**Fix:** Add CORS middleware:
```javascript
const cors = require('cors');
app.use(cors());
```

Or manually set headers:
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

---

### 5. Web app does not handle API errors gracefully
**Severity:** High  
**Location:** `src/web/app/page.tsx`  
**Description:** The `getTasks()` function throws an error if the API is unreachable or returns a non-200 status, but there is no error boundary or fallback UI to display this to the user. The entire page will crash.

**Fix:** Add an error boundary component or wrap the fetch in a try-catch with a fallback:
```typescript
export default async function Home() {
  let tasks: Task[] = [];
  let error: string | null = null;
  
  try {
    tasks = await getTasks();
  } catch (e) {
    error = 'Failed to load tasks. Please try again later.';
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      {error && (
        <div className="max-w-lg mx-auto mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {/* ... rest of the component ... */}
    </div>
  );
}
```

---

## Medium Issues

### 6. Docker Compose web service may start before API is ready
**Severity:** Medium  
**Location:** `docker-compose.yml` (lines 38-47)  
**Description:** The `web` service depends on `api` but does not wait for the API to be healthy. If the API takes time to start, the web app may fail to fetch tasks on first load.

**Fix:** Add a healthcheck to the `api` service and update the `web` service dependency:
```yaml
api:
  # ... existing config ...
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
    interval: 5s
    timeout: 5s
    retries: 5

web:
  # ... existing config ...
  depends_on:
    api:
      condition: service_healthy
```

---

### 7. No logging or monitoring in API
**Severity:** Medium  
**Location:** `src/api/index.js`  
**Description:** The API server has minimal logging. Errors and request details are not logged, making debugging production issues difficult.

**Fix:** Add a logging middleware like Morgan:
```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

---

### 8. No environment variable validation
**Severity:** Medium  
**Location:** `src/api/index.js`, `src/web/app/actions.ts`  
**Description:** The API and web app rely on environment variables (`DATABASE_URL`, `API_URL`, `PORT`) but do not validate that they are set or have sensible values at startup.

**Fix:** Add startup validation:
```javascript
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}
```

---

## Low Issues

### 9. Terraform outputs not documented
**Severity:** Low  
**Location:** `src/infrastructure/outputs.tf` and `README.md`  
**Description:** The `src/infrastructure/outputs.tf` file exists but is not mentioned in the README. Users may not know what outputs are available after deployment.

**Fix:** Document the outputs in the README or add comments to the Terraform files explaining what each output provides.

---

### 10. API does not validate task ID format
**Severity:** Low  
**Location:** `src/api/index.js` (lines 33-34, 52-53)  
**Description:** The PATCH and DELETE endpoints parse the task ID with `parseInt(req.params.id, 10)` but do not validate that the ID is a positive integer. Invalid IDs like `abc` will parse to `NaN` and cause unexpected behavior.

**Fix:** Add validation:
```javascript
const id = parseInt(req.params.id, 10);
if (isNaN(id) || id <= 0) {
  return res.status(400).json({ error: 'Invalid task ID' });
}
```

---

## Summary

| Issue | Severity | Status |
|-------|----------|--------|
| Missing error handling in web app API calls | High | Open |
| No input validation on PATCH title field | High | Open |
| Database connection pool not closed on API shutdown | Medium | Open |
| No CORS headers on API | High | Open |
| Web app does not handle API errors gracefully | High | Open |
| Docker Compose web service may start before API is ready | Medium | Open |
| No logging or monitoring in API | Medium | Open |
| No environment variable validation | Medium | Open |
| Terraform outputs not documented | Low | Open |
| API does not validate task ID format | Low | Open |

All issues are currently open and should be addressed to improve reliability and production-readiness.
