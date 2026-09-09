# Examen E-commerce

Aplicación e-commerce desarrollada como solución de una prueba técnica,
con frontend en Angular y backend en NestJS. La aplicación permite
consultar productos, ver su detalle, agregar productos al carrito,
controlar cantidades según el stock disponible, eliminar productos,
aplicar cupones y calcular descuentos.

## Estructura del proyecto

``` text
examen-ecommerce/
├── frontend/   # Angular
└── backend/    # NestJS
```

## Tecnologías

### Frontend

-   Angular 22.x
-   Angular CLI 22.1.7
-   Angular SSR
-   TypeScript 6.x
-   RxJS 7.8
-   Vitest 4

### Backend

-   NestJS 12.x
-   TypeScript 6.x
-   Jest 30
-   Supertest 7
-   RxJS 7.8

## Requisitos previos

-   Node.js compatible con las dependencias del proyecto.
-   npm.
-   Git, si se desea clonar el repositorio.

## Instalación

Desde la raíz del repositorio, instalar las dependencias de cada
aplicación por separado.

### Backend

``` bash
cd backend
npm install
```

### Frontend

``` bash
cd frontend
npm install
```

## Ejecución en desarrollo

La aplicación utiliza dos procesos independientes.

### 1. Backend

``` bash
cd backend
npm run start:dev
```

El backend queda disponible normalmente en:

``` text
http://localhost:3000
```

### 2. Frontend

En otra terminal:

``` bash
cd frontend
npm start
```

El frontend queda disponible normalmente en:

``` text
http://localhost:4200
```

## Funcionalidades principales

-   Listado de productos.
-   Consulta del detalle de un producto.
-   Control de stock disponible.
-   Selección de una o más unidades sin superar el stock.
-   Adición de productos al carrito.
-   Eliminación de productos del carrito.
-   Actualización del stock al agregar o retirar productos.
-   Resumen de subtotal, descuentos y total.
-   Validación y aplicación de cupones.
-   Aplicación de reglas de descuento.
-   Límite máximo de descuento del 35 %.
-   Visualización de estados de carga y errores en el frontend.

## API utilizada por el frontend

Entre los endpoints integrados durante el desarrollo se encuentran:

``` http
GET    /api/products
GET    /api/products/:id
GET    /api/cart/items
POST   /api/cart/items
DELETE /api/cart/items/:productId
POST   /api/coupons
DELETE /api/coupons/:couponCode
```

## Pruebas

### Backend

Ejecutar todas las pruebas:

``` bash
cd backend
npm test
```

Modo observación:

``` bash
npm run test:watch
```

Cobertura:

``` bash
npm run test:cov
```

Pruebas end-to-end:

``` bash
npm run test:e2e
```

### Frontend

``` bash
cd frontend
npm test
```

Durante el desarrollo también se utilizó la ejecución no interactiva:

``` bash
npm test -- --no-watch --no-progress
```

## Compilación

### Backend

``` bash
cd backend
npm run build
```

### Frontend

``` bash
cd frontend
npm run build
```

## Notas de implementación

Para el alcance de la prueba técnica, el catálogo y el estado de la
aplicación se manejan con una solución liviana y no se implementó un
proceso transaccional independiente de checkout. La solución se
concentra en productos, carrito, cupones y reglas de descuento.

En una evolución productiva podrían incorporarse persistencia en base de
datos, autenticación/autorización, órdenes, pagos, reserva transaccional
de inventario, observabilidad e idempotencia.
