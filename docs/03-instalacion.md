# 3. Instalación y preparación del entorno

## 3.1. Requisitos previos

### Software necesario

| Herramienta | Versión mínima | Descarga |
|:------------|:---------------|:---------|
| Node.js | 24.x | [https://nodejs.org/](https://nodejs.org/) |
| npm | 11.x | Incluido con Node.js |
| Java JDK | 21 (Temurin) | [https://adoptium.net/](https://adoptium.net/) |
| Maven | 3.9.x | [https://maven.apache.org/](https://maven.apache.org/) |
| Docker | 24.x | [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/) |
| Docker Compose | 2.x | Incluido con Docker Desktop |
| Git | 2.x | [https://git-scm.com/](https://git-scm.com/) |

### Verificar instalaciones

```bash
node --version    # v24.x
npm --version     # 11.x
java --version    # 21.x (Temurin)
mvn --version     # 3.9.x
docker --version  # 24.x
docker compose version  # 2.x
git --version     # 2.x
```

### Clave de API de Clash Royale

Para que la aplicación funcione correctamente, necesitas una clave de API de Supercell:

1. Regístrate en [https://developer.clashroyale.com/](https://developer.clashroyale.com/)
2. Crea una nueva aplicación y solicita una clave de API.
3. **Importante**: Añade la IP de tu servidor a la lista blanca (whitelist) de la clave.
4. Copia la clave generada (formato JWT).

> **Nota**: Si ejecutas localmente con Docker, la IP que debes añadir es la IP pública de tu máquina o `0.0.0.0/0` si es para desarrollo.

### Cuenta de Brevo (para envío de emails)

Para la funcionalidad de recuperación de contraseña y notificaciones por email:

1. Regístrate en [https://app.brevo.com/](https://app.brevo.com/)
2. Ve a "SMTP & API" y genera una clave SMTP.
3. Copia la clave SMTP y la API key.

## 3.2. Clonar el repositorio

```bash
git clone https://github.com/ricitos2001/Backend-CRCoach.git
git clone https://github.com/ricitos2001/Frontend-CRCoach.git
```

O si prefieres clonar ambos desde un repositorio principal:

```bash
git clone https://github.com/ricitos2001/CRCoach.git
cd CRCoach
```

## 3.3. Configuración del backend (Spring Boot)

### 3.3.1. Variables de entorno

Crea un archivo `.env` en la raíz de `Backend-CRCoach/` con el siguiente contenido:

```bash
# ─────────────────────────────────────────────────────
# Backend-CRCoach - Variables de Entorno
# ─────────────────────────────────────────────────────

# --- Base de datos (PostgreSQL) ---
# Para desarrollo local con Docker:
PGHOST=localhost
PGPORT=5432
PGDATABASE=crcoach_db
PGUSER=crcoach_user
PGPASSWORD=crcoach_pass

# Para producción con Neon (comentar las locales):
# PGHOST=ep-tu-proyecto-pooler.c-X.eu-central-1.aws.neon.tech
# PGPORT=5432
# PGDATABASE=CRCoach_DB
# PGUSER=neondb_owner
# PGPASSWORD=tu_password_neon

# --- Servidor ---
PORT=8080
NODE_ENV=development

# --- Email (Brevo SMTP) ---
SPRING_HOST=smtp-relay.brevo.com
SPRING_MAIL_USERNAME=tu_usuario_brevo
SPRING_MAIL_PASSWORD=tu_clave_smtp_brevo
BREVO_API_KEY=tu_api_key_brevo
BREVO_SENDER_EMAIL=tu_email@dominio.com
BREVO_SENDER_NAME=CRCoach

# --- Clash Royale API ---
CLASH_ROYALE_API_KEY=tu_clave_api_supercell
CLASH_ROYALE_API_URL=https://api.clashroyale.com/v1

# --- Frontend URL (para CORS) ---
# Desarrollo local:
APP_FRONTEND_BASE_URL=http://localhost:4200

# Producción:
# APP_FRONTEND_BASE_URL=https://frontend-crcoach.onrender.com
```

### 3.3.2. Ejecución con Maven (desarrollo)

```bash
cd Backend-CRCoach

# Compilar el proyecto
./mvnw clean compile

# Ejecutar tests
./mvnw test

# Ejecutar la aplicación
./mvnw spring-boot:run
```

La aplicación arrancará en `http://localhost:8080`.

### 3.3.3. Ejecución con Docker (recomendado)

```bash
cd Backend-CRCoach

# Construir y arrancar todos los servicios
docker compose up -d

# Verificar que los servicios están funcionando
docker compose ps

# Ver logs
docker compose logs -f app
docker compose logs -f postgres

# Detener los servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v
```

### 3.3.4. Verificar que el backend funciona

```bash
# Health check básico
curl http://localhost:8080/

# Swagger UI
# Abrir en navegador: http://localhost:8080/swagger-ui/index.html

# Verificar que la base de datos responde
docker compose exec postgres pg_isready -U crcoach_user -d crcoach_db

# Probar un endpoint público
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## 3.4. Configuración del frontend (Angular)

### 3.4.1. Variables de entorno

El frontend tiene un archivo de entorno en `src/enviroments/enviroment.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: '/api',
};
```

> El valor `apiUrl: '/api'` se usa tanto en desarrollo como en producción. En producción, Nginx recibe las peticiones en `/api/` y las redirige al backend mediante proxy inverso. En desarrollo, Angular CLI usa un proxy para hacer lo mismo.

### 3.4.2. Proxy de desarrollo

Para que las peticiones al backend funcionen en local, Angular CLI utiliza un proxy configurado en `proxy.conf.json`:

```json
{
  "/api/**": {
    "target": "http://localhost:8080",
    "secure": false,
    "logLevel": "debug",
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

**Cómo funciona:**

1. El frontend hace peticiones a `/api/api/v1/...` (el `apiUrl` es `/api` y los servicios concatenan `/api/v1/...`).
2. El proxy de Angular intercepta cualquier ruta que empiece por `/api/`.
3. La opción `pathRewrite` elimina el primer `/api` de la ruta, quedando `/api/v1/...`.
4. La petición se reenvía a `http://localhost:8080/api/v1/...` (el backend).

El proxy solo se activa en la configuración `development` de `angular.json`, por lo que no interfiere en builds de producción.

### 3.4.3. Ejecución con Angular CLI (desarrollo)

```bash
cd Frontend-CRCoach

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start
# o
ng serve
```

La aplicación arrancará en `http://localhost:4200`.

> Asegúrate de tener el backend corriendo en `http://localhost:8080` antes de iniciar el frontend.

### 3.4.3. Ejecución con Docker (recomendado)

```bash
cd Frontend-CRCoach

# Construir y arrancar el servicio de producción
docker compose up -d Frontend-CRCoach

# O para desarrollo con hot-reload:
docker compose --profile dev up -d dev

# Verificar
docker compose ps

# Ver logs
docker compose logs -f Frontend-CRCoach

# Detener
docker compose down
```

### 3.4.4. Construir para producción

```bash
cd Frontend-CRCoach

# Construir la aplicación
npm run build
# o
ng build

# El output se genera en dist/Frontend-CRCoach/browser/
```

## 3.5. Configuración de Docker Compose completa

### Backend (`docker-compose.yml`)

```yaml
version: "3.9"

services:
  postgres:
    env_file:
      - .env
    container_name: crcoach-postgres
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${PGDATABASE}
      POSTGRES_USER: ${PGUSER}
      POSTGRES_PASSWORD: ${PGPASSWORD}
    ports:
      - "${PGPORT}:5432"
    volumes:
      - crcoach_db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PGUSER} -d ${PGDATABASE}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    env_file:
      - .env
    build:
      context: .
      dockerfile: Dockerfile
    image: ricitosdeoro2001/backend-crcoach:latest
    restart: unless-stopped
    ports:
      - "${PORT}:8080"
    environment:
      SPRING_DATASOURCE_URL: "jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require"
      SPRING_DATASOURCE_USERNAME: ${PGUSER}
      SPRING_DATASOURCE_PASSWORD: ${PGPASSWORD}
      SPRING_JPA_HIBERNATE_DDL_AUTO: "update"
      SERVER_PORT: 8080
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads

volumes:
  crcoach_db_data: {}
```

### Frontend (`docker-compose.yml`)

```yaml
version: "3.8"

services:
  Frontend-CRCoach:
    container_name: frontend-crcoach
    build:
      context: .
      dockerfile: Dockerfile
    image: ricitosdeoro2001/frontend-crcoach:latest
    ports:
      - "80:80"
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/index.html"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - crcoach_net

  dev:
    image: node:24-alpine
    profiles: ["dev"]
    working_dir: /app
    command: sh -c "npm ci && npm run start -- --host 0.0.0.0"
    ports:
      - "4200:4200"
    environment:
      - CHOKIDAR_USEPOLLING=true
    volumes:
      - ./:/app:cached
      - crcoach_node_modules:/app/node_modules
    networks:
      - crcoach_net

volumes:
  crcoach_node_modules:
    driver: local

networks:
  crcoach_net:
    driver: bridge
```

## 3.6. Verificación de la instalación completa

### Paso 1: Arrancar el backend

```bash
cd Backend-CRCoach
docker compose up -d
```

Salida esperada:
```
[+] Running 3/3
 ✔ Network backend-crcoach_default     Created
 ✔ Volume "backend-crcoach_crcoach_db_data"  Created
 ✔ Container crcoach-postgres          Started
 ✔ Container backend-crcoach-app-1     Started
```

### Paso 2: Verificar el backend

```bash
docker compose ps
```

Salida esperada:
```
NAME                IMAGE                                    COMMAND                  SERVICE    CREATED          STATUS                    PORTS
backend-crcoach-app-1  ricitosdeoro2001/backend-crcoach:latest  "java -Xms256m -Xmx5…"   app        10 seconds ago   Up 9 seconds              0.0.0.0:8080->8080/tcp
crcoach-postgres     postgres:15-alpine                      "docker-entrypoint.s…"   postgres   10 seconds ago   Up 10 seconds (healthy)   0.0.0.0:5432->5432/tcp
```

### Paso 3: Verificar logs del backend

```bash
docker compose logs app
```

Salida esperada:
```
app-1  | 2026-03-16T10:30:00.123Z  INFO 1 --- [           main] o.e.b.BackendCrCoachApplication         : Started BackendCrCoachApplication in 12.345 seconds
app-1  | 2026-03-16T10:30:00.456Z  INFO 1 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080
```

### Paso 4: Arrancar el frontend

```bash
cd Frontend-CRCoach
docker compose up -d Frontend-CRCoach
```

Salida esperada:
```
[+] Running 2/2
 ✔ Network frontend-crcoach_crcoach_net  Created
 ✔ Container frontend-crcoach           Started
```

### Paso 5: Verificar el frontend

```bash
docker compose ps
```

Salida esperada:
```
NAME                IMAGE                                    COMMAND                  SERVICE             CREATED          STATUS                    PORTS
frontend-crcoach    ricitosdeoro2001/frontend-crcoach:latest  "/docker-entrypoint.…"   Frontend-CRCoach    5 seconds ago    Up 4 seconds (healthy)    0.0.0.0:80->80/tcp
```

### Paso 6: Acceder a la aplicación

- **Frontend**: [http://localhost](http://localhost) (puerto 80)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

## 3.7. Solución de problemas comunes

### Error: `port is already allocated`

```bash
# El puerto 80 o 8080 ya está en uso. Detén el servicio que lo ocupa:
sudo lsof -i :80
sudo lsof -i :8080

# O cambia los puertos en docker-compose.yml
```

### Error: `Cannot connect to the Docker daemon`

```bash
# Asegúrate de que Docker está en ejecución:
sudo systemctl start docker
# O en macOS/Windows: abre Docker Desktop
```

### Error: `PostgreSQL connection refused`

```bash
# Verifica que PostgreSQL está funcionando:
docker compose logs postgres

# Si no arranca, comprueba las variables de entorno en .env
# Asegúrate de que PGHOST apunta a "localhost" para desarrollo local
```

### Error: `Clash Royale API returns 403`

```bash
# La IP de tu servidor no está en la whitelist de la API key.
# Accede a https://developer.clashroyale.com/ y añade tu IP.
# Para desarrollo local, puedes usar 0.0.0.0/0 (no recomendado en producción).
```

### Error: `npm ERR!` durante la instalación

```bash
# Limpia la caché y reinstala:
cd Frontend-CRCoach
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Error: `Maven build fails`

```bash
# Limpia y reconstruye:
cd Backend-CRCoach
./mvnw clean
./mvnw compile -U  # -U fuerza actualización de dependencias
```
