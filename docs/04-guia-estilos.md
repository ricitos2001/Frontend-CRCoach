# 4. Guía de estilos y prototipado

## 4.1. Enlace al prototipo en Figma

El prototipo de la aplicación está disponible en Figma:

[Enlace al prototipo en Figma](https://www.figma.com/file/TU_ENLACE_AQUI/CRCoach-Prototype)

> **Nota**: El prototipo incluye todas las pantallas principales: Landing, Login, Registro, Dashboard, Batallas, Debilidades, Objetivos, Sesiones, Progreso y Perfil. También incluye la guía de estilos completa y componentes reutilizables.

## 4.2. Arquitectura de estilos: ITCSS

El proyecto sigue la metodología **ITCSS (Inverted Triangle CSS)** para organizar los estilos de forma escalable y mantenible. La estructura se compone de las siguientes capas, ordenadas de más genéricas a más específicas:

```
src/styles/
├── 00-settings/          # Variables y configuración global
│   ├── _variables.scss   # Variables SCSS (colores, tipografía, espaciados)
│   ├── _css-variables.scss # CSS Custom Properties (temas claro/oscuro)
│   └── _fonts.scss       # Definición de fuentes @font-face
├── 01-tools/             # Mixins y funciones reutilizables
│   └── _mixins.scss      # Mixins (responsive, flex, grid, tipografía)
├── 02-generic/           # Reset y estilos base normalizados
│   └── _reset.scss       # Reset CSS (box-sizing, márgenes, scroll)
├── 03-elements/          # Estilos para elementos HTML desnudos
│   └── _base.scss        # Estilos base (body, enlaces, SVGs)
├── 04-layout/            # Estilos de layout (header, sidebar, main, footer)
│   ├── _header.scss
│   ├── _main.scss
│   ├── _footer.scss
│   └── _sidebar.scss
├── 05-components/        # Componentes BEM reutilizables
│   ├── _common-button.scss
│   ├── _form-input.scss
│   ├── _language-selector.scss
│   ├── _graph.scss
│   ├── _modal.scss
│   ├── _pagination.scss
│   ├── _refresh-button.scss
│   └── _toast.scss
├── 06-utilities/         # Clases utilitarias
│   └── _responsive.scss
├── 07-pages/             # Estilos específicos de páginas
│   ├── _battles.scss
│   ├── _dashboard.scss
│   ├── _forms.scss
│   ├── _goals.scss
│   ├── _landing.scss
│   ├── _not-found.scss
│   ├── _profile.scss
│   ├── _progress.scss
│   ├── _sessions.scss
│   └── _weaknesses.scss
├── styles.scss           # Archivo maestro que importa todas las capas
├── styles.css            # CSS compilado
└── styles.css.map        # Source map
```

### Orden de importación en `styles.scss`

```scss
// 1. Settings (tokens)
@use '00-settings/variables' as *;
@use '00-settings/fonts' as *;

// 2. Tools
@use '01-tools/mixins' as *;

// 3. Generic
@use '02-generic/reset' as *;

// 4. Base (elements)
@use '03-elements/base' as *;

// 5. Layout
@use '04-layout/header' as *;
@use '04-layout/main' as *;
@use '04-layout/footer' as *;
@use '04-layout/sidebar' as *;

// 6. Components
@use '05-components/form-input' as *;
@use '05-components/language-selector' as *;
@use '05-components/graph' as *;
@use '05-components/refresh-button' as *;
@use '05-components/common-button' as *;
@use '05-components/toast' as *;
@use '05-components/pagination' as *;
@use '05-components/modal' as *;

// 7. Utilities
// @use '06-utilities/responsive' as *;

// 8. Pages
@use '07-pages/not-found' as *;
@use '07-pages/forms' as *;
@use '07-pages/landing' as *;
@use '07-pages/battles' as *;
@use '07-pages/dashboard' as *;
@use '07-pages/progress' as *;
@use '07-pages/goals' as *;
@use '07-pages/weaknesses' as *;
@use '07-pages/sessions' as *;
@use '07-pages/profile' as *;
```

## 4.3. Paleta de colores

### Colores primarios

| Variable | Color | Código HEX | Uso |
|:---------|:------|:-----------|:----|
| `$primary-50` | #E3F2FD | Fondo claro azul |
| `$primary-100` | #BBDEFB | Hover de fondo |
| `$primary-200` | #90CAF9 | Borde de inputs activos |
| `$primary-300` | #64B5F6 | Botones secundarios |
| `$primary-400` | #42A5F5 | Hover de botón primario |
| `$primary-500` | #1565C0 | **Color principal** (botones, enlaces) |

### Colores secundarios

| Variable | Color | Código HEX | Uso |
|:---------|:------|:-----------|:----|
| `$secondary-50` | #E0F7FA | Fondo claro cyan |
| `$secondary-100` | #B2EBF2 | — |
| `$secondary-200` | #80DEEA | — |
| `$secondary-300` | #4DD0E1 | Acentos secundarios |
| `$secondary-400` | #26C6DA | Hover secundario |
| `$secondary-500` | #00BCD4 | Color secundario |

### Colores de estado (semánticos)

| Variable | Color | Código HEX | Uso |
|:---------|:------|:-----------|:----|
| `$success` | Verde | #4CAF50 | Éxito, victorias, completado |
| `$error` | Rojo | #F44336 | Error, derrotas, fallido |
| `$warning` | Naranja | #FF9800 | Advertencia, en progreso |
| `$info` | Azul | #2196F3 | Información |

### Colores neutrales

| Variable | Color | Código HEX | Uso |
|:---------|:------|:-----------|:----|
| `$light-50` | #FAFAFA | Fondo principal claro |
| `$light-100` | #F5F5F5 | Fondo secundario claro |
| `$light-200` | #EEEEEE | Borde claro |
| `$dark-50` | #9E9E9E | Texto secundario |
| `$dark-100` | #616161 | Texto de ayuda |
| `$dark-200` | #424242 | Texto principal |
| `$dark-300` | #212121 | Texto oscuro (títulos) |

### Tema oscuro

El tema oscuro se activa añadiendo la clase `.dark-mode` al elemento `<html>`. Las variables CSS se sobrescriben para invertir los colores:

```scss
.dark-mode {
  --color-bg-primary: #121212;
  --color-bg-secondary: #1E1E1E;
  --color-bg-card: #2D2D2D;
  --color-text-primary: #E0E0E0;
  --color-text-secondary: #B0B0B0;
  --color-border: #404040;
}
```

Esta funcionalidad se gestiona mediante `ThemeService` que:
1. Detecta la preferencia del sistema (`prefers-color-scheme`).
2. Permite al usuario cambiar manualmente entre temas.
3. Persiste la preferencia en `localStorage`.

## 4.4. Tipografía

### Fuentes

El proyecto utiliza una fuente personalizada llamada **ClashRoyale** en dos variantes:

```scss
@font-face {
  font-family: 'ClashRoyaleRegularFont';
  src: url('/assets/fonts/Clash_Regular.woff2') format('woff2'),
       url('/assets/fonts/Clash_Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'ClashRoyaleBoldFont';
  src: url('/assets/fonts/Clash_Bold.woff2') format('woff2'),
       url('/assets/fonts/Clash_Bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

### Escala tipográfica

| Clase | Tamaño | Line-height | Uso |
|:------|:-------|:------------|:----|
| `text-xs` | 12px (0.75rem) | 1.25 | Texto pequeño, etiquetas |
| `text-sm` | 14px (0.875rem) | 1.25 | Cuerpo pequeño, metadatos |
| `text-base` | 16px (1rem) | 1.5 | **Cuerpo de texto principal** |
| `text-lg` | 18px (1.125rem) | 1.5 | Texto destacado |
| `text-xl` | 20px (1.25rem) | 1.4 | Subtítulos |
| `text-2xl` | 24px (1.5rem) | 1.3 | Títulos de sección |
| `text-3xl` | 30px (1.875rem) | 1.2 | Títulos de página |
| `text-4xl` | 36px (2.25rem) | 1.1 | Títulos grandes |
| `text-5xl` | 61px (3.8125rem) | 1.0 | Hero / Landing |

### Mixin de tipografía

```scss
@mixin text-style($size, $weight: 400, $color: null) {
  font-size: $size;
  font-weight: $weight;
  @if $color {
    color: $color;
  }
}
```

## 4.5. Espaciados

Sistema de espaciado basado en una escala progresiva:

| Variable | Valor | Uso |
|:---------|:------|:----|
| `$space-1` | 0.25rem (4px) | Espaciado mínimo |
| `$space-2` | 0.5rem (8px) | Padding interno pequeño |
| `$space-3` | 0.75rem (12px) | Padding de inputs |
| `$space-4` | 1rem (16px) | Espaciado base |
| `$space-5` | 1.25rem (20px) | Gap entre elementos |
| `$space-6` | 1.5rem (24px) | Padding de tarjetas |
| `$space-7` | 1.75rem (28px) | — |
| `$space-8` | 2rem (32px) | Margen entre secciones |
| `$space-9` | 2.25rem (36px) | — |
| `$space-10` | 2.5rem (40px) | Padding de contenedores |
| `$space-12` | 3rem (48px) | Separación de bloques |
| `$space-14` | 3.5rem (56px) | — |
| `$space-16` | 4rem (64px) | Separación de secciones grandes |
| `$space-20` | 5rem (80px) | — |
| `$space-24` | 6rem (96px) | Margen máximo |

## 4.6. Breakpoints responsive

| Breakpoint | Anchura | Descripción |
|:-----------|:--------|:------------|
| `sm` | 40rem (640px) | Móviles en horizontal |
| `md` | 48rem (768px) | Tablets |
| `lg` | 64rem (1024px) | Escritorio pequeño |
| `xl` | 80rem (1280px) | Escritorio grande |

### Mixin responsive

```scss
@mixin respond($breakpoint) {
  @if $breakpoint == sm {
    @media (max-width: 40rem) { @content; }
  } @else if $breakpoint == md {
    @media (max-width: 48rem) { @content; }
  } @else if $breakpoint == lg {
    @media (max-width: 64rem) { @content; }
  } @else if $breakpoint == xl {
    @media (min-width: 80rem) { @content; }
  }
}
```

## 4.7. Sombras y bordes

| Variable | Valor | Uso |
|:---------|:------|:----|
| `$shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Sombras sutiles |
| `$shadow-md` | 0 4px 6px rgba(0,0,0,0.1) | Tarjetas y paneles |
| `$shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | Modales y dropdowns |
| `$shadow-xl` | 0 20px 25px rgba(0,0,0,0.15) | Elementos flotantes |
| `$radius-sm` | 4px | Inputs y botones |
| `$radius-md` | 8px | Tarjetas |
| `$radius-lg` | 16px | Modales |
| `$radius-full` | 9999px | Badges y avatares |

## 4.8. Transiciones

```scss
$transition-base: all 0.3s ease;
$transition-fast: all 0.15s ease;
```

Usadas en:
- Hover de botones (cambio de color).
- Apertura/cierre de sidebar (transformación).
- Transiciones de tema claro/oscuro.
- Aparición de toasts.

## 4.9. Metodología BEM

Los componentes siguen la metodología **BEM (Bloque, Elemento, Modificador)**:

```scss
// Bloque
.common-button {
  display: inline-flex;
  padding: $space-3 $space-6;

  // Elemento
  &__icon {
    width: 20px;
    height: 20px;
  }

  // Modificador
  &--primary {
    background-color: $primary-500;
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
```

## 4.10. Componentes reutilizables

### CommonButton

Botón reutilizable con variantes:

| Propiedad | Valores | Default |
|:----------|:--------|:--------|
| `variant` | `primary`, `secondary`, `ghost`, `danger` | `primary` |
| `size` | `sm`, `md`, `lg` | `md` |
| `disabled` | `boolean` | `false` |

### FormInput

Input de formulario con:

- Label flotante.
- Mensaje de error.
- Icono opcional.
- Validación visual (verde/rojo).

### Toast

Sistema de notificaciones:

- **Tipos**: `success`, `error`, `warning`, `info`.
- **Duración**: 5 segundos por defecto.
- **Posición**: Esquina superior derecha.
- **Animación**: Slide-in desde arriba, fade-out.

### Modal

Ventana modal con:

- Overlay semitransparente.
- Cierre al hacer clic fuera o con Escape.
- Encabezado, cuerpo y pie personalizables.
- Animación de entrada/salida.

### Pagination

Control de paginación con:

- Navegación página a página.
- Botones de primera/última página.
- Indicador de página actual.
- Número total de elementos.

### Graph

Contenedor de gráficas (Chart.js):

- Configurable por tipo (línea, barra, doughnut).
- Responsive.
- Tooltips interactivos.
- Leyenda personalizable.

## 4.11. Wireframes y mocup de las pantallas principales
Si desea ver el prototipado del diseño puedes verlo accediendo a este enlace: https://www.figma.com/design/VztmIawRHGdIuaUTIr0zf5/proyecto-CRCoach?m=auto&t=mFPQd8h2B7hKbcSa-1
