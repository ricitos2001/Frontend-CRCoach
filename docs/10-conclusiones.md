# 10. Conclusiones

## 10.1. Evaluación crítica respecto a los objetivos iniciales

### Objetivos alcanzados

Al inicio del proyecto se definieron 10 objetivos específicos. A continuación se evalúa el grado de cumplimiento de cada uno:

| ID | Objetivo | Cumplimiento | Estado |
|:---|:---------|:-------------|:-------|
| O01 | Sistema de autenticación seguro con JWT | 100% | ✅ Completado |
| O02 | Integración con API de Clash Royale | 100% | ✅ Completado |
| O03 | Polling automático de batallas | 100% | ✅ Completado |
| O04 | Dashboard interactivo con indicadores clave | 90% | ✅ Completado |
| O05 | Diagnóstico automático de debilidades | 95% | ✅ Completado |
| O06 | Sistema de objetivos medibles | 100% | ✅ Completado |
| O07 | Diario de sesiones vinculado a batallas | 100% | ✅ Completado |
| O08 | Diseño responsive con ITCSS + BEM | 85% | ✅ Completado |
| O09 | Despliegue con Docker y servicios cloud | 90% | ✅ Completado |
| O10 | Documentación exhaustiva del proyecto | 95% | ✅ Completado |

**Grado de cumplimiento global: ~94%**

### Objetivos no alcanzados o parcialmente cumplidos

- **O04 (Dashboard)**: El dashboard muestra todos los indicadores previstos, pero la disposición en móvil podría optimizarse más.
- **O08 (Diseño responsive)**: La aplicación es funcional en todos los dispositivos, pero hay algunos componentes (como el sidebar) que en pantallas muy pequeñas podrían mejorar su usabilidad.
- **O09 (Despliegue)**: El despliegue es funcional pero el CI/CD no incluye despliegue automático continuo (solo CI). El despliegue se realiza manualmente.

## 10.2. Grado de cumplimiento del alcance propuesto

### MVP (Funcionalidades obligatorias)

De las **12 funcionalidades** definidas como obligatorias para el MVP, se han completado **12/12 (100%)**:

| ID | Funcionalidad | Estado |
|:---|:--------------|:-------|
| F01 | Registro y autenticación | ✅ |
| F02 | Vinculación de cuenta CR | ✅ |
| F03 | Sincronización automática | ✅ |
| F04 | Sincronización manual | ✅ |
| F05 | Dashboard principal | ✅ |
| F06 | Historial de batallas | ✅ |
| F07 | Diagnóstico de debilidades | ✅ |
| F08 | Sistema de objetivos | ✅ |
| F09 | Diario de sesiones | ✅ |
| F10 | Gráfica de evolución | ✅ |
| F11 | Catálogo de cartas | ✅ |
| F12 | Panel de usuario | ✅ |

### Funcionalidades post-MVP

De las **5 funcionalidades opcionales** definidas como post-MVP:

| ID | Funcionalidad | Estado |
|:---|:--------------|:-------|
| F13 | Comparador temporal | ❌ No implementado |
| F14 | Rendimiento por modo de juego | ❌ No implementado |
| F15 | Notificaciones push | ❌ No implementado |
| F16 | Exportación de datos | ❌ No implementado |
| F17 | Tema oscuro | ✅ Implementado (se consideró importante para UX) |
| F18 | Perfil público | ❌ No implementado |

### Reflexión sobre el alcance

El proyecto se planificó con un alcance realista centrado en el MVP. La decisión de priorizar 12 funcionalidades bien implementadas frente a 20 funcionalidades a medio terminar ha demostrado ser acertada. El producto final es **sólido, funcional y utilizable por un jugador real** desde el primer día.

La funcionalidad **F17 (Tema oscuro)** se implementó porque se consideró un requisito de usabilidad básico más que una funcionalidad opcional, y su implementación fue relativamente sencilla gracias a la arquitectura ITCSS con variables CSS.

## 10.3. Mejoras futuras propuestas

### A corto plazo (post-entrega)

| Mejora | Prioridad | Esfuerzo estimado |
|:-------|:----------|:------------------|
| **F13 Comparador temporal**: Comparativa "antes vs ahora" con métricas lado a lado | Alta | 2 semanas |
| **Notificaciones por email**: Al completar objetivos o detectar cambios significativos | Alta | 1 semana |
| **Mejora del CI/CD**: Añadir CD para despliegue automático en Render | Alta | 1 semana |
| **Tests E2E**: Implementar pruebas con Cypress o Playwright | Alta | 2 semanas |
| **Auditoría WCAG AA**: Corrección de problemas de accesibilidad detectados | Media | 1 semana |

### A medio plazo

| Mejora | Prioridad | Esfuerzo estimado |
|:-------|:----------|:------------------|
| **F14 Rendimiento por modo**: Estadísticas separadas por modo de juego | Media | 2 semanas |
| **Modo entrenamiento**: Simulador de matchup con recomendaciones en tiempo real | Media | 3 semanas |
| **API pública**: Exponer endpoints públicos para que otras apps consuman los datos | Media | 2 semanas |
| **App móvil**: Versión nativa con React Native o Flutter | Baja | 3-4 meses |
| **F16 Exportación de datos**: CSV/JSON descargable del historial | Baja | 1 semana |

### A largo plazo

- **Recomendaciones de mazos basadas en IA**: Usar machine learning para sugerir mazos óptimos según el meta y las cartas del jugador.
- **Comunidad**: Foro o sistema de clanes dentro de la plataforma para compartir estadísticas.
- **Marketplace de coaches**: Conectar jugadores con entrenadores profesionales de Clash Royale.
- **Sistema de logros**: Gamificación para motivar la mejora continua.

## 10.4. Lecciones aprendidas

### Técnicas

1. **Docker multi-etapa reduce drásticamente el tamaño de las imágenes**: La imagen del frontend pasó de ~500MB (con Node) a ~20MB (con Nginx). Esto acelera los despliegues y reduce el consumo de recursos.

2. **El polling con backoff exponencial es esencial para APIs con rate limiting**: Sin esta estrategia, el sistema habría fallado constantemente con errores 429 de la API de Supercell.

3. **Los Signal Stores de NgRx simplifican la gestión del estado**: En proyectos de tamaño medio como este, los Signal Stores ofrecen un equilibrio perfecto entre simplicidad y funcionalidad, sin el boilerplate de NgRx tradicional.

4. **ITCSS + BEM proporciona una arquitectura de estilos realmente escalable**: A pesar de tener más de 20 archivos SCSS, la estructura se mantiene ordenada y predecible. Cualquier desarrollador nuevo puede encontrar y modificar estilos rápidamente.

5. **La separación frontend/backend en repositorios independientes tiene ventajas e inconvenientes**: Por un lado, permite desplegar cada capa de forma independiente. Por otro, requiere coordinación para mantener la compatibilidad de la API.

### Metodológicas

1. **SCRUM simplificado sin daily meetings funciona para proyectos individuales**: El uso de GitHub Projects con sprints de 2 semanas y tareas semanales fue suficiente para mantener el ritmo de desarrollo.

2. **Los sprints de 2 semanas son el periodo ideal**: Una semana es demasiado corta para funcionalidades complejas, y un mes es demasiado largo para mantener el foco.

3. **La documentación debe hacerse en paralelo al desarrollo**: Dejarla para el final fue un error. Aunque al final se ha completado, habría sido más eficiente documentar cada funcionalidad justo después de implementarla.

4. **El despliegue temprano (incluso con funcionalidad básica) es crucial**: Detectamos problemas de CORS, configuración de base de datos y variables de entorno con tiempo suficiente para solucionarlos.

### Personales

1. **Gestión del tiempo**: Aprender a priorizar es la habilidad más importante. Decir "no" a funcionalidades interesantes pero no esenciales fue difícil pero necesario.

2. **Resolución de problemas**: La capacidad de buscar soluciones en documentación oficial, Stack Overflow y comunidades de desarrolladores es tan importante como los conocimientos técnicos.

3. **Persistencia**: Hubo momentos de frustración (especialmente con la configuración CORS y el rate limiting de la API), pero la perseverancia dio sus frutos.

## 10.5. Cumplimiento de estándares y rúbricas

### DWEC (Desarrollo Web en Entorno Cliente)

| Criterio | Peso | Autoevaluación |
|:---------|:-----|:---------------|
| Sintaxis moderna del lenguaje | 20% | Excelente (4) |
| Objetos predefinidos del lenguaje | 20% | Bien (3) |
| Manejo de eventos e integración | 20% | Bien (3) |
| Modelo de objetos del documento | 20% | Bien (3) |
| Comunicación asíncrona | 20% | Excelente (4) |
| **Total DWEC** | **100%** | **3.4/4** |

### DIW (Diseño de Interfaces Web)

| Criterio | Peso | Autoevaluación |
|:---------|:-----|:---------------|
| Planificación y prototipado | 20% | Bien (3) |
| Guía de estilos y consistencia visual | 20% | Excelente (4) |
| Definición de estilos avanzados | 20% | Excelente (4) |
| Diseño responsive y accesibilidad | 20% | Bien (3) |
| Interactividad y multimedia | 10% | Bien (3) |
| Usabilidad y experiencia de usuario | 10% | Bien (3) |
| **Total DIW** | **100%** | **3.3/4** |

### DWES (Desarrollo Web en Entorno Servidor)

| Criterio | Peso | Autoevaluación |
|:---------|:-----|:---------------|
| API REST | 70% | Excelente (4) |
| MVC | 30% | Excelente (4) |
| Modelo de datos | Evaluación adicional | Excelente (4) |

### Despliegue de Aplicaciones Web

| Criterio | Peso | Autoevaluación |
|:---------|:-----|:---------------|
| Arquitectura de la aplicación | 20% | Excelente (4) |
| Implementación Docker | 20% | Excelente (4) |
| Servidor web/front (reverse proxy) | 15% | Excelente (4) |
| Servidor de aplicaciones | 15% | Bien (3) |
| Control de versiones + CI/CD | 20% | Bien (3) |
| Documentación del despliegue | 10% | Excelente (4) |
| **Total Despliegue** | **100%** | **3.7/4** |

## 10.6. Palabras finales

**CRCoach** ha sido un proyecto ambicioso que me ha permitido aplicar y consolidar todos los conocimientos adquiridos durante el ciclo de Desarrollo de Aplicaciones Web. Desde el diseño de la base de datos hasta el despliegue en producción, pasando por la implementación del frontend con Angular, el backend con Spring Boot, la integración con APIs externas y la contenedorización con Docker.

El resultado es una aplicación **funcional, completa y utilizable** que resuelve un problema real: ayudar a los jugadores de Clash Royale a mejorar de forma estructurada y consciente.

Personalmente, este proyecto me ha enseñado que el desarrollo de software no es solo escribir código, sino **resolver problemas, tomar decisiones técnicas fundamentadas y, sobre todo, perseverar** cuando las cosas no funcionan a la primera.

---

**César Gabriel Ucha Sousa**  
I.E.S. Rafael Alberti  
Curso 2025/2026 - 2º DAW
