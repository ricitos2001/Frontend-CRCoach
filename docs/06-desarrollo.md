# 6. Desarrollo del proyecto

## 6.1. Secuencia de desarrollo seguida

El desarrollo se organizó siguiendo la metodología SCRUM simplificada con sprints de 2 semanas, priorizando siempre las funcionalidades del MVP antes que las opcionales.

### Fase 1: Diseño y planificación (Semanas 1-2)

| Semana | Tareas realizadas |
|:-------|:------------------|
| S1 | Diseño del modelo de datos (diagrama E-R). Configuración del repositorio GitHub. Estructura inicial de proyectos (Angular + Spring Boot). |
| S2 | Diseño de mockups en Figma. Configuración de GitHub Projects con backlog inicial. Instalación y configuración de herramientas (Docker, dependencias). |

**Entregables:**
- Diagrama E-R validado.
- Mockups de todas las vistas principales.
- Repositorio con estructura de proyecto.
- Tablero GitHub Projects configurado.

### Fase 2: Desarrollo del backend (Semanas 3-7)

| Semana | Tareas realizadas |
|:-------|:------------------|
| S3 | Creación de entidades JPA. Configuración de la conexión a PostgreSQL. Implementación del modelo de datos completo (30+ entidades). |
| S4 | Implementación del sistema de autenticación: Spring Security, JWT, registro, login, cierre de sesión. Configuración de CORS. |
| S5 | Integración con API de Supercell: WebClient, cliente HTTP con reintentos. CRUD de usuario y vinculación de Player Tag. |
| S6 | Polling automático con `@Scheduled`. Procesamiento y clasificación de batallas. Algoritmo de clasificación de arquetipos. |
| S7 | Sistema de objetivos (CRUD + evaluación automática). Diario de sesiones. Snapshots y evolución temporal. Documentación Swagger. |

**Entregables:**
- API REST completa con 26 controladores.
- Sistema de autenticación JWT funcional.
- Polling automático cada 5 minutos.
- Documentación OpenAPI generada automáticamente.

### Fase 3: Desarrollo del frontend (Semanas 8-12)

| Semana | Tareas realizadas |
|:-------|:------------------|
| S8 | Estructura del proyecto Angular con lazy loading. Implementación de layout (header, footer, sidebar, main). Configuración de estilos ITCSS. |
| S9 | Sistema de autenticación en frontend (login, registro, guards, interceptor). Landing page. Dashboard principal. |
| S10 | Historial de batallas con filtros y paginación. Diagnóstico de debilidades con gráficas Chart.js. |
| S11 | Sistema de objetivos (CRUD visual con barra de progreso). Diario de sesiones con timeline. |
| S12 | Gráfica de evolución (snapshots). Panel de usuario. Tema oscuro. Internacionalización (es/en). Pulido de estilos. |

**Entregables:**
- 16 páginas funcionales con lazy loading.
- Dashboard interactivo con indicadores en tiempo real.
- Diagnóstico de debilidades con gráficas.
- Sistema de objetivos y diario de sesiones.
- Internacionalización completo (español e inglés).

### Fase 4: Testing y despliegue (Semanas 13-14)

| Semana | Tareas realizadas |
|:-------|:------------------|
| S13 | Pruebas funcionales manuales de todos los flujos. Corrección de bugs. Tests unitarios con Vitest. |
| S14 | Configuración de Docker y Docker Compose. Despliegue en producción (Render, Neon, Vercel). Testing en producción. |

**Entregables:**
- Aplicación completamente dockerizada.
- Frontend desplegado en Render/Vercel.
- Backend desplegado en Render.
- Base de datos en Neon.

### Fase 5: Documentación y entrega (Semanas 15-16)

| Semana | Tareas realizadas |
|:-------|:------------------|
| S15 | Documentación completa del proyecto. Manual de usuario. |
| S16 | Preparación de la defensa. Presentación y demo. |

## 6.2. Dificultades encontradas y cómo se superaron

### D1: Límite de 25 batallas de la API de Supercell

**Problema:**
La API oficial de Clash Royale solo devuelve las últimas 25 batallas del jugador. Esto significa que si no se almacenan periódicamente, los datos históricos se pierden para siempre.

**Solución:**
Se implementó un sistema de **polling automático** con `@Scheduled` que cada 5 minutos consulta la API y persiste los datos en la base de datos local. Esto permite acumular un historial ilimitado.

```java
// Backend-CRCoach/src/main/java/org/example/backendcrcoach/config/AsyncConfig.java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("Async-");
        executor.initialize();
        return executor;
    }
}
```

```properties
# Configuración de polling
scheduling.global.fixedDelayMs=300000  # 5 minutos
scheduling.global.initialDelayMs=10000  # 10 segundos de retardo inicial
```

### D2: Rate limiting de la API de Supercell

**Problema:**
La API de Supercell tiene límites de peticiones por IP. Si se superan, devuelve error 429 (Too Many Requests).

**Solución:**
Se implementó un sistema de **reintentos con backoff exponencial** y jitter en el cliente HTTP:

```java
// Backend-CRCoach/src/main/java/org/example/backendcrcoach/config/WebClientHelper.java
public <T> Mono<T> doGet(String url, Class<T> responseType) {
    return webClient.get()
        .uri(url)
        .header("Authorization", "Bearer " + apiKey)
        .retrieve()
        .onStatus(
            status -> status == HttpStatus.TOO_MANY_REQUESTS,
            response -> Mono.error(new RuntimeException("Rate limited"))
        )
        .bodyToMono(responseType)
        .retryWhen(Retry.backoff(3, Duration.ofSeconds(5))
            .jitter(0.5)
            .maxBackoff(Duration.ofSeconds(30)));
}
```

Además, se implementó una **caché en memoria** para reducir las llamadas a la API cuando los datos no han cambiado.

### D3: Clasificación precisa de arquetipos de mazos

**Problema:**
Clasificar automáticamente el arquetipo del mazo rival (Beatdown, Control, Cycle, Siege, etc.) basándose solo en las cartas es complejo. No existe una API que proporcione esta información.

**Solución:**
Se desarrolló un **clasificador de arquetipos** basado en reglas que analiza:

1. **Cartas características** del mazo (presencia de cartas definitorias como Golem, X-Bow, Hog Rider).
2. **Coste de elixir medio**: Los mazos Beatdown suelen tener coste alto (>4.0), mientras que los Cycle son bajos (<3.0).
3. **Combinaciones conocidas**: Detección de sinergias clásicas (LavaLoon, LumberLoon, etc.).

```java
// Backend-CRCoach/src/main/java/org/example/backendcrcoach/analytics/ArchetypeClassifier.java
public Archetype classify(List<String> cardNames, double elixirAverage) {
    // 1. Detectar arquetipos por carta clave
    if (hasSignatureCard(cardNames, "X-Bow", "Mortar")) return Archetype.SIEGE;
    if (hasSignatureCard(cardNames, "Golem", "Lava Hound")) return Archetype.BEATDOWN;
    if (hasSignatureCard(cardNames, "Mega Knight", "P.E.K.K.A")) return Archetype.CONTROL;
    if (hasSignatureCard(cardNames, "Hog Rider") && elixirAverage < 3.5) return Archetype.CYCLE;
    if (hasSignatureCard(cardNames, "Goblin Barrel", "Princess")) return Archetype.LOGBAIT;
    
    // 2. Fallback por coste de elixir
    if (elixirAverage > 4.0) return Archetype.BEATDOWN;
    if (elixirAverage < 3.0) return Archetype.CYCLE;
    
    return Archetype.UNKNOWN;
}
```

### D4: Token JWT regenerado en cada reinicio del servidor

**Problema:**
El `JwtUtil` generaba una clave secreta aleatoria en cada inicio de la aplicación (`Keys.secretKeyFor(SignatureAlgorithm.HS256)`), lo que invalidaba todos los tokens existentes al reiniciar el servidor.

**Solución:**
Se documentó esta limitación como una decisión de diseño (no almacenar secretos en el código) y se configuró la posibilidad de inyectar una clave fija mediante variable de entorno para producción:

```java
// Si se define JWT_SECRET en entorno, se usa esa clave; si no, se genera una aleatoria
```

Para producción en Render (que puede reiniciar la aplicación), se recomienda configurar `JWT_SECRET` como variable de entorno para mantener la sesión de los usuarios.

### D5: CORS y peticiones entre dominios

**Problema:**
El frontend y el backend están desplegados en dominios diferentes (Render, Vercel), lo que requiere configuración CORS adecuada.

**Solución:**
Se configuró CORS en Spring Security para permitir los orígenes específicos:

```java
// SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:4200",
        "http://localhost:5173",
        "https://frontend-crcoach.onrender.com"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    // ...
}
```

### D6: Gestión del estado global en el frontend

**Problema:**
Múltiples componentes necesitan acceder y modificar los mismos datos (ej: lista de batallas, perfil del usuario). Sin una gestión centralizada, los datos se vuelven inconsistentes.

**Solución:**
Se implementaron **NgRx Signal Stores** para cada dominio de la aplicación:

```typescript
// battles.signal.store.ts
export const BattlesStore = signalStore(
  { providedIn: 'root' },
  withState({ battles: [], loading: false, error: null }),
  withComputed(({ battles }) => ({
    totalCount: computed(() => battles().length),
    winrate: computed(() => {
      const wins = battles().filter(b => b.isWin).length;
      return battles().length > 0 ? (wins / battles().length) * 100 : 0;
    })
  })),
  withMethods((store, battlesService = inject(BattlesService)) => ({
    async loadBattles(userId: number) {
      patchState(store, { loading: true });
      const battles = await battlesService.getByUser(userId);
      patchState(store, { battles, loading: false });
    }
  }))
);
```

## 6.3. Decisiones técnicas clave y su justificación

### D3.1: Angular standalone vs. NgModules

**Decisión:** Usar componentes standalone en lugar del enfoque tradicional con NgModules.

**Justificación:**
- Angular 21+ recomienda el enfoque standalone como predeterminado.
- Elimina la necesidad de módulos intermedios.
- Simplifica el lazy loading.
- Mejora el tree-shaking y el rendimiento.
- El proyecto se genera con `ng new --standalone`.

### D3.2: Signal Stores vs. NgRx tradicional

**Decisión:** Usar Signal Stores (NgRx Signals) en lugar del NgRx tradicional (Store + Effects + Reducers).

**Justificación:**
- Menos boilerplate que NgRx tradicional.
- Integración nativa con Angular Signals para detección de cambios eficiente.
- Suficiente para el alcance del proyecto (no necesita efectos complejos).
- Más fácil de entender para un desarrollador que aprende el framework.

### D3.3: WebClient vs. RestTemplate

**Decisión:** Usar WebClient (reactivo) en lugar de RestTemplate (bloqueante).

**Justificación:**
- WebClient es la alternativa recomendada a partir de Spring Boot 3.x (RestTemplate está en modo mantenimiento).
- Mejor rendimiento con operaciones I/O-bound (llamadas a API externa).
- Soporte nativo para reintentos y backoff.
- Programación reactiva con Mono/Flux.

### D3.4: PostgreSQL vs. MongoDB

**Decisión:** Usar PostgreSQL (relacional) en lugar de MongoDB (NoSQL).

**Justificación:**
- El modelo de datos tiene relaciones claras y bien definidas (Usuario -> Perfil -> Batallas).
- Necesidad de consultas complejas (winrate por arquetipo, cartas problemáticas).
- Integridad referencial mediante claves foráneas.
- El stack JPA/Hibernate está optimizado para bases de datos relacionales.

### D3.5: ITCSS + BEM vs. CSS Modules vs. Tailwind

**Decisión:** Usar ITCSS + BEM con SCSS.

**Justificación:**
- Es el enfoque exigido por el módulo DIW.
- Proporciona una arquitectura escalable para proyectos grandes.
- SCSS permite variables, mixins y funciones.
- BEM proporciona una nomenclatura predecible y evita colisiones.
- Separación clara entre capas (settings, tools, generic, elements, layout, components, pages).

### D3.6: Docker multi-etapa para el frontend

**Decisión:** Usar Dockerfile multi-etapa (build con Node 24 + producción con Nginx).

**Justificación:**
- Reduce el tamaño de la imagen final (~20MB vs ~500MB con Node).
- Nginx es un servidor web mucho más eficiente que el servidor de desarrollo de Angular.
- Permite configurar cabeceras de caché, compresión gzip y SPA fallback.
- Separación clara entre compilación y ejecución.

### D3.7: Autenticación JWT sin estado

**Decisión:** Usar JWT sin estado en lugar de sesiones con estado.

**Justificación:**
- Escalabilidad horizontal (cualquier instancia puede verificar el token sin compartir sesión).
- Sin necesidad de Redis o base de datos de sesiones.
- El token contiene la información del usuario (email, rol, ID).
- Stateless sessions en Spring Security.

## 6.4. Herramientas de control de versiones utilizadas

### Git y GitHub

- **Repositorio**: Proyecto dividido en dos repositorios (Frontend-CRCoach y Backend-CRCoach).
- **Estrategia de ramas**:
  - `master` — Rama principal de producción.
  - `feature/<nombre>` — Ramas para funcionalidades específicas.
  - `dependabot/*` — Ramas automáticas de Dependabot para actualizaciones.
- **Convención de commits**: Formato `tipo: descripción`:
  - `feat:` — Nueva funcionalidad.
  - `fix:` — Corrección de bug.
  - `docs:` — Documentación.
  - `refactor:` — Refactorización.
  - `test:` — Pruebas.
  - `chore:` — Tareas de mantenimiento.

### GitHub Projects (Kanban)

El tablero se organiza con los siguientes campos:

| Columna | Descripción |
|:--------|:------------|
| Backlog | Tareas del product backlog |
| To Do | Tareas seleccionadas para el sprint actual |
| In Progress | Tareas en desarrollo activo |
| Done | Tareas completadas y verificadas |

### GitHub Actions

Se configuraron los siguientes workflows:

| Workflow | Disparador | Acción |
|:---------|:-----------|:-------|
| CI Pipeline | Push a master | Build del proyecto y ejecución de tests |
| CodeQL | Push/PR a master, semanal | Análisis de seguridad del código |
| Qodana | Push/PR a master | Análisis de calidad de código |
| Deploy Docs | Push a master | Publica documentación MkDocs en GitHub Pages |
| Dependabot | Diario (npm) / Semanal (Docker) | Actualización automática de dependencias |

## 6.5. Fragmentos de código relevantes

### Backend: Clasificador de arquetipos

```java
// ArchetypeClassifier.java
// Clasifica el mazo rival en un arquetipo basándose en cartas características y coste de elixir
public Archetype classify(List<String> cardNames, double elixirAverage) {
    // Mapa de cartas clave por arquetipo
    Map<Archetype, List<String>> signatureCards = Map.of(
        Archetype.SIEGE, List.of("X-Bow", "Mortar"),
        Archetype.BEATDOWN, List.of("Golem", "Lava Hound", "Giant", "Elixir Golem"),
        Archetype.CONTROL, List.of("P.E.K.K.A", "Mega Knight", "Mini P.E.K.K.A"),
        Archetype.CYCLE, List.of("Hog Rider", "Royal Hogs"),
        Archetype.LOGBAIT, List.of("Goblin Barrel", "Princess", "Goblin Gang")
    );

    // Buscar coincidencias de cartas características
    for (Map.Entry<Archetype, List<String>> entry : signatureCards.entrySet()) {
        for (String card : entry.getValue()) {
            if (cardNames.contains(card)) {
                return entry.getKey();
            }
        }
    }

    // Fallback por coste de elixir
    if (elixirAverage > 4.0) return Archetype.BEATDOWN;
    if (elixirAverage < 3.0) return Archetype.CYCLE;

    return Archetype.UNKNOWN;
}
```

### Frontend: Signal Store para batallas

```typescript
// battles.signal.store.ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { BattlesService } from '../services/battles/battles.service';

interface BattlesState {
  battles: Battle[];
  loading: boolean;
  error: string | null;
}

const initialState: BattlesState = {
  battles: [],
  loading: false,
  error: null,
};

export const BattlesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ battles }) => ({
    totalCount: computed(() => battles().length),
    winrate: computed(() => {
      const wins = battles().filter(b => b.isWin).length;
      return battles().length > 0 ? (wins / battles().length) * 100 : 0;
    }),
    currentStreak: computed(() => {
      let streak = 0;
      for (const b of battles()) {
        if (b.isWin) streak++;
        else break;
      }
      return streak;
    }),
  })),
  withMethods((store, battlesService = inject(BattlesService)) => ({
    async loadBattles(userId: number) {
      patchState(store, { loading: true, error: null });
      try {
        const battles = await battlesService.getByUser(userId).toPromise();
        patchState(store, { battles, loading: false });
      } catch (err) {
        patchState(store, { error: 'Error al cargar batallas', loading: false });
      }
    },
  }))
);
```

### Frontend: Servicio de autenticación

```typescript
// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this.loggedInSubject.asObservable();

  login(data: FormGroup | any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/api/v1/auth/authenticate`, data
    );
  }

  register(data: FormGroup | any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/api/v1/auth/register`, data
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
    this.loggedInSubject.next(true);
  }

  logout(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.post(`${environment.apiUrl}/api/v1/auth/logout`, {})
        .subscribe({ finalize: () => this.removeUserData() });
    } else {
      this.removeUserData();
    }
  }

  isTokenValid(): boolean {
    const payload = this.getTokenPayload();
    if (!payload || !payload.exp) return false;
    return Date.now() < payload.exp * 1000;
  }

  private getTokenPayload(): any | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const base64 = token.split('.')[1];
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
}
```

### Backend: Configuración de seguridad

```java
// SecurityConfig.java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private static final String[] PUBLIC_ENDPOINTS = {
        "/api/v1/auth/**",
        "/api/v1/users/email-exists/**",
        "/api/v1/users/username-exists/**",
        "/api/v1/player_profiles/exists-in-api/**",
        "/api/v1/player_profiles/exists-in-local/**",
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html"
    };
}
```

### Frontend: Estructura ITCSS - Variables

```scss
// src/styles/00-settings/_variables.scss

// Colores primarios
$primary-50: #E3F2FD;
$primary-100: #BBDEFB;
$primary-200: #90CAF9;
$primary-300: #64B5F6;
$primary-400: #42A5F5;
$primary-500: #1565C0;

// Colores de estado
$success: #4CAF50;
$error: #F44336;
$warning: #FF9800;
$info: #2196F3;

// Tipografía
$font-regular: 'ClashRoyaleRegularFont', sans-serif;
$font-bold: 'ClashRoyaleBoldFont', sans-serif;

// Espaciados
$space-1: 0.25rem;
$space-2: 0.5rem;
$space-3: 0.75rem;
$space-4: 1rem;
$space-6: 1.5rem;
$space-8: 2rem;

// Breakpoints
$bp-sm: 40rem;
$bp-md: 48rem;
$bp-lg: 64rem;
$bp-xl: 80rem;

// Sombras
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

### Backend: Servicio de análisis de debilidades

```java
// AnalyticsService.java
@Service
public class AnalyticsService {

    public WeaknessReportDto analyzeWeaknesses(Long profileId) {
        List<Battles> allBattles = battlesRepository.findByProfileId(profileId);

        // Agrupar por arquetipo y calcular winrate
        Map<String, List<Battles>> byArchetype = allBattles.stream()
            .collect(Collectors.groupingBy(b -> b.getDeck().getArchetype()));

        List<ArchetypeStatDto> archetypeStats = byArchetype.entrySet().stream()
            .map(entry -> {
                long total = entry.getValue().size();
                long wins = entry.getValue().stream().filter(Battles::getIsWin).count();
                return new ArchetypeStatDto(entry.getKey(), wins, total,
                    total > 0 ? (wins * 100.0 / total) : 0);
            })
            .sorted(Comparator.comparing(ArchetypeStatDto::getWinrate))
            .collect(Collectors.toList());

        // Identificar cartas problemáticas
        List<ProblematicCardDto> problematicCards = findProblematicCards(allBattles);

        return new WeaknessReportDto(profileId, allBattles.size(),
            archetypeStats, problematicCards);
    }
}
```

## 6.6. Dependencias y librerías externas

### Frontend (Angular)

| Librería | Versión | Uso |
|:---------|:--------|:----|
| @angular/core | 21.2 | Framework principal |
| @angular/material | 21.2 | Componentes de interfaz (CDK) |
| @ngx-translate/core | 17.0 | Internacionalización |
| chart.js | 4.5 | Gráficas interactivas |
| ng2-charts | 10.0 | Wrapper para Chart.js en Angular |
| gsap | 3.14 | Animaciones avanzadas |
| lenis | 1.3 | Scroll suave |
| swiper | 12.1 | Carruseles y sliders |
| rxjs | 7.8 | Programación reactiva |
| vitest | 4.0 | Test runner |
| jsdom | 28.0 | Entorno DOM para tests |

### Backend (Spring Boot)

| Librería | Versión | Uso |
|:---------|:--------|:----|
| spring-boot-starter-web | 4.0 | API REST |
| spring-boot-starter-data-jpa | 4.0 | Persistencia JPA/Hibernate |
| spring-boot-starter-security | 4.0 | Seguridad y autenticación |
| spring-boot-starter-mail | 4.0 | Envío de emails |
| spring-boot-starter-webflux | 4.0 | WebClient reactivo |
| springdoc-openapi | 3.0 | Documentación OpenAPI |
| jjwt (io.jsonwebtoken) | 0.11.5 | Generación y validación JWT |
| lombok | — | Reducción de código boilerplate |
| postgresql | 42.x | Driver PostgreSQL |
| h2 | — | Base de datos en memoria para tests |
| thymeleaf | — | Plantillas de email |
