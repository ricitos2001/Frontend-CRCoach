Guía de despliegue (Frontend)

Este documento explica cómo construir y desplegar el frontend de CRCoach (Angular) tanto en desarrollo como en producción usando Docker.

Requisitos
- Node.js 24 (solo para desarrollo si trabajas con `ng serve`)
- Docker y Docker Compose (para despliegue con la imagen nginx)

Desarrollo local (opcional)
1. Instala dependencias e inicia el servidor de desarrollo:

```bash
cd Frontend-CRCoach
npm ci
npm run start
# Abrir http://localhost:4200
```

Construcción de producción
1. Generar el bundle de producción:

```bash
cd Frontend-CRCoach
npm ci
npm run build
```

2. El resultado se encuentra en `dist/Frontend-CRCoach/browser/` (según Dockerfile). El Dockerfile del proyecto ya copia esta carpeta y usa Nginx para servir la SPA.

Despliegue con Docker (imagen preparada)
1. Construir la imagen localmente:

```bash
docker build --file Frontend-CRCoach/Dockerfile -t frontend-crcoach:latest Frontend-CRCoach
```

2. Ejecutar la imagen:

```bash
docker run --rm -p 80:80 frontend-crcoach:latest
# Abrir http://localhost
```

Despliegue integrado (recomendado)
Usar el docker-compose unificado en la raíz para levantar frontend + backend + db:

```bash
# Desde la raíz del repo
docker compose up --build -d
```

Verificación
- `curl -I http://localhost/` debe devolver 200
- `curl -I http://localhost/api/actuator/health` debe devolver 200 si el backend expone actuator y el proxy está correctamente configurado

Notas y recomendaciones
- El `nginx.conf` del frontend incluye un bloque `location /api/` para enrutar peticiones al backend (host `app` en Docker). Asegúrate de levantar los servicios en la misma red de Docker.
- Para producción usar HTTPS (Let's Encrypt/Traefik) y no exponer el backend directamente al exterior.

