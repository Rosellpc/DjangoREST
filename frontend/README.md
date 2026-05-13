# STREAMFLIX Frontend

Frontend de STREAMFLIX construido con Next.js, conectado al backend Django REST de este monorepo.

## Requisitos

- Node.js 20+
- pnpm
- Backend Django corriendo en `http://127.0.0.1:8000`

## Configuracion

1. Copia variables de entorno:
   `Copy-Item .env.local.example .env.local`
2. Revisa `NEXT_PUBLIC_API_BASE_URL` en `.env.local`.

Valor por defecto:

`NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`

## Ejecutar en desarrollo

Desde `frontend/`:

```bash
pnpm install
pnpm dev
```

La app queda disponible en `http://localhost:3000`.

## Scripts utiles

- `pnpm dev`: servidor de desarrollo
- `pnpm build`: build de produccion
- `pnpm start`: correr build de produccion
- `pnpm lint`: lint del frontend

## Flujo recomendado en el monorepo

1. Inicia backend en la raiz del repo:
   `uv run python manage.py runserver`
2. Inicia frontend en `frontend/`:
   `pnpm dev`

Con eso el frontend consume la API del backend local.
