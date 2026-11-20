---
name: BautistaGo Logistics & Delivery
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#414752'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#717783'
  outline-variant: '#c1c6d4'
  surface-tint: '#005faf'
  primary: '#005dac'
  on-primary: '#ffffff'
  primary-container: '#1976d2'
  on-primary-container: '#fffdff'
  inverse-primary: '#a5c8ff'
  secondary: '#b7131a'
  on-secondary: '#ffffff'
  secondary-container: '#db322f'
  on-secondary-container: '#fffbff'
  tertiary: '#765800'
  on-tertiary: '#ffffff'
  tertiary-container: '#956f00'
  on-tertiary-container: '#fffdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a5c8ff'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#004786'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ac'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000d'
  tertiary-fixed: '#ffdf9e'
  tertiary-fixed-dim: '#fabd00'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Montserrat
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

Este sistema de diseño articula la convergencia entre el dinamismo del delivery de comida rápida tradicional mexicana y la precisión logística de una Progressive Web App (PWA). Inspirado en el cerdito repartidor en scooter, la personalidad de la interfaz equilibra calidez popular, apetito y rigor operativo: transmite velocidad sin caos, confianza técnica en el rastreo y accesibilidad inmediata bajo cualquier condición de iluminación ambiental exterior.

El estilo visual adopta un **Moderno Táctil Corporativo**, optimizado para terminales móviles en campo y clientes en movimiento. Las superficies son limpias y luminosas, con énfasis en el alto contraste, contornos redondeados que transmiten amabilidad, y objetivos táctiles sobredimensionados diseñados para operar con una sola mano o en entornos de vibración y luz solar directa.

## Colors

La paleta cromática traduce directamente los códigos visuales de la flota de reparto:

- **Primario (#1976D2 - Azul Corporativo):** Representa la certeza logística, barras de navegación superior, encabezados estructurales, rutas activas y estados operativos críticos como "En camino".
- **Secundario (#E53935 - Rojo Carnitas):** Evoca el apetito, la tradición taquera y la urgencia de compra. Es el color exclusivo para llamadas a la acción primarias (CTAs), botones de confirmación de pedido y alertas críticas.
- **Terciario (#FFC107 - Amarillo Scooter):** Provee dinamismo y visibilidad táctica para badges de estado intermedio ("Preparando pedido"), ratings por estrellas, alertas flotantes y destaques de promociones rápidas.
- **Superficies y Fondos Cálidos (#FFF3E0 / #FFCCBC):** Tintes sutiles que aportan confort visual, utilizados en tarjetas de platillos seleccionados, fondos de banners y selectores de porciones.
- **Neutro Oscuro (#212121 - Carbón Profundo):** Asegura legibilidad de ratio WCAG AAA contra fondos blancos (#FFFFFF) y neutros secundarios (#F8F9FA), pensado específicamente para visibilidad en pantalla bajo el rayo del sol.

## Typography

La estructura tipográfica se sustenta en dos familias que combinan solidez industrial y claridad de datos:

- **Montserrat (Display, Encabezados y Botones):** Su geometría firme, peso visual y terminaciones abiertas otorgan impacto a títulos de platillos, precios globales y elementos interactivos prioritarios.
- **Work Sans (Cuerpo, Desglose de Gramajes y Datos Operativos):** Diseñada para una claridad neutral impecable, maneja la lectura continua, descripciones de ingredientes, variantes por peso (1/4 kg, 1/2 kg, tacos surtidos) y especificaciones de entrega sin fatiga visual.

Para el contexto móvil prioritario, los niveles `display-lg` escalan automáticamente a versiones compactas de 30px para preservar la jerarquía sin romper líneas en títulos de seguimiento en vivo.

## Layout & Spacing

El sistema opera bajo una cuadrícula adaptativa mobile-first con escala base de 8px (con subdivisión de 4px para alineaciones de datos compactos):

- **Mobile (<768px):** Cuadrícula fluida de 4 columnas con márgenes laterales de 16px (`1rem`) y canaletas de 16px. El contenido se apila verticalmente, garantizando que los contenedores de compra y barras de estado ocupen el ancho completo utilizable.
- **Tablet / Desktop (≥768px):** Cuadrícula de 12 columnas centrada en un ancho máximo de 1200px con márgenes exteriores de 32px (`2rem`) y canaletas de 24px (`1.5rem`), separando el flujo del menú del panel de seguimiento y carrito persistente.

Las áreas táctiles críticas respetan una altura mínima estricta de 48px, permitiendo interacción ágil con pulgares durante traslados o pedidos exprés.

## Elevation & Depth

La tridimensionalidad se construye mediante sombras ambientales multicapa suaves, formuladas para evitar bordes sucios y mantener frescura sin recurrir al skeuomorfismo pesado:

- **Nivel 0 (Base plana):** Superficie `#F8F9FA` para el canvas general; sin elevación.
- **Nivel 1 (Tarjetas de producto y celdas de lista):** Superficie `#FFFFFF` con `box-shadow: 0 2px 8px -2px rgba(33, 33, 33, 0.06), 0 1px 3px rgba(33, 33, 33, 0.04)`.
- **Nivel 2 (Paneles interactivos, modales de gramaje y menús desplegables):** `box-shadow: 0 8px 24px -4px rgba(25, 118, 210, 0.12), 0 4px 12px rgba(33, 33, 33, 0.06)`. El ligero tinte azul refuerza la identidad logística.
- **Nivel 3 (Floating Action Buttons y banners persistentes de seguimiento):** `box-shadow: 0 12px 32px -6px rgba(229, 57, 53, 0.25), 0 6px 16px rgba(33, 33, 33, 0.08)`. El tinte cálido resalta la acción prioritaria de entrega inmediata.

## Shapes

La morfología del sistema privilegia radios marcados para proyectar cercanía, comodidad ergonómica y simpatía visual alineada con la mascota en scooter:

- Los elementos base (inputs, botones compactos, chips) aplican un radio de 8px (`0.5rem`).
- Los contenedores principales (tarjetas de producto, contenedores de pedido y modales de personalización) emplean `rounded-lg` (16px / `1rem`) y `rounded-xl` (24px / `1.5rem`).
- Elementos flotantes como contadores de tacos, badges de estado y selectores flotantes de sucursales adoptan contornos completos en píldora (`9999px`) para un acabado táctil y fluido.

## Components

### Botones Principales y Acciones Rápidas
- **CTA Primario (Hacer Pedido / Confirmar):** Fondo `#E53935`, texto `#FFFFFF` en tipografía Montserrat semi-bold, altura mínima de 48px, esquinas `rounded-lg`. Al presionar, aplica una transición de escala de `scale(0.98)` y sombra acentuada.
- **Botón Secundario / Rastreo:** Fondo `#1976D2`, texto `#FFFFFF`. Utilizado exclusivamente para "Ver ruta", "Contactar repartidor" y "Detalles logísticos".
- **Controles de Cantidad (+ / -):** Contenedor pill con fondo `#FFF3E0`, iconos en `#212121` y cifras en Montserrat Bold, garantizando precisión táctil al sumar cuartos de kilo o complementos.

### Tarjetas de Menú y Productos
- Contenedor en fondo `#FFFFFF` con radio `rounded-lg`, borde sutil de 1px en `#EEEEEE` y sombra Nivel 1.
- Miniatura de producto destacada con etiqueta flotante tipo pill (ej. "Más pedido", "Recién salido del cazo") en color `#FFC107` con texto `#212121`.
- Bloque inferior con tipografía Work Sans para gramajes precisos y precio alineado en Montserrat Bold.

### Chips y Filtros de Categoría
- Estados inactivos: fondo `#FFFFFF`, borde perimetral de 1.5px `#E0E0E0`, texto `#212121`.
- Estados activos: fondo `#1976D2`, texto `#FFFFFF`, borde `#1976D2`, acompañados de micro-iconos (maciza, costilla, chamorro, salsas).

### Campos de Entrada (Dirección y Notas)
- Altura estándar de 48px, fondo `#FFFFFF`, borde de 1.5px en `#CFD8DC`.
- Estado de foco: borde perimetral en `#1976D2` con un halo tenue `rgba(25, 118, 210, 0.15)`.

### Checkboxes y Selectores de Salsa / Complementos
- Diámetro y dimensiones de 24x24px para evitar deslices táctiles.
- Estado activo en `#E53935` con marca de verificación blanca nítida.

### Panel de Rastreo Logístico ("Pedido en Camino")
- Tarjeta fija inferior de altura dinámica. Encabezado en `#1976D2` con avatar del cerdito en scooter, barra de progreso segmentada en tres fases (Cazo -> En camino -> Entregado) con animación de pulso en el segmento activo usando `#FFC107`.