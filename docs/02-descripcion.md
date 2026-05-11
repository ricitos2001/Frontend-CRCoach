# 2. Descripción del proyecto

## 2.1. Descripción general

**CRCoach** es una plataforma web de mejora personal para jugadores de Clash Royale. Actúa como un entrenador personal digital que analiza el rendimiento del jugador, detecta debilidades automáticamente, permite establecer objetivos de mejora medibles y almacena un historial completo de batallas a lo largo del tiempo.

La aplicación se compone de un frontend desarrollado con **Angular 21** (Single Page Application) y un backend desarrollado con **Spring Boot 4.0** que expone una API REST, se conecta a la API oficial de Clash Royale para obtener datos en tiempo real y los persiste en una base de datos **PostgreSQL**.

### Flujo de trabajo del usuario

```
Registro → Vinculación de cuenta CR → Sincronización automática →
Dashboard con indicadores → Diagnóstico de debilidades →
Establecimiento de objetivos → Diario de sesiones →
Seguimiento de evolución
```

## 2.2. Funcionalidades del MVP

### F01: Registro y autenticación de usuarios

Sistema de cuentas personales con las siguientes características:

- **Registro**: Formulario con validación de email, contraseña segura (mayúsculas, minúsculas, números, caracteres especiales y longitud mínima) y confirmación de contraseña.
- **Inicio de sesión**: Autenticación mediante email y contraseña.
- **JWT**: Generación de token JWT con expiración automática (10 horas).
- **Persistencia de sesión**: El token se almacena en `localStorage` del navegador.
- **Interceptor HTTP**: El token se añade automáticamente a todas las peticiones autenticadas mediante un `HttpInterceptor`.
- **Guard de rutas**: Protege las rutas privadas redirigiendo al login si el token ha expirado.
- **Cierre de sesión**: Invalida el token y limpia los datos locales.
- **Recuperación de contraseña**: Flujo completo con envío de email y restablecimiento mediante token.

**Endpoint asociado**: `POST /api/v1/auth/register`, `POST /api/v1/auth/authenticate`, `POST /api/v1/auth/logout`

### F02: Vinculación de cuenta de Clash Royale

- El usuario introduce su **Player Tag** (ej: `#8PL9YC2LJ`).
- El backend verifica la existencia del tag en la API oficial de Supercell.
- Si el tag es válido, se almacena asociado al perfil del usuario.
- Posibilidad de cambiar o desvincular el tag en cualquier momento.

**Endpoint asociado**: `POST /api/v1/player_profiles`, `GET /api/v1/player_profiles/exists-in-api/{playerTag}`

### F03: Sincronización automática (polling)

El backend ejecuta un proceso programado (`@Scheduled`) que:

- Cada **5 minutos** consulta el perfil y las batallas recientes del jugador en la API de Supercell.
- Almacena los datos en la base de datos local.
- Crea **snapshots** periódicos del perfil para generar la gráfica de evolución.
- Clasifica las batallas por **arquetipo** rival (Beatdown, Control, Cycle, etc.).
- Detecta **cartas problemáticas** (aquellas contra las que se pierde más).

Este proceso es fundamental porque la API de Supercell **solo devuelve las últimas 25 batallas**. Sin el polling, los datos históricos se perderían.

**Configuración**:
```properties
scheduling.global.fixedDelayMs=300000
scheduling.global.initialDelayMs=10000
```

### F04: Sincronización manual

El usuario puede forzar una actualización inmediata desde la interfaz mediante un botón de "Actualizar". Esto permite obtener datos frescos sin esperar al siguiente ciclo de polling.

### F05: Dashboard principal

Vista principal después del inicio de sesión que muestra:

- **Trofeos actuales** y cambio respecto al último periodo.
- **Winrate global** (porcentaje de victorias).
- **Racha actual** de victorias o derrotas.
- **Últimas batallas** con resultado y cambio de trofeos.
- **Resumen rápido** del diagnóstico actual.

El dashboard se actualiza dinámicamente con los datos sincronizados.

### F06: Historial de batallas

Listado completo de todas las batallas almacenadas con:

- **Filtros**: Por modo de juego, resultado (victoria/derrota), rango de fechas, arquetipo rival.
- **Paginación**: Navegación por páginas de resultados.
- **Detalle**: Mazo propio, mazo rival, cambio de trofeos, duración, modo, fecha.
- **Búsqueda**: Por nombre de carta o jugador rival.

### F07: Diagnóstico de debilidades

Análisis automático que genera:

- **Winrate por arquetipo rival**: Muestra contra qué arquetipos se gana y contra cuáles se pierde más.
- **Cartas problemáticas**: Identifica las cartas específicas contra las que se pierde con más frecuencia.
- **Franjas de trofeos críticas**: Rangos de trofeos donde el rendimiento baja significativamente.
- **Reporte resumen**: Diagnóstico textual con recomendaciones.

Los datos se presentan mediante gráficas interactivas de **Chart.js** que permiten visualizar patrones de forma intuitiva.

### F08: Sistema de objetivos

CRUD completo de objetivos de mejora con:

- **Creación**: Título, descripción, tipo (trofeos, winrate, cartas), valor objetivo, fecha límite.
- **Seguimiento automático**: El backend evalúa periódicamente el progreso de cada objetivo.
- **Visualización**: Barra de progreso, porcentaje completado, días restantes.
- **Estados**: Pendiente, En progreso, Completado, Fallido.
- **Notificaciones**: Al completar o fallar un objetivo.

### F09: Diario de sesiones

Diario personal donde el jugador puede:

- **Registrar sesiones** de juego con notas personales y reflexiones.
- **Vincular sesiones a batallas** por rango de fechas.
- **Valorar la sesión** (emoticono o puntuación).
- **Ver histórico** de sesiones ordenado por fecha.

### F10: Gráfica de evolución

- **Línea temporal** interactiva de trofeos a lo largo del tiempo.
- Basada en los **snapshots** almacenados periódicamente.
- Permite seleccionar rangos de fechas para ver periodos concretos.
- Muestra tendencias y puntos de inflexión.

### F11: Catálogo de cartas

Visualización de todas las cartas del juego con:

- Iconos oficiales de cada carta.
- Nivel actual del jugador para cada carta.
- Información básica (coste de elixir, rareza, tipo).
- Búsqueda y filtrado por nombre, rareza o coste.

### F12: Panel de usuario

- Edición de perfil (nombre, email).
- Cambio de contraseña.
- Vincular/desvincular Player Tag.
- Configuración de idioma (español/inglés).
- Alternar tema oscuro/claro.
- Eliminación de cuenta (derecho al olvido).

## 2.3. Funcionalidades post-MVP

| ID | Funcionalidad | Descripción |
|:---|:--------------|:------------|
| F13 | Comparador temporal | Comparativa "cómo jugaba hace un mes versus ahora" con métricas lado a lado |
| F14 | Rendimiento por modo de juego | Estadísticas separadas para ladder, desafíos y torneos |
| F15 | Notificaciones push | Alertas al completar o fallar objetivos |
| F16 | Exportación de datos | Descargar historial en CSV/JSON |
| F17 | Perfil público | Compartir estadísticas con otros jugadores |
| F18 | Recomendaciones de mazos | Sugerencias de mazos basadas en el meta actual y las cartas del jugador |

## 2.4. Interfaz de usuario y experiencia de usuario (UI/UX)

### Diseño visual

- **Paleta de colores**: Azul primario (#1565C0) como color principal, con variantes para estados (verde éxito, rojo error, naranja advertencia). Tema oscuro con overrides de variables CSS.
- **Tipografía**: Fuente personalizada "ClashRoyale" en dos variantes (Regular y Bold), con sistema de tamaños desde xs (12px) hasta 5xl (~61px).
- **Iconografía**: Iconos SVG del juego para cartas, más iconos Material Design para navegación y acciones.
- **Componentes**: Botones reutilizables, inputs con validación visual, modales, toasts de notificación, paginación, selector de idioma.

### Diseño responsive

La aplicación se adapta a tres breakpoints principales:

| Breakpoint | Anchura | Dispositivo |
|:-----------|:--------|:------------|
| sm | < 40rem | Móviles |
| md | 40rem - 64rem | Tablets |
| lg | > 64rem | Escritorio |

- **Sidebar**: Colapsable en móvil (se oculta mostrando solo iconos y se despliega con un botón hamburguesa).
- **Dashboards**: Las gráficas y tablas se reorganizan en una sola columna en móvil.
- **Formularios**: Se adaptan al ancho disponible sin perder usabilidad.

### Flujos de navegación

```
Público:
  Landing → Login/Registro → Recuperar contraseña

Privado (autenticado):
  Dashboard → Batallas → Debilidades → Objetivos → Sesiones → Progreso → Perfil
```

La navegación principal se realiza mediante un sidebar fijo en la parte izquierda (escritorio) o menú hamburguesa (móvil), con enlaces a cada sección.

### Sistema de notificaciones

- **Toasts**: Notificaciones temporales (éxito, error, advertencia, información) que aparecen en la esquina superior derecha.
- **Deduplicación**: El sistema evita mostrar mensajes duplicados consecutivos.

## 2.5. Usuarios objetivo y casos de uso

### Perfiles de usuario

| Perfil | Descripción | Necesidad principal |
|:-------|:------------|:-------------------|
| **Jugador competitivo casual** | Juega varias partidas al día, quiere mejorar pero no sabe cómo. | Diagnóstico automático de debilidades. |
| **Jugador en escalada de ladder** | Busca subir de liga activamente. | Seguimiento de evolución y objetivos medibles. |
| **Jugador analítico** | Disfruta entendiendo el meta y sus estadísticas. | Historial a largo plazo y métricas detalladas. |
| **Creador de contenido** | Streamers o youtubers que analizan partidas. | Datos históricos para análisis y contenido. |
| **Jugador F2P** | No mete dinero al juego. | Optimización de recursos. |

### Datos demográficos

- **Edad**: 16-35 años.
- **Nivel**: Intermedio-avanzado (4000+ trofeos).
- **Dedicación**: 30 minutos a 2 horas diarias.
- **Idioma**: Español (principal) e inglés.

### Casos de uso principales

| ID | Caso de uso | Actor | Descripción |
|:---|:------------|:------|:------------|
| CU01 | Registrarse en la plataforma | Visitante | Crear una cuenta con email y contraseña |
| CU02 | Iniciar sesión | Usuario | Autenticarse en la plataforma |
| CU03 | Vincular cuenta de Clash Royale | Usuario | Asociar su Player Tag a su perfil |
| CU04 | Ver dashboard | Usuario | Visualizar indicadores clave de rendimiento |
| CU05 | Ver historial de batallas | Usuario | Consultar todas las batallas almacenadas |
| CU06 | Analizar debilidades | Usuario | Ver diagnóstico automático de puntos débiles |
| CU07 | Crear objetivo | Usuario | Establecer una meta de mejora medible |
| CU08 | Registrar sesión | Usuario | Añadir una entrada en el diario de sesiones |
| CU09 | Ver evolución | Usuario | Consultar la gráfica de progreso temporal |
| CU10 | Gestionar perfil | Usuario | Editar datos personales y preferencias |
| CU11 | Sincronizar datos | Usuario (sistema) | Actualizar batallas y perfil desde la API |
| CU12 | Recuperar contraseña | Visitante | Restablecer contraseña olvidada |
| CU13 | Cambiar idioma | Usuario | Alternar entre español e inglés |
| CU14 | Activar tema oscuro | Usuario | Cambiar entre tema claro y oscuro |

### Diagrama de casos de uso

```
┌─────────────────────────────────────────────────────────────┐
│                    CRCoach Platform                          │
│                                                              │
│  ┌──────────────┐              ┌──────────────────┐          │
│  │  Visitante    │              │    Usuario        │          │
│  └──────┬───────┘              └────────┬─────────┘          │
│         │                               │                     │
│  ┌──────┴───────┐              ┌────────┴─────────┐          │
│  │ • Registrarse│              │ • Ver dashboard   │          │
│  │ • Iniciar    │              │ • Ver batallas    │          │
│  │   sesión     │              │ • Analizar        │          │
│  │ • Recuperar  │              │   debilidades     │          │
│  │   contraseña │              │ • Gestionar       │          │
│  └──────────────┘              │   objetivos       │          │
│                                │ • Registrar       │          │
│                                │   sesiones        │          │
│                                │ • Ver evolución   │          │
│                                │ • Gestionar       │          │
│                                │   perfil          │          │
│                                │ • Cambiar idioma  │          │
│                                │ • Tema oscuro     │          │
│                                └──────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────────┐        │
│  │  Sistema (polling automático)                     │        │
│  │  • Sincronizar batallas cada 5 minutos            │        │
│  │  • Crear snapshots de perfil                      │        │
│  │  • Clasificar arquetipos                          │        │
│  │  • Evaluar objetivos automáticamente              │        │
│  └──────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```
