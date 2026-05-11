# 1. Introducción, objetivos y antecedentes

## 1.1. Origen de la idea y motivación del proyecto

### Contexto del juego

Clash Royale es uno de los juegos competitivos móviles más populares del mundo, desarrollado por Supercell y lanzado en 2016. Con millones de jugadores activos, combina elementos de estrategia en tiempo real, colección de cartas y combates multijugador en un formato rápido de aproximadamente 3-4 minutos por partida. El juego cuenta con un ecosistema competitivo muy activo, con ligas mensuales, torneos oficiales y una escena de esports consolidada.

### El problema del jugador

A pesar de su popularidad, mejorar de forma consciente y estructurada en Clash Royale es extremadamente difícil. El jugador medio se enfrenta a los siguientes problemas:

- **Juega partidas de forma repetitiva** sin analizar sus errores ni patrones de derrota.
- **No lleva registro** de contra qué mazos o cartas pierde más frecuentemente.
- **No establece objetivos concretos de mejora**, sino que juega sin dirección.
- **No tiene forma de medir su evolución real** a lo largo del tiempo, más allá del número de trofeos.
- **La API oficial solo almacena las últimas 25 batallas**, por lo que no existe un historial a largo plazo accesible.

El resultado es una sensación generalizada de frustración y estancamiento: el jugador siente que no sube de trofeos pero no sabe por qué, y carece de una herramienta que le guíe en su proceso de mejora.

### Motivación personal

Como jugador activo de Clash Royale durante varios años, he experimentado directamente la frustración de estancarse sin entender las causas reales. Tras analizar el ecosistema de herramientas disponibles, descubrí que ninguna ofrecía una solución integrada que combinara:

1. Almacenamiento histórico de datos de rendimiento.
2. Diagnóstico automático de debilidades.
3. Sistema de objetivos medibles.
4. Diario personal de sesiones de juego.

Esta carencia en el mercado fue la motivación principal para desarrollar **CRCoach**: una plataforma que actuara como un entrenador personal digital para jugadores de Clash Royale.

## 1.2. Expectativas y objetivos específicos

### Objetivo general

Desarrollar una plataforma web completa que permita a los jugadores de Clash Royale analizar su rendimiento, identificar áreas de mejora y hacer seguimiento de su evolución a lo largo del tiempo mediante una interfaz intuitiva y dashboards interactivos.

### Objetivos específicos

| ID | Objetivo | Módulo relacionado |
|:---|:---------|:-------------------|
| O01 | Implementar un sistema de autenticación seguro con JWT y roles de usuario | DWES, DWEC |
| O02 | Integrar la API oficial de Clash Royale para obtener datos de jugadores y batallas | DWES |
| O03 | Desarrollar un sistema de polling automático que almacene batallas periódicamente | DWES |
| O04 | Crear un dashboard interactivo con indicadores clave de rendimiento | DWEC, DIW |
| O05 | Implementar un diagnóstico automático de debilidades con gráficas y reportes | DWES, DWEC |
| O06 | Desarrollar un sistema de objetivos medibles con seguimiento automático | DWES, DWEC |
| O07 | Implementar un diario de sesiones vinculado a las batallas del jugador | DWES, DWEC |
| O08 | Diseñar una interfaz responsive y accesible siguiendo la metodología ITCSS + BEM | DIW |
| O09 | Desplegar la aplicación completa usando Docker y servicios cloud | Despliegue |
| O10 | Documentar exhaustivamente todo el proyecto siguiendo los estándares del ciclo | Todos |

### Expectativas de calidad

- **Cobertura de código**: Al menos 60% en servicios críticos del backend.
- **Rendimiento**: La aplicación debe cargar el dashboard en menos de 2 segundos.
- **Disponibilidad**: 99% de uptime en los servicios de despliegue.
- **Accesibilidad**: Cumplimiento de nivel AA de las WCAG 2.1.
- **Responsive**: Funcionalidad completa en dispositivos móviles, tablets y escritorio.

## 1.3. Análisis comparativo de aplicaciones similares

### Competidores directos

| Competidor | Fortalezas | Carencias |
|:-----------|:-----------|:----------|
| **RoyaleAPI** | Referente en estadísticas globales de mazos y cartas. Datos agregados de millones de partidas. API pública muy completa. | No ofrece análisis personalizado del jugador, ni objetivos, ni historial almacenado a largo plazo. |
| **Stats Royale** | Muestra perfil del jugador, historial de batallas recientes y cofres próximos. Interfaz limpia. | Es una foto del momento actual: no almacena evolución temporal, no diagnostica debilidades, no permite establecer metas. |
| **Pixel Crux** | Ofrece analítica básica de batallas con winrate general y contra qué mazos se gana o pierde. | Carece de historial a largo plazo, diario de sesiones y sistema de objetivos. |
| **Deckshop.pro** | Centrado en construcción y evaluación de mazos. Buen análisis de sinergias entre cartas. | No analiza el rendimiento individual del jugador ni su progreso a lo largo del tiempo. |

### Propuesta de valor diferencial de CRCoach

| Característica | CRCoach | RoyaleAPI | Stats Royale | Pixel Crux | Deckshop |
|:---------------|:--------|:----------|:-------------|:-----------|:---------|
| Historial de batallas a largo plazo | ✅ (almacenamiento propio) | ❌ (solo últimas 25) | ❌ (solo recientes) | ❌ (solo recientes) | ❌ |
| Diagnóstico de debilidades | ✅ (automático y detallado) | ❌ | ❌ | ✅ (básico) | ❌ |
| Sistema de objetivos | ✅ | ❌ | ❌ | ❌ | ❌ |
| Diario de sesiones | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gráfica de evolución temporal | ✅ | ❌ | ❌ | ❌ | ❌ |
| Análisis por arquetipo rival | ✅ | ❌ | ❌ | ✅ (parcial) | ❌ |
| Catálogo de cartas del jugador | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard personalizado | ✅ | ❌ | ✅ (básico) | ✅ (básico) | ❌ |

### Conclusión del análisis

Ninguna de las herramientas existentes en el mercado ofrece una solución integrada que combine almacenamiento histórico, diagnóstico automático, sistema de objetivos y diario personal. **CRCoach** ocupa un nicho no cubierto: el del jugador que quiere mejorar de forma estructurada y consciente, con datos objetivos y seguimiento a largo plazo.

## 1.4. Tecnologías utilizadas

### Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|:-----|:-----------|:--------|:----------|
| Frontend | Angular | 21.2 | SPA con componentes standalone |
| Frontend | Angular Material | 21.2 | Componentes de interfaz |
| Frontend | TypeScript | 5.9 | Lenguaje principal |
| Frontend | SCSS (ITCSS + BEM) | — | Arquitectura de estilos |
| Frontend | Chart.js + ng2-charts | 4.5 / 10.0 | Gráficas interactivas |
| Frontend | GSAP | 3.14 | Animaciones |
| Frontend | ngx-translate | 17.0 | Internacionalización |
| Frontend | Swiper | 12.1 | Carruseles y sliders |
| Backend | Spring Boot | 4.0.3 | Framework principal |
| Backend | Java | 21 | Lenguaje principal |
| Backend | Spring Security | 6.x | Autenticación y autorización |
| Backend | JWT (jjwt) | 0.11.5 | Tokens de autenticación |
| Backend | Spring Data JPA + Hibernate | — | ORM y persistencia |
| Backend | PostgreSQL | 15 | Base de datos |
| Backend | WebClient (Spring WebFlux) | — | Cliente HTTP reactivo |
| Backend | SpringDoc OpenAPI | 3.0.2 | Documentación de API |
| Backend | Lombok | — | Reducción de boilerplate |
| Backend | Thymeleaf | — | Plantillas de email |
| Infraestructura | Docker | — | Contenedores |
| Infraestructura | Docker Compose | — | Orquestación local |
| Infraestructura | Nginx | — | Servidor web / proxy inverso |
| Infraestructura | GitHub Actions | — | CI/CD |
| Despliegue | Render | — | Backend hosting |
| Despliegue | Neon | — | Base de datos PostgreSQL |
| Despliegue | Vercel / Netlify / Render | — | Frontend hosting |
| Diseño | Figma | — | Prototipado |

## 1.5. Estructura del proyecto

El repositorio se organiza en dos carpetas principales:

```
CRCoach/
├── Frontend-CRCoach/       # Aplicación Angular 21
│   ├── src/                 # Código fuente del frontend
│   ├── docs/                # Documentación del proyecto
│   ├── Dockerfile           # Construcción Docker multi-etapa
│   ├── docker-compose.yml   # Orquestación local
│   ├── nginx.conf           # Configuración de Nginx
│   └── ...
├── Backend-CRCoach/         # Aplicación Spring Boot 4
│   ├── src/                 # Código fuente del backend
│   ├── docs/                # Documentación de la API
│   ├── Dockerfile           # Construcción Docker multi-etapa
│   ├── docker-compose.yml   # Orquestación con PostgreSQL
│   ├── nginx.conf           # Configuración de Nginx
│   └── ...
```

Esta separación permite desarrollar, testear y desplegar cada capa de forma independiente, siguiendo las mejores prácticas de arquitecturas modernas.
