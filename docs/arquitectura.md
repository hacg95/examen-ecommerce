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


## 2. Selección del stack tecnológico y diseño de carpetas

### ¿Por qué Angular para el frontend?

Angular fue seleccionado porque el ejercicio requiere una aplicación web con navegación, consumo de APIs, manejo de estado de interfaz, formularios, validaciones y componentes reutilizables. Para este tipo de solución Angular aporta una estructura definida desde el framework y reduce decisiones accidentales sobre organización.

En este proyecto se utilizan componentes standalone, servicios para encapsular comunicación HTTP, routing para las vistas de productos y carrito, modelos TypeScript y una organización por `features`.

La elección favorece tipado estático, inyección de dependencias, separación entre componentes y servicios, routing integrado, reutilización y capacidad de prueba.

### ¿Por qué NestJS para el backend?

NestJS fue seleccionado porque el dominio requiere exponer una API HTTP con varias responsabilidades de negocio: productos, carrito, cupones, descuentos y control de stock.

NestJS proporciona de forma nativa módulos, controladores, servicios, DTOs e inyección de dependencias. Esto permite representar esas responsabilidades sin construir manualmente una infraestructura alrededor de Express.

```text
backend/src/
├── products/
├── cart/
├── discounts/
└── coupons/
```

La organización por dominio/feature busca que los elementos que cambian por una misma razón permanezcan juntos. Esto mejora cohesión, navegación del código, mantenibilidad y capacidad de prueba.

### ¿Por qué un monorepositorio?

```text
examen-ecommerce/
├── frontend/
└── backend/
```

Para el alcance de la prueba, un único repositorio simplifica versionamiento, revisión y entrega. Frontend y backend conservan independencia de dependencias y ejecución, pero evolucionan dentro del mismo repositorio.

No se introdujo una solución de microservicios porque el dominio y la escala de la prueba no justificaban el costo operativo y de coordinación adicional.

## 3. Trade-offs de arquitectura asumidos

### 3.1 Simplicidad vs. extensibilidad

Se eligió un backend modular en un único proceso NestJS en lugar de microservicios.

**Beneficio:** menor complejidad operacional, desarrollo más rápido y debugging sencillo.

**Costo:** los módulos comparten proceso y despliegue. Si en el futuro inventario, promociones u órdenes necesitaran escalar independientemente, sería necesario evolucionar la arquitectura.

### 3.2 Estado en memoria/JSON vs. persistencia real

Para el alcance del ejercicio se utiliza una solución de persistencia liviana y estado en memoria.

**Beneficio:** reduce infraestructura y permite concentrarse en reglas de negocio e integración.

**Costo:** no existe durabilidad completa, concurrencia multiinstancia ni garantías transaccionales equivalentes a una base de datos.

En producción, productos, carritos, cupones e inventario deberían respaldarse con persistencia real y mecanismos de concurrencia adecuados.

### 3.3 Claridad del cálculo vs. optimización prematura

El cálculo de descuentos se ejecuta de manera síncrona y secuencial.

**Beneficio:** comportamiento determinista, fácil de probar y suficientemente rápido para el volumen del ejercicio.

**Costo:** con miles de reglas promocionales o dependencias externas podría ser necesario optimizar, cachear o desacoplar parte del cálculo.

Se priorizó claridad del algoritmo y velocidad de entrega sobre optimizaciones no justificadas por el alcance.

### 3.4 Reglas en backend vs. duplicación en frontend

Las reglas críticas —stock, validez del cupón y descuentos— se mantienen en el backend.

El frontend puede repetir algunas validaciones para mejorar UX, pero la decisión final pertenece al servidor.

### 3.5 Abstracción mínima vs. complejidad futura

No se creó una abstracción independiente para cada posible necesidad futura. Por ejemplo, no existe un módulo de Checkout ni una capa completa de repositorios.

**Beneficio:** menor complejidad accidental.

**Costo:** cuando aparezcan órdenes, pagos o persistencia productiva habrá que introducir nuevas abstracciones.

El criterio fue aplicar YAGNI de forma pragmática: crear una abstracción cuando exista una responsabilidad real.

## 4. Aislamiento del motor matemático de descuentos

Una decisión central fue separar las reglas matemáticas de descuentos de los controladores HTTP y de la persistencia.

```text
HTTP Request
    ↓
Controller
    ↓
CartService
    ↓
DiscountsService
    ↓
DiscountResult
```

Los controladores se ocupan del transporte HTTP. `CartService` coordina el caso de uso. `DiscountsService` encapsula el algoritmo matemático.

El motor no necesita conocer rutas HTTP, `Request`, `Response` ni detalles de Angular.

También queda aislado de la fuente de datos:

```text
JSON / futura DB
       ↓
ProductsService / CouponsService
       ↓
modelos de dominio
       ↓
DiscountsService
```

Por lo tanto, cambiar JSON por PostgreSQL, DynamoDB u otra fuente no debería obligar a reescribir las fórmulas del motor de descuentos.

## 5. Patrones de diseño aplicados

### Patrón 1: Service Layer — implementado

La solución utiliza **Service Layer** para encapsular operaciones y reglas fuera de controladores y componentes.

```text
ProductsController → ProductsService
CartController     → CartService
CartService        → ProductsService
CartService        → DiscountsService
CouponsController  → CouponsService
```

Esto permite probar lógica sin depender directamente de HTTP, reutilizar servicios y mantener controladores delgados.

### Patrón 2: Dependency Injection / Inversion of Control — implementado

NestJS y Angular utilizan **Dependency Injection** como mecanismo central de colaboración.

El contenedor de NestJS resuelve las implementaciones. Esto reduce acoplamiento y facilita pruebas con mocks o providers alternativos.

### Evolución opcional: Strategy para reglas de descuento

Si el número de promociones creciera, el siguiente patrón natural sería **Strategy**:

```ts
export interface DiscountStrategy {
  apply(context: DiscountContext): AppliedDiscount | null;
}
```

```ts
@Injectable()
export class TechDiscountStrategy implements DiscountStrategy {
  apply(context: DiscountContext): AppliedDiscount | null {
    // regla TECH
  }
}
```

El motor podría iterar estrategias:

```ts
for (const strategy of this.strategies) {
  const result = strategy.apply(context);

  if (result) {
    context.apply(result);
  }
}
```

Esto facilitaría agregar nuevas reglas promocionales.

## 6. Backend: arquitectura modular por dominio

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

## 7. Separación de responsabilidades

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

## 8. Frontend: arquitectura por features

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

## 9. Integración frontend-backend

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

## 10. Manejo de stock

Una decisión importante durante el desarrollo fue convertir
`ProductsService` en el responsable del stock disponible. Inicialmente
el stock disponible se derivaba a partir de la cantidad del carrito;
posteriormente se modificó el diseño para actualizar la fuente de stock
al agregar o retirar productos.

La razón de centralizar esta responsabilidad es evitar que diferentes
módulos mantengan versiones independientes del inventario.

Para una solución productiva, esta responsabilidad debería respaldarse
con persistencia y mecanismos transaccionales/concurrentes en una base
de datos o servicio de inventario.

## 11. Modelos y contratos

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

## 12. Manejo de errores y estados

La interfaz contempla estados de carga, no encontrado y errores
provenientes del backend. En el carrito, los errores se presentan cerca
de la acción correspondiente; por ejemplo, un cupón inválido se informa
junto al campo del cupón.

Esta decisión mejora la trazabilidad de la interacción para el usuario y
evita mensajes genéricos sin contexto.

## 13. Pruebas y validación

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

## 14. Persistencia y alcance

La solución fue construida para el alcance de una prueba técnica. No se
incorporó una capa completa de persistencia ni infraestructura propia de
un e-commerce productivo.

Esta simplificación reduce complejidad accidental y permite concentrarse
en el dominio solicitado. Su consecuencia es que el estado en memoria no
ofrece durabilidad ni garantías de concurrencia equivalentes a una
solución con base de datos.

## 15. Principios y patrones identificables

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

## 16. Evolución posible

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
