# Backend Server

## Features

- Hono server with health and metrics endpoints
- REST APIs for courses (`/api/v1/courses`)
- OpenAPI reference available at `/api-reference` and Swagger UI can be pointed to it
- Structured logs (pino), security headers, rate limiting
- Dockerfile and docker-compose for production deployment
- Tests with coverage via Vitest

## Environment

- `PORT` default `3000`
- `DATABASE_URL` MongoDB connection string
- `LOG_LEVEL` default `info`
- `RATE_LIMIT_MAX` default `100`
- `RATE_LIMIT_WINDOW_MS` default `900000`
- `DB_MAX_POOL_SIZE` default `10`
- `DB_MIN_POOL_SIZE` default `1`

## Run

- Dev: `pnpm --filter server dev`
- Build: `pnpm --filter server build`
- Start: `pnpm --filter server start`
- Test: `pnpm --filter server test`

## Docker

- Build and run: `docker compose up --build -d`

