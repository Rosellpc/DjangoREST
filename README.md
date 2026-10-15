# StreamFlix

Aplicación de streaming para portafolio, con catálogo de películas, cuentas de usuario, perfiles y suscripciones de demostración.

**Demo:** [django-rest-sand.vercel.app](https://django-rest-sand.vercel.app) · **API:** [Catálogo](https://djangorest-w06k.onrender.com/api/movies/) · **Documentación:** [Swagger](https://djangorest-w06k.onrender.com/api/docs/)

> Los pagos son simulados y los títulos reutilizan los videos y pósteres locales disponibles. El proyecto no procesa cobros reales.

## Funcionalidades

- Home con portada, feed y filas de películas; Movies con búsqueda, filtros, ordenamiento y paginación; My List por perfil.
- Registro, login, renovación y cierre de sesión mediante JWT.
- Mi cuenta con nombre del titular, correo, plan, estado y fechas de suscripción registradas.
- Perfiles con preferencias, fotos JPG/PNG/WebP y bloqueo mediante PIN verificado en el servidor.
- Reproductor, historial y seguimiento del progreso de reproducción.
- Navegación Liquid Glass, logo carmesí, favicon y footer compartido.
- Catálogo con carga progresiva, bloques de hasta 200 películas y caché pública de cinco minutos. Los datos privados de cuenta no usan esa caché.

## Arquitectura

```text
Navegador → Vercel (Next.js y proxies internos)
                         ↓
                   Render (Django REST)
                         ↓
                   Neon (PostgreSQL)
```

Las notas de la primera versión están en [CHANGELOG.md](CHANGELOG.md).

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
- Node.js 22 LTS recomendado
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

4. Restaura primero las tablas del catálogo en PostgreSQL si la base está vacía. `streamflix_local.sql` es una referencia de datos; revisa su contenido antes de importarlo. Los modelos de contenido usan `managed = False`, por lo que `migrate` no crea estas tablas.

5. Ejecuta migraciones:

   ```powershell
   uv run python manage.py migrate
   ```

6. Levanta el backend:

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
   API_BASE_URL=http://127.0.0.1:8000/api
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
- Cuenta y suscripcion del usuario autenticado: `GET /api/auth/me/`
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
- Crear o recuperar el perfil inicial: `POST /api/subscriptions/profiles/initial/`
- Historial: `/api/subscriptions/history/`
- Mi lista: `/api/subscriptions/my-list/`

## Notas De Desarrollo

- La API requiere autenticacion por defecto, salvo endpoints publicos como catalogo, planes, registro y documentacion.
- Los modelos de `apps/content/` usan `managed = False`, porque representan tablas existentes de PostgreSQL.
- Los planes iniciales `basic`, `standard` y `premium` se cargan mediante migracion.
- El frontend usa `/api/catalog` y `/api/backend/...` como proxy hacia Django.

## Deploy

El despliegue del portafolio utiliza Vercel Hobby, Render Free y Neon Free. La guía de [AWS](docs/deploy-aws.md) es una alternativa y requiere adaptar el enrutamiento de Nginx para conservar los proxies `/api/catalog` y `/api/backend/` de Next.js.

### 1. Neon: base de datos

Crea una base PostgreSQL vacía y restaura una copia actualizada de la base local con `pg_dump` y `pg_restore`, usando una conexión directa y SSL. Incluye las tablas del catálogo antes de ejecutar las migraciones de Django. No publiques respaldos con datos privados en GitHub.

### 2. Render: backend

Conecta este repositorio como un Web Service de Python, con directorio raíz vacío y plan Free.

**Build Command:**

```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
```

**Start Command:**

```bash
gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

Configura las variables en Render → Environment:

| Variable | Valor |
| --- | --- |
| `DJANGO_ENV` | `prod` |
| `DEBUG` | `false` |
| `SECRET_KEY` | Clave privada nueva |
| `JWT_SIGNING_KEY` | Otra clave privada nueva |
| `ALLOWED_HOSTS` | Hostname real de Render, sin protocolo ni barras |
| `DB_HOST` | Host de Neon |
| `DB_NAME` | Nombre de la base de Neon |
| `DB_USER` | Usuario de Neon |
| `DB_PASSWORD` | Contraseña de Neon |
| `DB_PORT` | `5432` |

`core/settings/prod.py` configura SSL para PostgreSQL y WhiteNoise para los archivos estáticos. La ruta `/api/subscriptions/plans/` permite comprobar la conexión con la base. La raíz `/` del backend no tiene página de inicio.

### 3. Vercel: frontend

Importa el repositorio, elige Next.js y configura `frontend` como Root Directory. Usa `pnpm install --frozen-lockfile` para instalar y `pnpm build` para compilar; conserva el directorio de salida automático.

En las variables de producción establece:

```env
API_BASE_URL=https://TU-BACKEND.onrender.com/api
```

Después despliega. Cuando cambies variables, vuelve a desplegar. Las credenciales de Neon pertenecen exclusivamente al backend.

### Entornos y límites

- Django carga `.env` en desarrollo. El `.env.local` de la raíz puede servir como referencia privada, pero no se carga automáticamente.
- Next.js carga `frontend/.env.local` en desarrollo. `API_BASE_URL` es una variable del servidor; no necesita el prefijo `NEXT_PUBLIC_`.
- Render Free puede suspender el servicio por inactividad y demorar el primer acceso. Los planes gratuitos tienen cuotas; los videos consumen ancho de banda. Esta configuración está orientada a demostraciones y portafolio.
- Para actualizar, sube los cambios a GitHub y comprueba los despliegues de Render y Vercel. No subas archivos `.env` ni contraseñas.

## Estado Actual

Validado localmente:

```text
uv run python manage.py check
System check identified no issues

uv run pytest
44 passed

Frontend: 14 pruebas aprobadas; TypeScript correcto.
```

### Interfaz

- `/` mantiene la pagina principal con una portada separada y filas horizontales de peliculas. El logo STREAMFLIX lleva siempre a esta ruta.
- La portada es panoramica, con titulo y acciones sobre un degradado de contraste en la esquina inferior izquierda. Los avances se reproducen al solicitarlos. La navegacion movil es compacta y reserva espacio para el area segura del dispositivo.
- El codigo fuente se guarda en UTF-8 (`.editorconfig`), el documento HTML declara espanol y la API usa UTF-8. Los textos de interfaz mantienen tildes, signos y caracteres especiales.
- Home y Movies comparten una ficha de pelicula: pantalla completa en movil y columnas en escritorio, con sinopsis, reproduccion, My List y sugerencias del catalogo real.
- La navegacion muestra Movies (`/movies`) y My List (`/my-list`), tambien en movil. Home, TV Shows y New & Popular no aparecen en el menu.
- Movies incluye una portada, catalogo completo con busqueda por titulo o descripcion, filtros por clasificacion y duracion, ordenamiento y paginacion de 24 peliculas.
- My List muestra la coleccion del perfil activo, permite reproducir, consultar detalles y quitar peliculas, y ofrece estados de carga, error y lista vacia.
- Las paginas nuevas usan los posters y videos locales existentes. Los pagos siguen siendo simulados.
- Las fotos de perfil admiten JPG, PNG y WebP de hasta 5 MB. El navegador las reduce a un maximo de 256 pixeles antes de guardarlas; la API limita y valida la imagen codificada.
- El menu muestra el nombre del titular y el plan. "Mi cuenta y suscripcion" muestra correo, fecha de registro, perfil seleccionado, estado del plan y fechas de inicio/finalizacion registradas. Las suscripciones simuladas no muestran una proxima fecha de cobro inventada.
- Al elegir un plan se crea el perfil inicial con el nombre del titular o su nombre de usuario. El bootstrap recupera el perfil sin duplicarlo; los nombres personalizados se conservan. En el editor, "Usar el nombre de mi cuenta" permite actualizar perfiles anteriores.

### Seguridad y pruebas

- Los PIN se guardan con hash y nunca se devuelven en la API. `POST /api/subscriptions/profiles/{id}/verify-pin/` verifica el PIN con limite de intentos y entrega un permiso de una hora. Las operaciones sobre perfiles bloqueados, historial y mi lista requieren `X-Profile-Access`; cambiar el PIN invalida el permiso anterior.
- Las suscripciones se pueden crear y consultar. El servidor controla estado, fechas y proveedor; la activacion sigue siendo simulada. No se permiten modificaciones ni eliminaciones desde la API de usuario.
- El catalogo y las listas personales recorren todas las paginas. La busqueda del frontend usa el catalogo de la API.
- Las migraciones incluyen el estado de las tablas existentes del catalogo y convierten los PIN anteriores a hashes. Ejecutar `uv run python manage.py migrate` al actualizar.
- `pnpm test` verifica paginacion y permisos de perfil en el cliente. Las pruebas del backend incluyen registro, login, suscripcion, perfiles e historial. Todavia no hay pruebas de navegador automatizadas.
- `requirements.txt` se genera desde `uv.lock`: `uv export --frozen --no-dev --no-hashes --no-header --no-emit-project --output-file requirements.txt`.
