# Arquitectura y decisiones técnicas

## 1. Objetivo

Este documento describe las principales decisiones de arquitectura del
proyecto `examen-ecommerce` y su justificación dentro del alcance de la
prueba técnica.

La solución está organizada como un monorepositorio con dos aplicaciones
independientes:

``` text
examen-ecommerce/
├── frontend/   # Angular
└── backend/    # NestJS
```

La separación permite mantener responsabilidades claras: Angular se
ocupa de presentación, navegación y experiencia de usuario; NestJS
concentra reglas de negocio, estado del carrito, productos, stock,
cupones y descuentos.

## 2. Backend: arquitectura modular por dominio

El backend se organiza alrededor de funcionalidades de negocio:

``` text
backend/src/
├── products/
├── cart/
├── discounts/
└── coupons/
```

Esta organización evita concentrar toda la lógica en un único servicio y
permite que cada módulo tenga una responsabilidad identificable.

### Products

Responsable del catálogo y de las operaciones relacionadas con
productos. Durante la evolución del ejercicio también asumió la
actualización del stock disponible cuando se agregan o retiran unidades
del carrito.

Endpoints principales:

``` http
GET /api/products
GET /api/products/:id
```

### Cart

Responsable de las operaciones del carrito y de coordinar las
dependencias necesarias para construir su estado: productos, cantidades,
subtotal, descuentos y total.

Entre las operaciones integradas con el frontend están:

``` http
GET    /api/cart/items
POST   /api/cart/items
DELETE /api/cart/items/:productId
```

### Discounts

La lógica de descuentos se mantiene separada de la gestión del carrito.
Esto evita que `CartService` tenga que conocer todos los detalles de
cada regla comercial y facilita probar las reglas de forma aislada.

Las reglas implementadas en el ejercicio incluyen descuentos por tipo de
producto, cupones, descuento por umbral de compra y un límite global
máximo del 35 %.

Los descuentos se procesan de manera secuencial. Por ejemplo, si un
valor de 100 recibe primero 10 %, queda en 90; un descuento posterior
del 15 % se calcula sobre 90, no nuevamente sobre 100.

El límite máximo se refleja explícitamente en la respuesta del carrito
mediante el estado `discountLimitReached`, permitiendo que el frontend
muestre el mensaje correspondiente cuando el porcentaje alcanza el 35 %.

### Coupons

Responsable de validar los cupones y proporcionar la información de
descuento asociada. La lógica evolucionó para evitar un porcentaje de
cupón fijo en el servicio de descuentos: el porcentaje se obtiene de la
información del cupón, por ejemplo mediante `coupon.discount / 100`.

Esto reduce el acoplamiento entre la definición de un cupón y el
algoritmo general de descuentos.

## 3. Separación de responsabilidades

La decisión central es mantener la lógica de negocio en el backend y no
duplicarla en la interfaz.

El frontend solicita operaciones y presenta el resultado. El backend
conserva la responsabilidad de determinar si una operación es válida,
actualizar stock, validar cupones y calcular importes.

Ejemplos:

-   El frontend limita la cantidad seleccionable para mejorar la
    experiencia, pero el backend sigue siendo la autoridad sobre el
    stock.
-   El estado del límite del 35 % se expone explícitamente desde el
    backend en lugar de depender únicamente de una comparación visual en
    Angular.
-   Los porcentajes de cupones se obtienen del modelo de cupón y no de
    una constante codificada en la vista.

## 4. Frontend: arquitectura por features

El frontend Angular está organizado por funcionalidades:

``` text
src/app/
├── features/
│   ├── products/
│   │   ├── product-list/
│   │   ├── product-detail/
│   │   ├── services/
│   │   └── models/
│   └── cart/
│       ├── cart/
│       ├── services/
│       └── models/
├── shared/
│   └── components/
└── app.routes.ts
```

Se utilizan componentes standalone de Angular. La estructura por feature
mantiene juntos los componentes, modelos y servicios pertenecientes a un
mismo contexto funcional.

Los elementos reutilizables que no pertenecen exclusivamente a una
pantalla se ubican en `shared`, como el componente de tarjeta de
producto.

## 5. Integración frontend-backend

El frontend consume el backend mediante servicios Angular. Esto evita
dispersar llamadas HTTP en los componentes y permite que los componentes
se concentren en el estado de presentación y en las acciones del
usuario.

El flujo de producto incluye:

1.  Cargar el catálogo.
2.  Navegar a `/product/:id`.
3.  Consultar `GET /api/products/:id`.
4.  Seleccionar una cantidad válida.
5.  Ejecutar el POST del carrito.
6.  Tras una adición exitosa, navegar al carrito.

El carrito carga su información desde el backend, permite aplicar
cupones, eliminar productos y presenta los errores de la API junto al
elemento que originó la operación.

## 6. Manejo de stock

Una decisión importante durante el desarrollo fue convertir
`ProductsService` en el responsable del stock disponible. Inicialmente
el stock disponible se derivaba a partir de la cantidad del carrito;
posteriormente se modificó el diseño para actualizar la fuente de stock
al agregar o retirar productos.

Ejemplo conceptual:

``` text
Stock inicial: 10
Agregar al carrito: 2
Stock disponible: 8
Eliminar del carrito: 2
Stock disponible: 10
```

La razón de centralizar esta responsabilidad es evitar que diferentes
módulos mantengan versiones independientes del inventario.

Para una solución productiva, esta responsabilidad debería respaldarse
con persistencia y mecanismos transaccionales/concurrentes en una base
de datos o servicio de inventario.

## 7. Modelos y contratos

Se utilizan interfaces, enums y modelos explícitos para representar
conceptos como productos, tipos de producto, elementos del carrito y
resultados de descuento.

Esto aporta:

-   tipado estático;
-   contratos comprensibles entre capas;
-   menor dependencia de objetos sin estructura;
-   facilidad para modificar la implementación sin cambiar
    innecesariamente el contrato.

El frontend mantiene modelos compatibles con las respuestas del backend,
pero los modelos de petición y respuesta no tienen que ser idénticos.
Una operación para agregar un producto puede requerir únicamente
identificador y cantidad, mientras la respuesta del carrito contiene
información enriquecida.

## 8. Manejo de errores y estados

La interfaz contempla estados de carga, no encontrado y errores
provenientes del backend. En el carrito, los errores se presentan cerca
de la acción correspondiente; por ejemplo, un cupón inválido se informa
junto al campo del cupón.

Esta decisión mejora la trazabilidad de la interacción para el usuario y
evita mensajes genéricos sin contexto.

## 9. Pruebas y validación

El backend utiliza Jest y Supertest. El frontend utiliza el sistema de
pruebas de Angular con Vitest instalado en el proyecto.

Durante la implementación se ejecutaron pruebas y compilaciones después
de cambios relevantes. La conversación de desarrollo registra, entre
otros casos, validaciones de:

-   servicios de productos;
-   carrito;
-   descuentos;
-   cupones;
-   rutas y componentes Angular;
-   compilación del backend;
-   compilación del frontend;
-   configuración de rutas dinámicas con SSR.

El objetivo no fue únicamente comprobar que el código compilara, sino
detectar regresiones cuando cambiaban contratos compartidos, stock o
reglas de descuentos.

## 10. Persistencia y alcance

La solución fue construida para el alcance de una prueba técnica. No se
incorporó una capa completa de persistencia ni infraestructura propia de
un e-commerce productivo.

Esta simplificación reduce complejidad accidental y permite concentrarse
en el dominio solicitado. Su consecuencia es que el estado en memoria no
ofrece durabilidad ni garantías de concurrencia equivalentes a una
solución con base de datos.

## 11. Por qué no existe un módulo Checkout

No se implementó `CheckoutModule`, `CheckoutService` ni
`CheckoutController`.

El alcance desarrollado cubre catálogo, carrito, descuentos, cupones y
cálculo del estado actual de la compra. Crear un módulo de checkout sin
existir todavía conceptos como orden, pago, confirmación transaccional,
idempotencia o reserva persistente de inventario habría añadido una
abstracción sin una responsabilidad suficiente dentro del ejercicio.

En una evolución real, Checkout podría extraerse cuando el flujo
requiera, por ejemplo:

-   creación de órdenes;
-   integración con proveedor de pagos;
-   reserva transaccional de inventario;
-   idempotencia;
-   confirmación o compensación de operaciones;
-   eventos y notificaciones posteriores a la compra.

## 12. Principios y patrones identificables

La solución aplica principalmente principios pragmáticos de diseño:

-   **Separación de responsabilidades:** productos, carrito, cupones y
    descuentos tienen servicios diferenciados.
-   **Modularidad por feature/dominio:** tanto NestJS como Angular
    agrupan código por funcionalidad.
-   **Inyección de dependencias:** los servicios colaboran mediante el
    mecanismo de DI de NestJS y Angular.
-   **Service Layer:** las reglas y acceso a operaciones se encapsulan
    en servicios en lugar de ubicarse directamente en controladores o
    vistas.
-   **DTO/modelos explícitos:** se definen contratos tipados para las
    operaciones y respuestas.
-   **Single Source of Truth para reglas críticas:** el backend es la
    autoridad para stock, validación y descuentos.

No es necesario presentar la solución como una implementación completa
de Clean Architecture, DDD o microservicios. La arquitectura es una
aplicación modular cliente-servidor adecuada al tamaño y al alcance de
la prueba.

## 13. Evolución posible

Si el sistema creciera, las siguientes mejoras serían naturales:

1.  Repositorios y persistencia real para productos, carrito, cupones y
    órdenes.
2.  Base de datos con control transaccional de inventario.
3.  Autenticación y carritos asociados a usuarios.
4.  Módulo de órdenes/checkout cuando exista un proceso de compra real.
5.  Integración de pagos e idempotencia.
6.  Observabilidad, logs estructurados y métricas.
7.  Mayor cobertura e integración end-to-end.
8.  Contenedorización y pipeline CI/CD.

Estas extensiones no invalidan la arquitectura actual; representan
responsabilidades que pueden añadirse cuando el dominio y los requisitos
las justifiquen.
