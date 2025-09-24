**Spatial Rings**: In many fantasy series, a "spatial ring" or "space ring" is a ring that creates a small, separate pocket dimension. These can store items, and with advanced versions, even living beings, though common ones may not.

# Overview

- Stack: Dockerized Postgres, Express API with Prisma, bcrypt for password hashing, JWT for stateless auth, React (Vite) for web, and Expo for handheld.
- Security baseline: follow OWASP guidance for password storage, secrets, and Express hardening as the project grows.

# npm scripts

```js
"dev": "nodemon src/server.js",
"pg": "docker start pg-local",
"db": "npx prisma studio --schema ./prisma/schema.prisma"
```

## Step 0 — Prerequisites

- Install Node.js LTS, VS Code, and Docker Desktop; Docker will run a local Postgres without installing it natively.
- Create a new Git repo/folder (e.g., inventory-app) with subfolders api, web, and app for clear separation.

  ```bash
  cd my-app
  git init
  ```

## Step 1 — Start Postgres in Docker

- Run an official Postgres container with a named volume so data survives restarts:

  ```docker
  docker run -d --name pg-local -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=app -p 5432:5432 -v pg/var/lib/postgresql/data postgres
  ```

- Verify with `docker ps` and note that Postgres listens on _localhost:5432_ for the API.

## Step 2 — Scaffold the API (Express + Prisma)

- In inventory-app/api: `npm init -y`; then install deps: `npm i express nodemon dotenv cors helmet prisma @prisma/client bcrypt jsonwebtoken`.
- Initialize Prisma and set `DATABASE_URL` in api/.env: `npx prisma init` then

  ```
  DATABASE_URL=“postgresql://postgres:postgres@localhost:5432/app?schema=public”
  ```

- Create _api/src/server.js_ with a basic Express server and CORS/Helmet setup to prepare for routes.

## Step 3 — Add Prisma schema with Users

- Edit _api/prisma/schema.prisma_ with datasource and generator, then a minimal User including passwordHash; Prisma’s guides show this flow clearly.
- Run: `npx prisma migrate dev –name init` to create tables and generate the client; the Prisma tutorial uses this exact command for first migrations.

# Rails scaffold equivalent

✅ Backend Architecture

- Prisma DMMF integration - Reads your schema and exposes clean metadata via `/api/meta/*` endpoints
- Express API routes - RESTful CRUD endpoints for all your models
- JWT authentication - Proper auth middleware protecting your admin routes
- Clean separation - Public metadata, protected data operations

✅ Frontend Magic

- Dynamic form generation - Forms automatically adapt to your Prisma schema changes
- Smart field mapping - Handles different field types (text, numbers, dates, enums, relations)
- Reverse relation filtering - Correctly hides `assets Asset[]` from Location forms
- React Router layout - Professional admin shell with sidebar navigation

# Resources used in Spatial Ring App

Tailwind CSS,
Lucide,
Dockerized Postgres,
Express JS,
Prisma,
bcrypt for password hashing,
JWT for stateless auth,
React (Vite) for web, and
Expo for handheld.
