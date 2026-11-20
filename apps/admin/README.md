# BautistaGo — Panel Administrador (Web Admin)

Panel web gerencial para el propietario y administradores de **Carnitas Bautista** (San Miguel de Allende).

- **Stack**: Next.js 16 (React 19, Turbopack, PWA), TypeScript strict, Tailwind CSS, Recharts, Zustand, Axios, Lucide React.
- **Rol requerido**: `ADMIN` (RBAC estricto verificado en frontend y backend).
- **Puerto por defecto**: `http://localhost:3000`

---

## 1. Alcance y Funcionalidades

### 🔐 Autenticación & RBAC (`/login`)
- Inicio de sesión con correo y contraseña contra `POST /api/auth/login`.
- Validación estricta de rol: únicamente usuarios con rol `ADMIN` pueden acceder al panel.
- Almacenamiento seguro de tokens JWT (access y refresh) con interceptores Axios para inyección automática de cabecera `Authorization: Bearer <token>` y redirección en expiración (401).

### 📊 Tablero Analítico (`/dashboard`)
- Integración con `GET /api/analytics/dashboard?startDate&endDate`.
- **Selector de rango de fechas**:
  - Presets rápidos: *Hoy*, *Últimos 7 días*, *Últimos 30 días*, *Este Mes*.
  - Rango personalizado con selectores de fecha de inicio y fin.
- **KPI Cards**:
  - Ventas Totales ($MXN con formato de moneda).
  - Ticket Promedio ($MXN).
  - Pedidos Totales entregados.
  - Producto Estrella / Más Vendido.
- **Gráfica de Ventas**:
  - Gráfica interactiva de barras con Recharts mostrando los productos con mayor demanda.
  - Flujo alternativo (CDU_8): muestra aviso "Sin datos para el periodo" cuando no hay ventas en el rango seleccionado.

### 🥩 Catálogo & Control de Cazo (`/catalog`)
- Integración con `GET /api/products?includeAll=true`, `POST /api/products`, `PATCH /api/products/:id`, `PATCH /api/products/:id/availability`, `DELETE /api/products/:id`.
- Tabla maestra con búsqueda en tiempo real por nombre/descripción y filtros por categoría y disponibilidad.
- **Toggle de disponibilidad**: conmutación inmediata de stock (disponible / agotado) con reflejo instantáneo en la app cliente.
- **Modal de Alta y Edición**: formulario validado (nombre, descripción, precio positivo, pesaje por kilo/gramos/pieza, categoría y URL de foto opcional).
- **Eliminación lógica**: confirmación modal para baja lógica de producto.

### 👥 Personal & Reparto (`/staff`)
- Integración con `GET /api/users/employees`, `POST /api/users/employees`, `DELETE /api/users/:id`, `PATCH /api/users/:id/reactivate`.
- Tabla de nómina con avatares, roles diferenciados (`KITCHEN_OPERATOR`, `DELIVERY_DRIVER`, `ADMIN`), datos de contacto y placas de vehículo.
- **Modal de Alta de Empleado**: registro con rol RBAC, contraseña temporal, teléfono y placa de vehículo si es repartidor.
- **Desactivación / Reactivación lógica**: botón de encendido con modal de confirmación para revocar o restituir accesos al instante.

---

## 2. Comandos de Ejecución

Desde la raíz del monorepo `BautistaGo-Web`:

```bash
# Instalar dependencias
pnpm install

# Correr en modo desarrollo (puerto 3000)
pnpm --filter admin dev

# Verificación de tipos TypeScript
pnpm --filter admin run type-check

# Compilar para producción (Next.js Turbopack)
pnpm --filter admin run build

# Iniciar servidor de producción
pnpm --filter admin start
```

---

## 3. Variables de Entorno

Crear un archivo `.env.local` en `apps/admin/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
