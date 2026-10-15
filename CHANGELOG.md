# Historial de versiones

## v0.1.0 — Primera versión de StreamFlix

Primera versión del portafolio: aplicación Next.js integrada con Django REST y PostgreSQL, preparada para Vercel, Render y Neon.

### Funciones

- Home, Movies y My List con navegación adaptable a móvil.
- Registro y autenticación JWT, renovación de tokens y cierre de sesión.
- Cuenta del titular con plan, estado y fechas de suscripción registradas.
- Perfiles, fotos, preferencias y bloqueo con PIN protegido mediante hash.
- Catálogo con búsqueda, filtros, ordenamiento, paginación y carga progresiva.
- Lista personal, historial, reproductor y progreso por perfil.
- Logo carmesí, favicon, navegación Liquid Glass y footer compartido.
- Documentación OpenAPI y Swagger.

### Rendimiento y privacidad

- Bloques de hasta 200 películas, carga inicial progresiva y caché pública de cinco minutos para el catálogo.
- Cuenta y datos personales consultados con autenticación y sin caché pública.
- Control del estado de suscripción en el servidor y permisos temporales para perfiles con PIN.
- Fotos reducidas en el navegador y validadas por formato y tamaño.

### Validación

- 41 pruebas del backend y 13 del frontend aprobadas.
- Comprobaciones de Django, TypeScript y compilación de Next.js correctas.
- Las pruebas automatizadas no incluyen recorridos completos de navegador.

### Límites de esta versión

- Suscripciones y pagos simulados; no se procesan cobros reales.
- Los títulos reutilizan los videos y pósteres locales disponibles.
- El hosting gratuito puede introducir demoras de arranque y límites de uso.

Demo: https://django-rest-sand.vercel.app
