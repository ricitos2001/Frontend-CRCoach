# 5. Diseño del proyecto

## 5.1. Diagrama entidad-relación de la base de datos

### Modelo de datos completo

El siguiente diagrama muestra las entidades principales del sistema y sus relaciones:

```
┌─────────────────────────────────────────────────────────────────┐
│                      MODELO ENTIDAD-RELACIÓN                     │
│                        CRCoach Database                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    User     │ 1───N │  PlayerProfile   │ 1───N │    Snapshot      │
│─────────────│       │──────────────────│       │──────────────────│
│ id (PK)     │       │ id (PK)          │       │ id (PK)          │
│ email       │       │ user_id (FK)     │       │ profile_id (FK)  │
│ username    │       │ player_tag       │       │ trophies         │
│ password    │       │ name             │       │ best_trophies    │
│ role        │       │ trophies         │       │ wins             │
│ created_at  │       │ best_trophies    │       │ losses           │
│ updated_at  │       │ wins             │       │ draws            │
│ enabled     │       │ losses           │       │ battle_count     │
│             │       │ draws            │       │ timestamp        │
└─────────────┘       │ battle_count     │       └──────────────────┘
       │              │ arena            │
       │              │ clan_id (FK)     │
       │              │ created_at       │
       │              └────────┬─────────┘
       │                       │
       │              ┌────────┴─────────┐
       │              │     Clan         │
       │              │──────────────────│
       │              │ id (PK)          │
       │              │ name             │
       │              │ tag              │
       │              │ badge_id         │
       │              └──────────────────┘
       │
       │ 1
       │
       ├───────────────────────────────────────────────┐
       │                                               │
       ▼                                               ▼
┌─────────────┐                               ┌──────────────────┐
│    Goal     │                               │     Session      │
│─────────────│                               │──────────────────│
│ id (PK)     │                               │ id (PK)          │
│ user_id (FK)│                               │ user_id (FK)     │
│ title       │                               │ title            │
│ description │                               │ notes            │
│ type        │                               │ mood             │
│ target_value│                               │ start_time       │
│ current_value│                              │ end_time         │
│ deadline    │                               │ battle_count     │
│ status      │                               │ created_at       │
│ created_at  │                               └──────────────────┘
│ updated_at  │
└─────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        BATTLE SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌─────────────────────────┐  │
│  │ Battle   │ N─1 │ Battles  │ 1─N │       Deck              │  │
│  │──────────│     │──────────│     │─────────────────────────│  │
│  │ id (PK)  │     │ id (PK)  │     │ id (PK)                 │  │
│  │ type     │     │ battle_id│     │ name                    │  │
│  │ timestamp│     │ (FK)     │     │ elixir_average          │  │
│  │          │     │ deck_id  │     │ cards (JSON)            │  │
│  └──────────┘     │ (FK)     │     │ archetype               │  │
│                   │ is_team  │     └─────────────────────────┘  │
│                   │ is_win   │                                   │
│                   │ crowns   │                                   │
│                   │ trophy_chg│                                  │
│                   │ team_crowns│                                 │
│                   │ opponent   │                                 │
│                   │ (JSON)   │                                   │
│                   └──────────┘                                   │
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌─────────────────────────┐  │
│  │ GameMode │     │ Arena    │     │       Card              │  │
│  │──────────│     │──────────│     │─────────────────────────│  │
│  │ id (PK)  │     │ id (PK)  │     │ id (PK)                 │  │
│  │ name     │     │ name     │     │ name                    │  │
│  │          │     │ arena_id │     │ max_level               │  │
│  └──────────┘     │ icon_url │     │ icon_url                │  │
│                   └──────────┘     │ elixir_cost             │  │
│                                    │ rarity                  │  │
│                                    └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  WeaknessReport  │  │ ProblematicCard  │  │  ArchetypeStat │ │
│  │──────────────────│  │──────────────────│  │────────────────│ │
│  │ id (PK)          │  │ id (PK)          │  │ id (PK)        │ │
│  │ profile_id (FK)  │  │ report_id (FK)   │  │ profile_id(FK) │ │
│  │ total_battles    │  │ card_name        │  │ archetype_name │ │
│  │ generated_at     │  │ losses           │  │ battles_played │ │
│  └──────────────────┘  │ total_battles    │  │ wins           │ │
│                        │ winrate          │  │ losses         │ │
│                        └──────────────────┘  │ winrate        │ │
│                                               └────────────────┘ │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  WinRate         │  │  Metric          │  │  MostAdvanced  │ │
│  │──────────────────│  │──────────────────│  │────────────────│ │
│  │ id (PK)          │  │ id (PK)          │  │ id (PK)        │ │
│  │ profile_id (FK)  │  │ profile_id (FK)  │  │ profile_id(FK) │ │
│  │ total_battles    │  │ metric_type      │  │ card_name      │ │
│  │ total_wins       │  │ value            │  │ level          │ │
│  │ total_losses     │  │ timestamp        │  │ usage_count    │ │
│  │ winrate          │  └──────────────────┘  │ winrate        │ │
│  └──────────────────┘                        └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Descripción de tablas principales

| Entidad | Descripción | Relaciones |
|:--------|:------------|:-----------|
| **User** | Usuario registrado en la plataforma | 1:N con PlayerProfile, Goal, Session |
| **PlayerProfile** | Perfil del jugador de Clash Royale vinculado | N:1 con User, 1:N con Snapshot, Battle |
| **Battle** | Cabecera de una partida individual | 1:N con Battles (desglose por jugador) |
| **Battles** | Participación de un jugador en una batalla | N:1 con Battle, N:1 con Deck |
| **Deck** | Mazo utilizado en una batalla (7 cartas + 1 soporte) | 1:N con Battles |
| **Card** | Catálogo de cartas del juego | N:M con Deck (a través de PlayerCard) |
| **PlayerCard** | Nivel de una carta para un jugador específico | N:1 con PlayerProfile, N:1 con Card |
| **Snapshot** | Estado del perfil en un momento dado | N:1 con PlayerProfile |
| **Goal** | Objetivo de mejora del jugador | N:1 con User |
| **Session** | Sesión de juego registrada por el usuario | N:1 con User |
| **WeaknessReport** | Reporte de debilidades generado automáticamente | 1:N con ProblematicCard, N:1 con PlayerProfile |
| **ArchetypeStat** | Estadísticas por arquetipo rival | N:1 con PlayerProfile |

### Consultas complejas implementadas

**Clasificación de arquetipo por cartas del mazo rival:**
```sql
-- Lógica Java en ArchetypeClassifier.java
// Clasifica el arquetipo basándose en cartas características:
// SIEGE: X-Bow, Mortar, Princess
// BEATDOWN: Golem, Lava Hound, Giant
// CYCLE: Hog Rider, Ice Spirit, Log
// CONTROL: Pekka, Mega Knight, Mini Pekka
// BAIT: Goblin Barrel, Princess, Goblin Gang
```

**Cálculo de winrate por arquetipo:**
```java
// En AnalyticsService.java
public double calculateWinrateByArchetype(String archetype, Long profileId) {
    // Cuenta victorias y total de batallas contra ese arquetipo
}
```

## 5.2. Diagrama de casos de uso

```
┌────────────────────────────────────────────────────────────────────┐
│                        CRCoach Platform                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────┐          ┌───────────────────────────┐  │
│  │     Visitante         │          │       Usuario             │  │
│  └──────────┬───────────┘          └─────────────┬─────────────┘  │
│             │                                     │                │
│  ┌──────────┴───────────┐              ┌──────────┴───────────┐  │
│  │ • Registrarse        │              │ • Ver dashboard      │  │
│  │ • Iniciar sesión     │              │ • Gestionar perfil   │  │
│  │ • Recuperar          │              │ • Ver batallas       │  │
│  │   contraseña         │              │ • Analizar           │  │
│  └──────────────────────┘              │   debilidades        │  │
│                                        │ • CRUD objetivos     │  │
│  ┌──────────────────────┐              │ • CRUD sesiones      │  │
│  │    Sistema (actor)    │              │ • Ver evolución      │  │
│  │ ───────────────────  │              │ • Sincronizar datos  │  │
│  │ • Polling automático  │              │ • Cambiar idioma     │  │
│  │ • Evaluar objetivos   │              │ • Tema oscuro        │  │
│  │ • Clasificar          │              │ • Eliminar cuenta    │  │
│  │   arquetipos          │              └──────────────────────┘  │
│  │ • Generar snapshots   │                                        │
│  └──────────────────────┘                                         │
└────────────────────────────────────────────────────────────────────┘
```

## 5.3. Diagramas de flujo de los procesos principales

### Flujo de autenticación

```
Visitante                    Frontend                      Backend                    API Supercell
    │                           │                             │                            │
    │   Rellena formulario      │                             │                            │
    │   registro                │                             │                            │
    │──────────────────────────>│                             │                            │
    │                           │  POST /api/v1/auth/register │                            │
    │                           │────────────────────────────>│                            │
    │                           │                             │  Validar datos             │
    │                           │                             │  Hash contraseña (BCrypt)  │
    │                           │                             │  Crear usuario             │
    │                           │                             │  Generar JWT               │
    │                           │  { token, user }            │                            │
    │                           │<────────────────────────────│                            │
    │  Redirigir a dashboard    │                             │                            │
    │<──────────────────────────│                             │                            │
```

### Flujo de sincronización de batallas (polling)

```
Backend (Scheduler)            Backend (Service)            API Supercell             Base de Datos
    │                               │                            │                         │
    │  @Scheduled cada 5 min        │                            │                         │
    │──────────────────────────────>│                            │                         │
    │                               │ GET /players/{tag}         │                         │
    │                               │───────────────────────────>│                         │
    │                               │  { perfil completo }       │                         │
    │                               │<───────────────────────────│                         │
    │                               │                            │                         │
    │                               │ GET /players/{tag}/        │                         │
    │                               │    battlelog                │                         │
    │                               │───────────────────────────>│                         │
    │                               │  [últimas 25 batallas]    │                         │
    │                               │<───────────────────────────│                         │
    │                               │                            │                         │
    │                               │  Clasificar arquetipos     │                         │
    │                               │  Detectar cartas           │                         │
    │                               │  problemáticas             │                         │
    │                               │                            │                         │
    │                               │  Guardar batallas          │                         │
    │                               │───────────────────────────────────────────────────>│
    │                               │                            │                         │
    │                               │  Crear snapshot            │                         │
    │                               │───────────────────────────────────────────────────>│
    │                               │                            │                         │
    │                               │  Evaluar objetivos         │                         │
    │                               │  activos                   │                         │
    │                               │───────────────────────────────────────────────────>│
```

### Flujo de diagnóstico de debilidades

```
Usuario               Frontend                    Backend                    API Supercell
    │                     │                           │                            │
    │  Navega a            │                           │                            │
    │  "Debilidades"       │                           │                            │
    │─────────────────────>│                           │                            │
    │                      │ GET /api/v1/analytics/    │                            │
    │                      │    weaknesses/{profileId} │                            │
    │                      │──────────────────────────>│                            │
    │                      │                           │  Consultar batallas       │
    │                      │                           │  almacenadas              │
    │                      │                           │  ──────────────────────>  │
    │                      │                           │  [datos históricos]       │
    │                      │                           │<──────────────────────    │
    │                      │                           │                           │
    │                      │                           │  Agrupar por arquetipo   │
    │                      │                           │  Calcular winrates       │
    │                      │                           │  Identificar cartas      │
    │                      │                           │  problemáticas           │
    │                      │                           │                           │
    │                      │  { WeaknessReportDTO }   │                           │
    │                      │<──────────────────────────│                           │
    │  Renderizar          │                           │                           │
    │  gráficas y tabla    │                           │                           │
    │<─────────────────────│                           │                           │
```

## 5.4. Arquitectura de la aplicación

### Arquitectura general (cliente-servidor)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CRCoach ARQUITECTURA                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   🌐 Navegador Web                                                      │
│   ┌──────────────────────────────────────────┐                          │
│   │         Frontend (Angular 21 SPA)         │                          │
│   │                                          │                          │
│   │  ┌─────────┐  ┌──────────┐  ┌─────────┐ │                          │
│   │  │ Pages    │  │ Services │  │ Signal  │ │                          │
│   │  │ (16)    │  │ (17)     │  │ Stores  │ │                          │
│   │  ├─────────┤  ├──────────┤  ├─────────┤ │     HTTP/HTTPS            │
│   │  │Components│  │ Auth     │  │ Battle  │ │◄───────────────────      │
│   │  │ (16)    │  │ Battles  │  │ Goals   │ │         │                │
│   │  │         │  │ Goals    │  │ Metric  │ │         │                │
│   │  │ Guards  │  │ Sessions │  │ Session │ │         │                │
│   │  │ Routes  │  │ Users    │  │ Users   │ │         │                │
│   │  └─────────┘  └──────────┘  └─────────┘ │         │                │
│   └──────────────────────────────────────────┘         │                │
│                                                         │                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   🖥️ Servidor de Aplicaciones (Spring Boot 4.0)                        │
│   ┌─────────────────────────────────────────────────────────┐           │
│   │                Backend API REST                          │           │
│   │                                                          │           │
│   │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │           │
│   │  │ Controllers │  │  Services  │  │  Security        │   │           │
│   │  │ (26)       │  │  (28)      │  │  JWT + CORS      │   │           │
│   │  ├────────────┤  ├────────────┤  ├──────────────────┤   │           │
│   │  │ REST       │  │ Analytics  │  │  AuthController  │   │           │
│   │  │ endpoints  │  │ Battles    │  │  JwtUtil         │   │           │
│   │  │ /api/v1/   │  │ Goals      │  │  JwtFilter       │   │           │
│   │  └────────────┘  │ Sync       │  │  SecurityConfig  │   │           │
│   │                   │ Email      │  └──────────────────┘   │           │
│   │                   └────────────┘                         │           │
│   │                                                          │           │
│   │  ┌────────────┐  ┌──────────────────────────┐            │           │
│   │  │  Mappers   │  │  JPA Repositories (28)   │            │           │
│   │  └────────────┘  └───────────┬──────────────┘            │           │
│   └──────────────────────────────┼───────────────────────────┘           │
│                                  │                                       │
│   ┌──────────────────────────────┼───────────────────────────┐           │
│   │           Docker             │              PostgreSQL   │           │
│   │                              ▼                           │           │
│   │  ┌──────────────────┐  ┌──────────┐                     │           │
│   │  │  app (Spring     │  │ postgres │                     │           │
│   │  │  Boot + Java 21) │  │ (15)     │                     │           │
│   │  │  puerto: 8080    │  │ puerto:  │                     │           │
│   │  └──────────────────┘  │ 5432     │                     │           │
│   │                        └──────────┘                     │           │
│   └──────────────────────────────────────────────────────────┘           │
│                                                                          │
│                          API Supercell                                   │
│                   https://api.clashroyale.com/v1                         │
│                          │                                               │
│                   ┌──────┴──────┐                                        │
│                   │ GET /players│                                        │
│                   │ GET /battle │                                        │
│                   │   log       │                                        │
│                   │ GET /cards  │                                        │
│                   └────────────┘                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

### Arquitectura del frontend (Angular)

```
Frontend-CRCoach/
├── src/
│   ├── app/
│   │   ├── app.ts                    # Componente raíz
│   │   ├── app.config.ts             # Configuración global (providers)
│   │   ├── app.routes.ts             # Definición de rutas
│   │   │
│   │   ├── components/               # Componentes reutilizables
│   │   │   ├── layout/               # Layout principal
│   │   │   │   ├── header/           # Cabecera responsive
│   │   │   │   ├── footer/           # Pie de página
│   │   │   │   ├── main/             # Contenedor principal
│   │   │   │   └── sidebar/          # Navegación lateral
│   │   │   └── shared/               # Componentes compartidos
│   │   │       ├── common-button/    # Botón reutilizable
│   │   │       ├── form-input/       # Input con validación
│   │   │       ├── modal/            # Ventana modal
│   │   │       ├── toast/            # Notificaciones
│   │   │       ├── pagination/       # Paginación
│   │   │       ├── graph/            # Contenedor de gráficas
│   │   │       └── ...               # Más componentes
│   │   │
│   │   ├── pages/                    # Páginas (lazy-loaded)
│   │   │   ├── landing/              # Página de aterrizaje
│   │   │   ├── login/                # Inicio de sesión
│   │   │   ├── register/             # Registro
│   │   │   ├── dashboard/            # Panel principal
│   │   │   ├── battles/              # Historial de batallas
│   │   │   ├── weaknesses/           # Diagnóstico
│   │   │   ├── goals/                # Objetivos
│   │   │   ├── sessions/             # Diario
│   │   │   ├── progress/             # Evolución
│   │   │   ├── profile/              # Perfil de usuario
│   │   │   └── not-found/            # 404
│   │   │
│   │   ├── services/                 # Servicios (inyección de dependencias)
│   │   │   ├── auth.service.ts       # Autenticación
│   │   │   ├── battles.service.ts    # Batallas API
│   │   │   ├── goals.service.ts      # Objetivos API
│   │   │   ├── sessions.service.ts   # Sesiones API
│   │   │   ├── users.service.ts      # Usuarios API
│   │   │   ├── theme.service.ts      # Tema claro/oscuro
│   │   │   ├── language.service.ts   # Internacionalización
│   │   │   ├── toast.service.ts      # Notificaciones
│   │   │   └── ...
│   │   │
│   │   ├── signal_stores/            # NgRx Signal Stores
│   │   │   ├── battles.signal.store.ts
│   │   │   ├── goals.signal.store.ts
│   │   │   ├── sessions.signal.store.ts
│   │   │   ├── users.signal.store.ts
│   │   │   └── ...
│   │   │
│   │   ├── guards/                   # Route guards
│   │   │   └── auth/
│   │   │       └── auth-guard.ts     # Protege rutas privadas
│   │   │
│   │   ├── interceptors/             # HTTP interceptors
│   │   │   └── auth.interceptor.ts   # Añade JWT a peticiones
│   │   │
│   │   ├── interfaces/               # Tipos TypeScript
│   │   │   ├── Battle.ts
│   │   │   ├── Goal.ts
│   │   │   ├── User.ts
│   │   │   └── ...
│   │   │
│   │   └── validators/               # Validadores personalizados
│   │       ├── password-strength.validator.ts
│   │       └── password-match.validator.ts
│   │
│   ├── styles/                       # Arquitectura ITCSS
│   ├── assets/                       # Recursos estáticos
│   └── enviroments/                  # Configuración por entorno
```

### Arquitectura del backend (Spring Boot)

```
Backend-CRCoach/
├── src/main/java/org/example/backendcrcoach/
│   ├── BackendCrCoachApplication.java     # Punto de entrada
│   │
│   ├── config/                            # Configuración global
│   │   ├── AsyncConfig.java               # Pool de hilos para tareas async
│   │   ├── OpenApiConfig.java             # Configuración Swagger/OpenAPI
│   │   ├── WebClientConfig.java           # Cliente HTTP reactivo
│   │   └── WebClientHelper.java           # Helper con reintentos automáticos
│   │
│   ├── security/                          # Seguridad y autenticación
│   │   ├── SecurityConfig.java            # Configuración Spring Security
│   │   ├── AuthenticationSuccessListener.java  # Email al iniciar sesión
│   │   ├── controller/
│   │   │   └── AuthController.java        # /api/v1/auth/*
│   │   ├── dto/                           # DTOs de autenticación
│   │   ├── jwt/
│   │   │   ├── JwtUtil.java              # Generación/validación JWT
│   │   │   └── JwtRequestFilter.java     # Filtro de peticiones
│   │   └── user/
│   │       ├── CustomUserDetails.java
│   │       └── CustomUserDetailsService.java
│   │
│   ├── domain/                            # Capa de dominio
│   │   ├── entities/                      # Entidades JPA (30+)
│   │   ├── dto/                           # DTOs de entrada/salida
│   │   └── enums/                         # Enumeraciones (Role, GoalStatus)
│   │
│   ├── repositories/                      # Capa de persistencia (28 repos)
│   │
│   ├── mappers/                           # Mapeadores entidad ↔ DTO
│   │
│   ├── services/                          # Capa de negocio (28 servicios)
│   │   ├── AnalyticsService.java          # Motor de análisis
│   │   ├── BattleService.java             # Gestión de batallas
│   │   ├── GoalService.java               # Gestión de objetivos
│   │   ├── SessionService.java            # Diario de sesiones
│   │   ├── EmailService.java              # Envío de emails
│   │   └── ...
│   │
│   ├── analytics/                         # Motor de análisis
│   │   ├── AnalyticsController.java
│   │   ├── AnalyticsService.java
│   │   ├── ArchetypeClassifier.java       # Clasificador de arquetipos
│   │   └── dto/                           # DTOs del módulo de análisis
│   │
│   └── web/                               # Capa web (controllers REST)
│       ├── controllers/                   # 26 controladores REST
│       ├── exceptions/                    # Manejadores de excepciones
│       └── filters/
│           └── RequestRedirectFilter.java # Redirección de navegadores
```

## 5.5. Diseño de la API REST

### Base URL

```
Producción: https://backend-crcoach.onrender.com/api/v1
Local:      http://localhost:8080/api/v1
```

### Autenticación

Todas las peticiones a rutas protegidas requieren un header:
```
Authorization: Bearer <jwt_token>
```

### Endpoints públicos

| Método | Ruta | Descripción |
|:-------|:-----|:------------|
| POST | `/auth/authenticate` | Iniciar sesión |
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/password/forgot` | Solicitar recuperación de contraseña |
| POST | `/auth/password/reset` | Restablecer contraseña |
| GET | `/users/email-exists/{email}` | Verificar si el email existe |
| GET | `/users/username-exists/{username}` | Verificar si el username existe |
| GET | `/player_profiles/exists-in-api/{tag}` | Verificar si el tag existe en API Supercell |
| GET | `/player_profiles/exists-in-local/{tag}` | Verificar si el tag existe en BD local |
| GET | `/cards` | Obtener catálogo de cartas |
| GET | `/v3/api-docs` | Documentación OpenAPI |
| GET | `/swagger-ui/index.html` | Swagger UI |

### Endpoints protegidos (requieren autenticación)

#### Perfil de jugador

| Método | Ruta | Descripción |
|:-------|:-----|:------------|
| GET | `/player_profiles/{id}` | Obtener perfil por ID |
| GET | `/player_profiles/by-user/{userId}` | Obtener perfil por usuario |
| POST | `/player_profiles` | Crear perfil (vincular tag) |
| PUT | `/player_profiles/{id}` | Actualizar perfil |
| DELETE | `/player_profiles/{id}` | Eliminar perfil |

#### Batallas

| Método | Ruta | Descripción |
|:-------|:-----|:------------|
| GET | `/battles` | Listar batallas (con filtros) |
| GET | `/battles/{id}` | Obtener batalla por ID |
| GET | `/battles/by-user/{userId}` | Batallas por usuario |
| POST | `/battles/sync/{profileId}` | Forzar sincronización manual |

#### Snapshots

| Método | Ruta | Descripción |
|:-------|:-----|:------------|
| GET | `/snapshots/by-user/{userId}` | Obtener snapshots para gráfica |
| GET | `/snapshots/latest/{profileId}` | Último snapshot |

#### Objetivos

| Método | Ruta | Descripción |
|:-------|:-----|:------------|
| GET | `/goals/by-user/{userId}` | Listar objetivos del usuario |
| POST | `/goals` | Crear objetivo |
| PUT | `/goals/{id}` | Actualizar objetivo |
| DELETE | `/goals/{id}` | Eliminar objetivo |
| GET | `/goals/{id}/progress` | Evaluar progreso del objetivo |

#### Sesiones

| Método | Ruta | Descripción |
|:-------|:-----|:------------|
| GET | `/sessions/by-user/{userId}` | Listar sesiones del usuario |
| POST | `/sessions` | Crear sesión |
| PUT | `/sessions/{id}` | Actualizar sesión |
| DELETE | `/sessions/{id}` | Eliminar sesión |

#### Análisis

| Método | Ruta | Descripción |
|:-------|:-----|:------------|
| GET | `/analytics/weaknesses/{profileId}` | Reporte de debilidades |
| GET | `/analytics/winrate/{profileId}` | Winrate global |
| GET | `/analytics/archetypes/{profileId}` | Winrate por arquetipo |
| GET | `/analytics/problematic-cards/{profileId}` | Cartas problemáticas |
| GET | `/analytics/summary/{profileId}` | Resumen del jugador |

### Códigos de respuesta HTTP

| Código | Significado | Uso |
|:-------|:------------|:----|
| 200 | OK | Petición exitosa (GET, PUT) |
| 201 | Created | Recurso creado (POST) |
| 204 | No Content | Recurso eliminado (DELETE) |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token JWT ausente o inválido |
| 403 | Forbidden | Sin permisos para el recurso |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Recurso duplicado |
| 422 | Unprocessable Entity | Datos semánticamente inválidos |
| 429 | Too Many Requests | Límite de API superado |
| 500 | Internal Server Error | Error interno del servidor |

### Ejemplos de respuestas

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "email": "jugador@example.com",
  "username": "MegaJugador",
  "role": "USER",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

**Respuesta con error (400):**
```json
{
  "error": "Validation Error",
  "message": "El email no tiene un formato válido",
  "status": 400,
  "timestamp": "2026-03-16T12:00:00Z"
}
```

**Respuesta de análisis (diagnóstico de debilidades):**
```json
{
  "profileId": 1,
  "totalBattles": 150,
  "winrate": 57.3,
  "archetypeStats": [
    { "archetype": "BEATDOWN", "winrate": 30.0, "battles": 40 },
    { "archetype": "CYCLE", "winrate": 65.0, "battles": 60 },
    { "archetype": "CONTROL", "winrate": 50.0, "battles": 30 }
  ],
  "problematicCards": [
    { "cardName": "Mega Knight", "winrate": 28.0, "totalBattles": 25 },
    { "cardName": "Hog Rider", "winrate": 35.0, "totalBattles": 20 }
  ],
  "generatedAt": "2026-03-16T12:00:00Z"
}
```
