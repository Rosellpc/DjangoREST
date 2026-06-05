# StreamFlix Django REST

Monorepo de una app tipo streaming con backend en Django REST Framework y frontend en Next.js.

El backend expone autenticacion JWT, catalogo de peliculas, planes de suscripcion, perfiles, historial de reproduccion y lista personal. El frontend consume esa API mediante rutas proxy internas de Next.js.

## Stack

- Python 3.13
- Django 6
- Django REST Framework
- Simple JWT
- PostgreSQL
- pytest + pytest-django
- Next.js 16
- React 19
- TypeScript
- pnpm

## Estructura

- `core/`: configuracion principal de Django.
- `apps/content/`: catalogo de peliculas basado en tablas existentes de PostgreSQL.
- `apps/subscriptions/`: planes, suscripciones, perfiles, historial y mi lista.
- `frontend/`: interfaz StreamFlix en Next.js.
- `streamflix_local.sql`: dump/base local de referencia.

## Requisitos

- Python 3.13+
- uv
- PostgreSQL
- Node.js 20+
- pnpm

## Configuracion Del Backend

1. Copia el archivo de entorno:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Ajusta las variables de `.env`:

   ```env
   DEBUG=True
   SECRET_KEY=your-local-secret-key
   DB_NAME=dvdrental
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_HOST=127.0.0.1
   DB_PORT=5432
   ```

3. Instala dependencias:

   ```powershell
   uv sync
   ```

4. Ejecuta migraciones:

   ```powershell
   uv run python manage.py migrate
   ```

5. Levanta el backend:

   ```powershell
   uv run python manage.py runserver
   ```

El backend queda disponible en `http://127.0.0.1:8000`.

## Configuracion Del Frontend

1. Entra al directorio del frontend:

   ```powershell
   cd frontend
   ```

2. Instala dependencias:

   ```powershell
   pnpm install
   ```

3. Crea el entorno local si existe el ejemplo:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

4. Revisa la URL del backend:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
   ```

5. Levanta la app:

   ```powershell
   pnpm dev
   ```

El frontend queda disponible en `http://localhost:3000`.

## Comandos Utiles

Backend:

```powershell
uv run python manage.py check
uv run pytest
uv run python manage.py runserver
```

Frontend:

```powershell
cd frontend
pnpm lint
pnpm build
pnpm dev
```

## API

Documentacion:

- OpenAPI schema: `GET /api/schema/`
- Swagger UI: `GET /api/docs/`

Autenticacion:

- Registro: `POST /api/auth/register/`
- Login: `POST /api/auth/login/`
- JWT token: `POST /api/token/`
- Refresh: `POST /api/token/refresh/`
- Verify: `POST /api/token/verify/`
- Blacklist: `POST /api/token/blacklist/`

Catalogo:

- Peliculas: `GET /api/movies/`
- Filtros disponibles: `release_year`, `rating`, `category`
- Busqueda: `search`
- Ordenamiento: `ordering`

Suscripciones:

- Planes: `GET /api/subscriptions/plans/`
- Suscripcion del usuario: `/api/subscriptions/subscriptions/`
- Perfiles: `/api/subscriptions/profiles/`
- Historial: `/api/subscriptions/history/`
- Mi lista: `/api/subscriptions/my-list/`

## Notas De Desarrollo

- La API requiere autenticacion por defecto, salvo endpoints publicos como catalogo, planes, registro y documentacion.
- Los modelos de `apps/content/` usan `managed = False`, porque representan tablas existentes de PostgreSQL.
- Los planes iniciales `basic`, `standard` y `premium` se cargan mediante migracion.
- El frontend usa `/api/catalog` y `/api/backend/...` como proxy hacia Django.

## Deploy

El proceso completo de despliegue en AWS esta documentado en [`docs/deploy-aws.md`](docs/deploy-aws.md).

## Estado Actual

Validado localmente:

```text
uv run python manage.py check
System check identified no issues

uv run pytest
24 passed
```
