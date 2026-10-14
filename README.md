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
pnpm typecheck
pnpm test
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
37 passed
```

### Interfaz

- `/` mantiene la pagina principal con su portada, feed y filas de peliculas. El logo STREAMFLIX lleva siempre a esta ruta.
- La navegacion muestra Movies (`/movies`) y My List (`/my-list`), tambien en movil. Home, TV Shows y New & Popular no aparecen en el menu.
- Movies incluye una portada, catalogo completo con busqueda por titulo o descripcion, filtros por clasificacion y duracion, ordenamiento y paginacion de 24 peliculas.
- My List muestra la coleccion del perfil activo, permite reproducir, consultar detalles y quitar peliculas, y ofrece estados de carga, error y lista vacia.
- Las paginas nuevas usan los posters y videos locales existentes. Los pagos siguen siendo simulados.
- Las fotos de perfil admiten JPG, PNG y WebP de hasta 5 MB. El navegador las reduce a un maximo de 256 pixeles antes de guardarlas; la API limita y valida la imagen codificada.

### Seguridad y pruebas

- Los PIN se guardan con hash y nunca se devuelven en la API. `POST /api/subscriptions/profiles/{id}/verify-pin/` verifica el PIN con limite de intentos y entrega un permiso de una hora. Las operaciones sobre perfiles bloqueados, historial y mi lista requieren `X-Profile-Access`; cambiar el PIN invalida el permiso anterior.
- Las suscripciones se pueden crear y consultar. El servidor controla estado, fechas y proveedor; la activacion sigue siendo simulada. No se permiten modificaciones ni eliminaciones desde la API de usuario.
- El catalogo y las listas personales recorren todas las paginas. La busqueda del frontend usa el catalogo de la API.
- Las migraciones incluyen el estado de las tablas existentes del catalogo y convierten los PIN anteriores a hashes. Ejecutar `uv run python manage.py migrate` al actualizar.
- `pnpm test` verifica paginacion y permisos de perfil en el cliente. Las pruebas del backend incluyen registro, login, suscripcion, perfiles e historial. Todavia no hay pruebas de navegador automatizadas.
- `requirements.txt` se genera desde `uv.lock`: `uv export --frozen --no-dev --no-hashes --no-header --no-emit-project --output-file requirements.txt`.
