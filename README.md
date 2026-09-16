  1	# example-three-tier-application
  2	
  3	A reference implementation of a three-tier web application: a Next.js frontend, an Express REST API, and a PostgreSQL database. It runs locally with Docker Compose and deploys to Google Cloud Platform (Cloud Run + Cloud SQL) via Terraform.
  4	
  5	## Architecture
  6	
  7	```
  8	Browser → Web (Next.js :3000) → API (Express :3001) → PostgreSQL
  9	```
 10	
 11	| Layer | Technology | Location |
 12	|-------|-----------|----------|
 13	| Frontend | Next.js 16, React 19, Tailwind CSS | `src/web/` |
 14	| API | Express 5, Node.js 22 | `src/api/` |
 15	| Database | PostgreSQL 17 | managed by Docker / Cloud SQL |
 16	| Migrations | node-pg-migrate | `src/db/` |
 17	| Infrastructure | Terraform (GCP) | `src/infrastructure/` |
 18	
 19	The app is a simple task manager (to-do list) that demonstrates how the three tiers communicate.
 20	
 21	## Running locally with Docker Compose
 22	
 23	### Prerequisites
 24	
 25	- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)
 26	
 27	### Start the stack
 28	
 29	```bash
 30	docker compose up --build
 31	```
 32	
 33	This starts four services in order:
 34	
 35	1. **postgres** — PostgreSQL 17 database, waits until healthy
 36	2. **migrate** — runs `node-pg-migrate up` to apply schema migrations, then exits
 37	3. **api** — Express API on port 3001 (internal only)
 38	4. **web** — Next.js frontend on port 3000 (exposed to host)
 39	
 40	Once running, open [http://localhost:3000](http://localhost:3000).
 41	
 42	### Stop and clean up
 43	
 44	```bash
 45	# Stop containers (keeps the postgres_data volume)
 46	docker compose down
 47	
 48	# Stop and delete all data
 49	docker compose down -v
 50	```
 51	
 52	### Rebuild after code changes
 53	
 54	```bash
 55	docker compose up --build
 56	```
 57	
 58	### API endpoints
 59	
 60	The API is not exposed directly, but you can reach it through the web container or by temporarily mapping its port:
 61	
 62	| Method | Path | Description |
 63	|--------|------|-------------|
 64	| GET | `/health` | Health check |
 65	| GET | `/tasks` | List all tasks |
 66	| POST | `/tasks` | Create a task (`{ "title": "..." }`) |
 67	| PATCH | `/tasks/:id` | Update a task (`{ "completed": true }` or `{ "title": "..." }`) |
 68	
 69	## Project structure
 70	
 71	```
 72	src/
 73	├── api/            # Express REST API
 74	│   ├── index.js    # Route handlers
 75	│   ├── db.js       # PostgreSQL connection pool
 76	│   └── Dockerfile
 77	├── db/             # Database migrations
 78	│   ├── migrations/ # node-pg-migrate migration files
 79	│   └── Dockerfile
 80	├── web/            # Next.js frontend
 81	│   ├── app/        # App Router pages and components
 82	│   └── Dockerfile
 83	└── infrastructure/ # Terraform for GCP deployment
 84	    ├── main.tf
 85	    ├── variables.tf
 86	    └── outputs.tf
 87	```
 88	
 89	## Deploying to GCP
 90	
 91	The `src/infrastructure/` directory contains Terraform that provisions:
 92	
 93	- VPC network and subnet
 94	- Cloud SQL PostgreSQL 17 instance (private IP)
 95	- Cloud Run services for the API and web frontend
 96	- Secret Manager secret for the database URL
 97	- Service accounts and IAM bindings
 98	
 99	### Required variables
100	
101	| Variable | Description |
102	|----------|-------------|
103	| `project_id` | GCP project ID |
104	| `api_image` | Container image URI for the API (e.g. `gcr.io/PROJECT/api:TAG`) |
105	| `web_image` | Container image URI for the web frontend |
106	| `region` | GCP region (default: `us-central1`) |
107	| `environment` | `dev`, `staging`, or `prod` (default: `dev`) |
108	
 109	```bash
 110	cd src/infrastructure
 111	terraform init
 112	terraform apply -var="project_id=my-project" \
 113	                -var="api_image=gcr.io/my-project/api:latest" \
 114	                -var="web_image=gcr.io/my-project/web:latest"
 115	```
 116	
 117	After apply, `terraform output web_url` gives the public URL.
 118	
 119	## Database migrations
 120	
 121	Migrations live in `src/db/migrations/` and use [node-pg-migrate](https://salsita.github.io/node-pg-migrate/).
 122	
 123	```bash
 124	# Apply all pending migrations (run inside the db container or with DATABASE_URL set)
 125	cd src/db
 126	DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate up
 127	
 128	# Roll back the last migration
 129	DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate down
 130	```
 131	
 132	When running via Docker Compose the `migrate` service handles this automatically on startup.
 133	
 134	🚀 🐳 🗄️ ⚡ 🎯 🌟 ✨ 🔧 💻 🎨
