# Frontend CRCoach

[![Angular](https://img.shields.io/badge/Angular-21.2-red?logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Angular Material](https://img.shields.io/badge/Material-21.2-7B1FA2?logo=angular)](https://material.angular.io/)
[![SCSS](https://img.shields.io/badge/SCSS-ITCSS+BEM-hotpink?logo=sass)](https://sass-lang.com/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Multi%20Stage-2496ED?logo=docker)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Frontend SPA de **CRCoach**, plataforma de análisis y coaching para Clash Royale. Construido con Angular 21, standalone components, Angular Material y una arquitectura de estilos ITCSS + BEM.

---

## Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Prerrequisitos](#prerrequisitos)
- [Instalación y Ejecución](#instalación-y-ejecución)
  - [Desarrollo local](#desarrollo-local)
  - [Con Docker](#con-docker)
- [Scripts Disponibles](#scripts-disponibles)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura de Estilos (ITCSS)](#estructura-de-estilos-itcss)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Características

- **Dashboard interactivo** — Visualización de estadísticas, gráficos y métricas de rendimiento con Chart.js.
- **Análisis de partidas** — Registro de batallas con clasificación automática de arquetipos.
- **Gestión de objetivos** — Creación y seguimiento de metas personalizadas.
- **Sesiones de juego** — Organización de sesiones con snapshots de progreso.
- **Debilidades y cartas problemáticas** — Identificación de puntos débiles con reportes visuales.
- **Autenticación JWT** — Login, registro y recuperación de contraseña.
- **Internacionalización (i18n)** — Soporte multi-idioma (español/inglés) con `@ngx-translate`.
- **Tema oscuro/claro** — Alternancia dinámica con persistencia en `localStorage`.
- **Responsive design** — Layout adaptable a móvil, tablet y escritorio.
- **Animaciones** — Transiciones fluidas con GSAP y Lenis smooth scroll.

---

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Angular | ^21.2.0 | Framework SPA (standalone components) |
| TypeScript | ~5.9.2 | Lenguaje principal |
| Angular Material | ^21.2.7 | Sistema de diseño UI |
| Angular CDK | ^21.2.7 | Componentes CDK |
| SCSS | — | Preprocesador CSS |
| RxJS | ~7.8.0 | Programación reactiva |
| Chart.js | ^4.5.1 | Visualización de gráficos |
| ng2-charts | ^10.0.0 | Wrapper Angular para Chart.js |
| GSAP | ^3.14.2 | Animaciones de alto rendimiento |
| Lenis | ^1.3.21 | Smooth scroll |
| Swiper | ^12.1.3 | Carruseles táctiles |
| ngx-translate/core | ^17.0.0 | Internacionalización |
| ngx-translate/http-loader | ^17.0.0 | Carga de traducciones vía HTTP |
| libphonenumber-js | ^1.12.41 | Validación de teléfonos |
| Vitest | ^4.0.8 | Test runner unitario |
| Prettier | ^3.8.1 | Formateo de código |

---

## Estructura del Proyecto

```
Frontend-CRCoach/
├── docs/                            # Documentación MkDocs
│   ├── 01-introduccion.md
│   ├── 02-descripcion.md
│   ├── 03-instalacion.md
│   ├── 04-guia-estilos.md
│   ├── 05-diseno.md
│   ├── 06-desarrollo.md
│   ├── 07-pruebas.md
│   ├── 08-despliegue.md
│   ├── 09-manual-usuario.md
│   ├── 10-conclusiones.md
│   ├── index.md
│   └── assets/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── app.config.ts            # Configuración de providers
│   │   ├── app.routes.ts            # Definición de rutas
│   │   ├── app.ts / app.html / app.css  # Componente raíz
│   │   ├── components/
│   │   │   ├── layout/              # header, footer, sidebar, main
│   │   │   └── shared/              # advanced-search, common-button, dark-mode-button,
│   │   │                              edit-user, form-input, goal-form, graph,
│   │   │                              language-selector, modal, pagination,
│   │   │                              refresh-button, searcher, session-form, toast
│   │   ├── guards/
│   │   │   └── auth/                # auth-guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts  # Inyecta JWT en cada petición HTTP
│   │   ├── interfaces/              # 30 modelos TypeScript (User, Battle, Deck, etc.)
│   │   ├── pages/                   # 16 páginas standalone
│   │   │   ├── battles/
│   │   │   ├── cookies/
│   │   │   ├── dashboard/
│   │   │   ├── goals/
│   │   │   ├── landing/
│   │   │   ├── login/
│   │   │   ├── not-found/
│   │   │   ├── notice/
│   │   │   ├── privacy/
│   │   │   ├── profile/
│   │   │   ├── progress/
│   │   │   ├── recover-password/
│   │   │   ├── register/
│   │   │   ├── sessions/
│   │   │   ├── terms/
│   │   │   └── weaknesses/
│   │   ├── services/                # 18 servicios HTTP
│   │   │   ├── analytics/
│   │   │   ├── async-validators/
│   │   │   ├── auth/
│   │   │   ├── battles/
│   │   │   ├── goals/
│   │   │   ├── header-content/
│   │   │   ├── language/
│   │   │   ├── loading/
│   │   │   ├── metrics/
│   │   │   ├── notifications/
│   │   │   ├── password-reset/
│   │   │   ├── player-profiles/
│   │   │   ├── sessions/
│   │   │   ├── snapshots/
│   │   │   ├── theme/
│   │   │   ├── toast/
│   │   │   └── users/
│   │   ├── signal_stores/           # 8 Signal Stores (estado reactivo)
│   │   │   ├── analytics.signal.store.ts
│   │   │   ├── battles.signal.store.ts
│   │   │   ├── goals.signal.store.ts
│   │   │   ├── metrics.signal.store.ts
│   │   │   ├── player-profile.signal.store.ts
│   │   │   ├── sessions.signal.store.ts
│   │   │   ├── snapshots.signal.store.ts
│   │   │   └── users.signal.store.ts
│   │   └── validators/              # password-match, password-strength
│   ├── assets/
│   │   ├── fonts/                   # Clash Display (Bold, Regular)
│   │   ├── i18n/                    # en.json, es.json
│   │   └── img/                     # flags/, icons/, wallpaper.jpg
│   ├── environments/
│   │   └── environment.ts           # apiUrl de backend
│   ├── styles/
│   │   ├── 00-settings/             # _variables.scss, _fonts.scss, _css-variables.scss
│   │   ├── 01-tools/                # _mixins.scss
│   │   ├── 02-generic/              # _reset.scss
│   │   ├── 03-elements/             # _base.scss
│   │   ├── 04-layout/               # _header.scss, _footer.scss, _main.scss, _sidebar.scss
│   │   ├── 05-components/           # common-button, form-input, graph, modal, toast, etc.
│   │   ├── 06-utilities/            # _responsive.scss
│   │   ├── 07-pages/                # battles, dashboard, goals, landing, weaknesses, etc.
│   │   ├── styles.scss              # Entry point SCSS
│   │   └── styles.css               # Compilado
│   ├── index.html
│   ├── main.ts
│   ├── material-theme.scss
│   ├── robots.txt
│   ├── sitemap.xml
│   └── sitemap.xsd
├── angular.json                     # Configuración Angular CLI
├── angular.json.bak                 # Backup
├── docker-compose.yml               # Producción (nginx) + Desarrollo (node)
├── Dockerfile                       # Multi-stage build (node → nginx)
├── mkdocs.yml                       # Configuración MkDocs
├── nginx.conf                       # Servidor SPA con caché inteligente
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── .editorconfig
├── .env
├── .gitignore
├── .prettierrc
├── LICENSE                          # MIT
├── qodana.yaml
├── README.md                        # Este archivo
└── SECURITY.md
```

---

## Prerrequisitos

| Herramienta | Versión mínima |
|------------|---------------|
| Node.js | 22.x |
| npm | 11.x |
| Angular CLI | 21.x |
| Docker | 24+ (opcional) |
| Docker Compose | 2.20+ (opcional) |

---

## Instalación y Ejecución

### Desarrollo local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/CRCoach.git
cd CRCoach/Frontend-CRCoach

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
ng serve
```

La aplicación estará disponible en `http://localhost:4200`. Hot-reload activo.

### Con Docker

```bash
# Producción con Nginx
docker compose up -d

# Desarrollo con hot-reload
docker compose --profile dev up -d
```

Acceder a `http://localhost` (producción) o `http://localhost:4200` (desarrollo).

---

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `ng serve` | Inicia servidor de desarrollo en `:4200` |
| `npm start` | Alias de `ng serve` |
| `ng build` | Compila a producción en `dist/` |
| `npm run build` | Alias de `ng build` |
| `ng test` | Ejecuta tests unitarios con Vitest |
| `ng generate component X` | Scaffolding de componentes |
| `npm run watch` | Build en modo watch (development) |

---

## Variables de Entorno

Archivo `.env` en la raíz del frontend:

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `PORT` | Puerto del servidor web (producción) | `80` |

La URL de la API se configura en `src/environments/environment.ts`:

```typescript
export const environment = {
  apiUrl: 'https://backend-crcoach.onrender.com',
};
```

---

## Estructura de Estilos (ITCSS + BEM)

Los estilos siguen la arquitectura **ITCSS** (Inverted Triangle CSS) con metodología **BEM**:

| Carpeta | Capa ITCSS | Contenido |
|---------|-----------|-----------|
| `00-settings/` | Settings | Variables, fuentes, tokens de diseño |
| `01-tools/` | Tools | Mixins y funciones SCSS |
| `02-generic/` | Generic | Reset, normalize |
| `03-elements/` | Elements | Estilos base de elementos HTML |
| `04-layout/` | Layout | Header, footer, sidebar, main |
| `05-components/` | Components | Botones, inputs, modales, gráficos |
| `06-utilities/` | Utilities | Helpers responsive |
| `07-pages/` | — | Estilos específicos por página |

El archivo de entrada `styles.scss` importa todas las capas en orden ITCSS usando `@use`.

---

## Despliegue

### Build de producción

```bash
ng build --configuration production
```

El resultado se genera en `dist/Frontend-CRCoach/browser/`.

### Docker

```bash
# Construir imagen
docker build -t frontend-crcoach .

# Ejecutar
docker run -p 80:80 frontend-crcoach
```

### Imagen publicada

```bash
docker pull ricitosdeoro2001/frontend-crcoach:latest
```

El `nginx.conf` incluye:
- Compresión gzip
- Caché estratégica (HTML no cachea, JS/CSS 1 año, imágenes 6 meses)
- SPA fallback a `index.html`
- Cabeceras CORS para fuentes

---

## Contribución

Las contribuciones son bienvenidas. Sigue estos pasos:

1. **Fork** el repositorio.
2. **Crea una rama**:
   ```bash
   git checkout -b feat/mi-nueva-funcionalidad
   ```
3. **Realiza cambios** con commits descriptivos:
   ```bash
   git commit -m "feat: añadir nueva funcionalidad X"
   ```
4. **Tests**:
   ```bash
   ng test
   ```
5. **Push**:
   ```bash
   git push origin feat/mi-nueva-funcionalidad
   ```
6. Abre un **Pull Request**.

### Convenciones de código

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Componentes:** Standalone, sin NgModules
- **Estado:** Signal Stores para estado global
- **Estilos:** metodología BEM dentro de capas ITCSS
- **Formateo:** Prettier (`npx prettier --write .`)

---

## Licencia

Distribuido bajo licencia MIT. Ver [LICENSE](LICENSE).
