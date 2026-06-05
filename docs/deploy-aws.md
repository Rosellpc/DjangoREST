# Deploy En AWS

Guia de despliegue para StreamFlix Django REST en AWS.

Esta guia asume una arquitectura simple para produccion inicial:

- EC2 Ubuntu para backend Django, frontend Next.js, Nginx y procesos systemd.
- RDS PostgreSQL para la base de datos.
- Route 53 para DNS, si el dominio esta administrado en AWS.
- HTTPS mediante Nginx + Certbot, o mediante Load Balancer + AWS Certificate Manager.

## Arquitectura Recomendada

```text
Usuario
  |
  | HTTPS
  v
Dominio / Route 53
  |
  v
Nginx en EC2
  |-- /api/*, /admin/*, /static/* -> Gunicorn / Django
  |-- resto de rutas -> Next.js
  |
  v
RDS PostgreSQL
```

Para una primera version, una sola instancia EC2 alcanza. Para una version mas robusta, conviene mover HTTPS a un Application Load Balancer, usar ACM para certificados, guardar archivos estaticos/media en S3 y correr procesos en ECS o Elastic Beanstalk.

## Servicios AWS

### EC2

Usar una instancia Ubuntu LTS.

Recomendado para desarrollo/demo:

- `t3.small` o `t3.medium`
- 20 GB de disco EBS
- Security Group con:
  - SSH `22` solo desde tu IP
  - HTTP `80` desde internet
  - HTTPS `443` desde internet

### RDS PostgreSQL

Crear una instancia PostgreSQL en RDS.

Recomendado:

- Motor: PostgreSQL
- DB name: `dvdrental` o el nombre configurado en `.env`
- Public access: preferentemente `No`
- Security Group: permitir PostgreSQL `5432` solo desde el Security Group de EC2
- Backups automaticos habilitados

### DNS Y HTTPS

Opciones:

- Simple: apuntar el dominio a la IP elastica de EC2 y usar Certbot en Nginx.
- Mas AWS-native: Route 53 -> Application Load Balancer -> EC2, con certificado de AWS Certificate Manager.

Para empezar, la opcion EC2 + Nginx + Certbot es mas directa.

## Variables De Entorno

En la instancia EC2, crear un `.env` en la raiz del proyecto:

```env
DJANGO_ENV=prod
DEBUG=false
SECRET_KEY=replace-with-production-secret-key
ALLOWED_HOSTS=api.example.com,example.com,www.example.com,EC2_PUBLIC_IP

DB_NAME=dvdrental
DB_USER=postgres
DB_PASSWORD=replace-with-rds-password
DB_HOST=replace-with-rds-endpoint.amazonaws.com
DB_PORT=5432

API_PAGE_SIZE=20

JWT_ACCESS_TOKEN_MINUTES=15
JWT_REFRESH_TOKEN_DAYS=7
JWT_ROTATE_REFRESH_TOKENS=true
JWT_BLACKLIST_AFTER_ROTATION=true
JWT_UPDATE_LAST_LOGIN=false
JWT_ALGORITHM=HS256
JWT_SIGNING_KEY=replace-with-production-jwt-signing-key
```

Notas:

- `DJANGO_ENV=prod` hace que Django cargue `core/settings/prod.py`.
- `DEBUG=false` debe mantenerse siempre en produccion.
- `SECRET_KEY` y `JWT_SIGNING_KEY` deben ser valores largos, privados y distintos a los de desarrollo.
- `ALLOWED_HOSTS` debe incluir el dominio real y, temporalmente, la IP publica si se prueba sin dominio.

## Preparar La Instancia EC2

Conectarse por SSH:

```bash
ssh -i path/to/key.pem ubuntu@EC2_PUBLIC_IP
```

Actualizar paquetes:

```bash
sudo apt update
sudo apt upgrade -y
```

Instalar dependencias del sistema:

```bash
sudo apt install -y git curl build-essential nginx postgresql-client python3 python3-venv python3-pip
```

Instalar `uv`:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Cerrar y volver a abrir la sesion SSH, o cargar el PATH:

```bash
source ~/.profile
```

Instalar Node.js 20+ y pnpm:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

## Subir El Codigo

Clonar el repositorio:

```bash
sudo mkdir -p /srv/streamflix
sudo chown ubuntu:ubuntu /srv/streamflix
git clone REPOSITORY_URL /srv/streamflix/app
cd /srv/streamflix/app
```

Crear `.env`:

```bash
nano .env
```

Pegar las variables de produccion.

## Restaurar Base De Datos

Si se usa `streamflix_local.sql` como base inicial, copiarlo a la instancia o subirlo a S3 y descargarlo.

Ejemplo usando `scp` desde la maquina local:

```bash
scp -i path/to/key.pem streamflix_local.sql ubuntu@EC2_PUBLIC_IP:/srv/streamflix/streamflix_local.sql
```

Restaurar contra RDS:

```bash
psql \
  --host=RDS_ENDPOINT \
  --port=5432 \
  --username=DB_USER \
  --dbname=DB_NAME \
  --file=/srv/streamflix/streamflix_local.sql
```

Luego correr migraciones propias de Django:

```bash
cd /srv/streamflix/app
uv sync --frozen
uv run python manage.py migrate
```

Importante:

- Los modelos de `apps/content/` tienen `managed = False`, por lo que Django no crea ni modifica esas tablas.
- Las tablas de contenido deben existir previamente en PostgreSQL.
- Las tablas de `apps/subscriptions/`, auth, tokens y admin se crean con migraciones Django.

## Validar Backend

Desde `/srv/streamflix/app`:

```bash
uv run python manage.py check
uv run pytest
```

Crear superusuario si se necesita admin:

```bash
uv run python manage.py createsuperuser
```

Recolectar archivos estaticos:

```bash
uv run python manage.py collectstatic --noinput
```

## Configurar Gunicorn

Agregar Gunicorn al proyecto si todavia no esta instalado:

```bash
uv add gunicorn
```

Probar manualmente:

```bash
uv run gunicorn core.wsgi:application --bind 127.0.0.1:8000
```

Crear servicio systemd:

```bash
sudo nano /etc/systemd/system/streamflix-backend.service
```

Contenido:

```ini
[Unit]
Description=StreamFlix Django backend
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/srv/streamflix/app
EnvironmentFile=/srv/streamflix/app/.env
ExecStart=/home/ubuntu/.local/bin/uv run gunicorn core.wsgi:application --bind 127.0.0.1:8000 --workers 3
Restart=always

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable streamflix-backend
sudo systemctl start streamflix-backend
sudo systemctl status streamflix-backend
```

Logs:

```bash
journalctl -u streamflix-backend -f
```

## Configurar Frontend Next.js

Entrar al frontend:

```bash
cd /srv/streamflix/app/frontend
```

Crear `.env.local`:

```bash
nano .env.local
```

Contenido recomendado si Nginx sirve backend y frontend bajo el mismo dominio:

```env
NEXT_PUBLIC_API_BASE_URL=https://example.com/api
API_BASE_URL=http://127.0.0.1:8000/api
```

Instalar y compilar:

```bash
pnpm install --frozen-lockfile
pnpm build
```

Probar:

```bash
pnpm start --hostname 127.0.0.1 --port 3000
```

Crear servicio systemd:

```bash
sudo nano /etc/systemd/system/streamflix-frontend.service
```

Contenido:

```ini
[Unit]
Description=StreamFlix Next.js frontend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/srv/streamflix/app/frontend
Environment=NODE_ENV=production
EnvironmentFile=/srv/streamflix/app/frontend/.env.local
ExecStart=/usr/bin/pnpm start --hostname 127.0.0.1 --port 3000
Restart=always

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable streamflix-frontend
sudo systemctl start streamflix-frontend
sudo systemctl status streamflix-frontend
```

Logs:

```bash
journalctl -u streamflix-frontend -f
```

## Configurar Nginx

Crear sitio:

```bash
sudo nano /etc/nginx/sites-available/streamflix
```

Configuracion HTTP inicial:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    client_max_body_size 20M;

    location /static/ {
        alias /srv/streamflix/app/staticfiles/;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar sitio:

```bash
sudo ln -s /etc/nginx/sites-available/streamflix /etc/nginx/sites-enabled/streamflix
sudo nginx -t
sudo systemctl reload nginx
```

## HTTPS

### Opcion A: Certbot En EC2

Instalar Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Solicitar certificado:

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

Verificar renovacion:

```bash
sudo certbot renew --dry-run
```

### Opcion B: ACM + Application Load Balancer

Usar esta opcion si queres una arquitectura mas cercana a produccion AWS:

1. Crear certificado publico en AWS Certificate Manager.
2. Validar el dominio por DNS.
3. Crear Application Load Balancer publico.
4. Agregar listener HTTPS `443` con el certificado ACM.
5. Enviar trafico del Target Group hacia la EC2 en puerto `80`.
6. En Nginx, dejar HTTP interno detras del Load Balancer.

Con esta opcion, el certificado no se instala en EC2.

## DNS Con Route 53

Si se usa Route 53:

1. Crear o usar una Hosted Zone para el dominio.
2. Crear registro `A` hacia la IP elastica de EC2, o alias hacia el Load Balancer.
3. Crear registro `A` o `CNAME` para `www`.
4. Esperar propagacion DNS.

Si el dominio esta fuera de AWS, crear registros equivalentes en el proveedor DNS.

## Checklist De Seguridad

- `DEBUG=false`
- `DJANGO_ENV=prod`
- `SECRET_KEY` fuerte y privado
- `JWT_SIGNING_KEY` fuerte y privado
- `ALLOWED_HOSTS` sin comodines
- RDS no publico, salvo necesidad temporal controlada
- Security Group de RDS acepta `5432` solo desde EC2
- SSH permitido solo desde tu IP
- HTTPS funcionando antes de exponer usuarios reales
- Backups automaticos de RDS habilitados
- `.env` nunca committeado
- Logs revisados despues de cada deploy

## Deploy De Actualizacion

Desde EC2:

```bash
cd /srv/streamflix/app
git pull

uv sync --frozen
uv run python manage.py migrate
uv run python manage.py collectstatic --noinput
uv run python manage.py check

cd frontend
pnpm install --frozen-lockfile
pnpm build

sudo systemctl restart streamflix-backend
sudo systemctl restart streamflix-frontend
sudo systemctl reload nginx
```

Verificar:

```bash
sudo systemctl status streamflix-backend
sudo systemctl status streamflix-frontend
curl -I https://example.com
curl -I https://example.com/api/docs/
```

## Troubleshooting

### Error 502 En Nginx

Revisar servicios:

```bash
sudo systemctl status streamflix-backend
sudo systemctl status streamflix-frontend
journalctl -u streamflix-backend -n 100
journalctl -u streamflix-frontend -n 100
```

### Django Responde `DisallowedHost`

Agregar el dominio o IP en `ALLOWED_HOSTS` dentro de `.env` y reiniciar backend:

```bash
sudo systemctl restart streamflix-backend
```

### No Conecta A RDS

Revisar:

- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Security Group de RDS
- Que EC2 y RDS esten en VPC/subnets compatibles
- Que RDS permita trafico desde el Security Group de EC2

Probar:

```bash
psql --host=RDS_ENDPOINT --port=5432 --username=DB_USER --dbname=DB_NAME
```

### Frontend No Llega Al Backend

Revisar `.env.local`:

```env
API_BASE_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_API_BASE_URL=https://example.com/api
```

Recompilar y reiniciar:

```bash
cd /srv/streamflix/app/frontend
pnpm build
sudo systemctl restart streamflix-frontend
```

### Archivos Estaticos Del Admin No Cargan

Ejecutar:

```bash
cd /srv/streamflix/app
uv run python manage.py collectstatic --noinput
sudo systemctl reload nginx
```

Verificar que Nginx tenga:

```nginx
location /static/ {
    alias /srv/streamflix/app/staticfiles/;
}
```

## Referencias Oficiales

- EC2 Security Groups: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html
- Conectar a una instancia Linux por SSH: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connect-to-linux-instance.html
- Crear una instancia RDS: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_CreateDBInstance.html
- Certificados publicos ACM: https://docs.aws.amazon.com/acm/latest/userguide/acm-public-certificates.html
- Route 53 hacia EC2: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-ec2-instance.html
