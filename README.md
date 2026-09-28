> **Note:** This repository is used for testing Forge.

# example-three-tier-application

A reference implementation of a three-tier web application: a Next.js frontend, an Express REST API, and a PostgreSQL database. It runs locally with Docker Compose and deploys to Google Cloud Platform (Cloud Run + Cloud SQL) via Terraform.

## Architecture

### Local Development (Docker Compose)

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Browser   │       │  Web Layer   │       │  API Layer   │       │ Data Layer   │
│  (Client)   │◄─────►│  Next.js     │◄─────►│  Express     │◄─────►│  PostgreSQL  │
│             │       │  :3000       │       │  :3001       │       │  Database    │
└─────────────┘       └──────────────┘       └──────────────┘       └──────────────┘
     HTTP                  HTTP                    HTTP                   TCP
```

### Cloud Deployment (GCP)

```
┌──────────────────────────────────── GCP VPC Network ────────────────────────────────────┐
│                                                                                           │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐    │
│  │    Users     │      │  Cloud Run   │      │  Cloud Run   │      │  Cloud SQL   │    │
│  │   (Public)   │─────►│  Web Service │─────►│  API Service │─────►│  PostgreSQL  │    │
│  │              │      │              │      │              │      │  (Private)   │    │
│  └──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘    │
│                                                                                           │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Location |
|-------|-----------|----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS | `src/web/` |
| **API** | Express 5, Node.js 22 | `src/api/` |
| **Database** | PostgreSQL 17 | managed by Docker / Cloud SQL |
| **Migrations** | node-pg-migrate | `src/db/` |
| **Infrastructure** | Terraform (GCP) | `src/infrastructure/` |

The app includes a task manager (to-do list) that demonstrates how the three tiers communicate.

## Features

- **To-Do List** (`/`) — Full-stack task manager with create, update, and delete operations
- **Counter** (`/counter`) — Simple client-side counter demo

## Running Locally with Docker Compose

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)

### Start the Stack

```bash
docker compose up --build
```

This starts four services in order:

1. **postgres** — PostgreSQL 17 database, waits until healthy
2. **migrate** — runs `node-pg-migrate up` to apply schema migrations, then exits
3. **api** — Express API on port 3001 (internal only)
4. **web** — Next.js frontend on port 3000 (exposed to host)

Once running, open [http://localhost:3000](http://localhost:3000).

### Stop and Clean Up

```bash
# Stop containers (keeps the postgres_data volume)
docker compose down

# Stop and delete all data
docker compose down -v
```

### Rebuild After Code Changes

```bash
docker compose up --build
```

### API Endpoints

The API is not exposed directly, but you can reach it through the web container or by temporarily mapping its port:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/tasks` | List all tasks |
| POST | `/tasks` | Create a task (`{ "title": "..." }`) |
| PATCH | `/tasks/:id` | Update a task (`{ "completed": true }` or `{ "title": "..." }`) |
| DELETE | `/tasks/:id` | Delete a task |

## Project Structure

```
src/
├── api/            # Express REST API
│   ├── index.js    # Route handlers
│   ├── db.js       # PostgreSQL connection pool
│   └── Dockerfile
├── db/             # Database migrations
│   ├── migrations/ # node-pg-migrate migration files
│   └── Dockerfile
├── web/            # Next.js frontend
│   ├── app/        # App Router pages and components
│   │   ├── page.tsx        # To-Do List (home page)
│   │   └── counter/page.tsx # Counter demo
│   └── Dockerfile
└── infrastructure/ # Terraform for GCP deployment
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

## Deploying to GCP

The `src/infrastructure/` directory contains Terraform that provisions:

- VPC network and subnet
- Cloud SQL PostgreSQL 17 instance (private IP)
- Cloud Run services for the API and web frontend
- Secret Manager secret for the database URL
- Service accounts and IAM bindings

### Required Variables

| Variable | Description |
|----------|-------------|
| `project_id` | GCP project ID |
| `api_image` | Container image URI for the API (e.g. `gcr.io/PROJECT/api:TAG`) |
| `web_image` | Container image URI for the web frontend |
| `region` | GCP region (default: `us-central1`) |
| `environment` | `dev`, `staging`, or `prod` (default: `dev`) |

### Deploy

```bash
cd src/infrastructure
terraform init
terraform apply -var="project_id=my-project" \
                -var="api_image=gcr.io/my-project/api:latest" \
                -var="web_image=gcr.io/my-project/web:latest"
```

After apply, `terraform output web_url` gives the public URL.

## Database Migrations

Migrations live in `src/db/migrations/` and use [node-pg-migrate](https://salsita.github.io/node-pg-migrate/).

### Manual Migration

```bash
# Apply all pending migrations (run inside the db container or with DATABASE_URL set)
cd src/db
DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate up

# Roll back the last migration
DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate down
```

When running via Docker Compose, the `migrate` service handles this automatically on startup.

## Development Workflow

1. **Make code changes** in `src/web/`, `src/api/`, or `src/db/`
2. **Rebuild and restart** with `docker compose up --build`
3. **Test locally** at [http://localhost:3000](http://localhost:3000)
4. **Deploy to GCP** using Terraform when ready

## Testing

To test the application locally, use Docker Compose to run all three tiers together:

### Quick Start

```bash
docker compose up --build
```

This command will:
- Build all container images (web, api, and db)
- Start the PostgreSQL database
- Run database migrations automatically
- Start the Express API server
- Start the Next.js frontend server

### Accessing the Application

Once all services are running, open your browser and navigate to:

```
http://localhost:3000
```

You can now:
- Create, update, and delete tasks on the To-Do List page
- Test the Counter demo at `/counter`
- Verify the full-stack integration between frontend, API, and database

### Stopping the Application

To stop all services:

```bash
docker compose down
```

To stop and remove all data (including the database volume):

```bash
docker compose down -v
```

## License

See [LICENSE](LICENSE) for details.
