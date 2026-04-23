# DjangoREST

## Project structure

- `core/`, `apps/`, `manage.py`: Django REST backend
- `frontend/`: Next.js frontend (STREAMFLIX UI)

## Backend setup

1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies:
   `uv sync`
3. Run checks/tests:
   `uv run python manage.py check`
   `uv run pytest`
4. Run the API:
   `uv run python manage.py runserver`

## Frontend setup

1. Go to frontend:
   `cd frontend`
2. Install dependencies:
   `pnpm install`
3. Create local env:
   copy `frontend/.env.local.example` to `frontend/.env.local`
4. Run app:
   `pnpm dev`

The frontend runs on `http://localhost:3000` and backend on `http://localhost:8000`.

## API

- Movies endpoint: `/api/movies/`
- OpenAPI schema: `/api/schema/`
- Swagger UI: `/api/docs/`
