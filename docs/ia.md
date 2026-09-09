# Documentación de co-creación y gobernanza de IA

## 1. Propósito

Este documento registra el uso de inteligencia artificial durante el
desarrollo de `examen-ecommerce`, particularmente GitHub Copilot, y
describe cómo se mantuvo la responsabilidad humana sobre requisitos,
decisiones y validación.

La IA se utilizó como herramienta de asistencia para inspeccionar el
código existente, proponer e implementar cambios, ejecutar pruebas y
builds, detectar errores y realizar ajustes iterativos. La conversación
de Copilot se conservó como evidencia del proceso de co-creación.

## 2. Rol de la IA

GitHub Copilot actuó como asistente de desarrollo, no como propietario
de los requisitos ni como autoridad final de las decisiones.

Entre las actividades observadas en la conversación están:

-   inspección de componentes, servicios, modelos, rutas y contratos
    existentes;
-   generación de parches de código;
-   conexión del frontend con endpoints del backend;
-   creación y ajuste de pruebas;
-   ejecución de `npm test` y `npm run build`;
-   corrección de problemas detectados por compilación o pruebas;
-   revisión de rutas Angular y configuración SSR;
-   refinamiento de la lógica de stock, descuentos y cupones.

## 3. Dirección humana del desarrollo

Los requerimientos funcionales fueron introducidos explícitamente por el
desarrollador mediante instrucciones a Copilot.

Ejemplos documentados en la conversación incluyen:

### Página de detalle de producto

Se solicitó que las tarjetas de producto navegaran al detalle, que la
página consumiera `GET /api/products/:id` y que mostrara información del
producto, stock y la acción para agregar al carrito.

### Página del carrito

El desarrollador indicó la ubicación de la página dentro de
`features/cart`, pidió conectarla con los endpoints del backend, mostrar
productos a la izquierda, resumen de valores a la derecha, permitir
ingresar un cupón y presentar los errores del backend junto al elemento
correspondiente.

### Cantidad y stock

Se solicitó un selector incremental que permitiera agregar una o más
unidades sin superar el stock. Posteriormente se especificó que el stock
debía recalcularse al agregar productos y restaurarse al retirarlos del
carrito.

### Navegación

Se pidió que, después de agregar correctamente un producto, el usuario
fuera redirigido inmediatamente al carrito.

### Límite de descuentos

El desarrollador solicitó mostrar exactamente el mensaje:

> Congratulations, you have reached the limit of discounts

cuando se alcanzara el límite máximo del 35 %.

### Porcentajes de cupones

La implementación fue refinada para obtener el porcentaje desde los
datos del cupón en lugar de mantener un 15 % fijo dentro de la lógica
productiva.

Estos ejemplos muestran un proceso iterativo en el que el desarrollador
define comportamiento esperado y Copilot propone o ejecuta cambios
técnicos para satisfacerlo.

## 4. Flujo de co-creación

El flujo utilizado puede resumirse así:

``` text
Requisito humano
      ↓
Inspección del código por Copilot
      ↓
Propuesta / modificación
      ↓
Build y pruebas
      ↓
Detección de problemas
      ↓
Corrección
      ↓
Nueva validación
      ↓
Revisión funcional del desarrollador
```

Este proceso es preferible a aceptar código generado sin validación
porque introduce puntos explícitos de verificación técnica.

## 5. Evidencia de validación

La conversación registra múltiples ejecuciones de validación después de
cambios relevantes.

Entre los comandos utilizados se encuentran:

``` bash
# Backend
npm test
npm run build

# Frontend
npm test -- --no-watch --no-progress
npm run build
```

También se ejecutaron pruebas enfocadas de servicios concretos del
backend durante modificaciones de descuentos, cupones, carrito y
productos.

En el frontend se corrigieron dependencias de pruebas relacionadas con
routing y se validó la configuración SSR de rutas dinámicas.

En otra iteración, la modificación del manejo de stock hizo fallar
inicialmente pruebas del carrito porque los mocks todavía representaban
el comportamiento anterior. Los fixtures fueron actualizados y las
pruebas se volvieron a ejecutar. Este caso es especialmente relevante
como evidencia de que la salida generada por IA no fue considerada
correcta únicamente por haber sido producida: se sometió a compilación y
pruebas.

## 6. Correcciones y refinamientos durante el proceso

La conversación evidencia que el desarrollo no fue una generación única
de código. Hubo cambios sucesivos guiados por comportamiento observado o
nuevos requisitos.

Algunos ejemplos:

-   Se ajustaron pruebas de componentes standalone después de introducir
    navegación.
-   Se configuró correctamente SSR para la ruta dinámica de detalle de
    producto.
-   Se eliminaron warnings de presupuesto CSS detectados durante el
    build.
-   La lógica de cupones se modificó para obtener el porcentaje desde
    `coupons.json` en vez de mantener un porcentaje fijo.
-   Se agregó `discountLimitReached` como estado explícito del backend
    para representar el límite del 35 %.
-   El manejo de stock evolucionó desde un cálculo derivado hacia una
    responsabilidad centralizada en `ProductsService`.
-   Los mocks y fixtures de pruebas se actualizaron cuando el contrato o
    comportamiento del sistema cambió.

## 7. Gobernanza de IA aplicada

### 7.1 Responsabilidad humana

El desarrollador conserva la responsabilidad sobre:

-   interpretación de los requisitos de la prueba;
-   aceptación o modificación de propuestas de IA;
-   comportamiento funcional esperado;
-   decisiones de alcance;
-   ejecución y revisión del resultado final;
-   sustentación técnica de la solución.

### 7.2 Validación técnica

El código generado o modificado con apoyo de IA se valida mediante una
combinación de:

-   compilación;
-   pruebas unitarias;
-   pruebas del frontend;
-   inspección de errores y diagnósticos;
-   comprobación de integración frontend-backend;
-   revisión funcional en ejecución.

### 7.3 Trazabilidad

La conversación completa de Copilot fue exportada y conservada en
Markdown. Esto permite reconstruir:

-   qué pidió el desarrollador;
-   qué interpretó la IA;
-   qué cambios realizó;
-   qué comandos de validación ejecutó;
-   qué errores aparecieron;
-   cómo se corrigieron.

Esta trazabilidad es importante porque diferencia el uso controlado de
IA de una entrega en la que no puede explicarse el origen de las
decisiones.

### 7.4 Principio de mínima confianza

Una sugerencia de IA no debe asumirse correcta por defecto. Para este
proyecto, la práctica observable fue validar cambios mediante pruebas y
build, y continuar iterando cuando esas validaciones detectaban
inconsistencias.

### 7.5 Control del alcance

No se documentan componentes inexistentes como si formaran parte de la
solución. En particular, el proyecto no implementa un módulo
independiente de Checkout. La documentación debe reflejar el código
entregado y no una arquitectura hipotética generada por IA.

## 8. Riesgos del uso de IA y mitigaciones

### Código técnicamente válido pero funcionalmente incorrecto

**Riesgo:** una implementación puede compilar sin satisfacer el
requisito.

**Mitigación:** revisión funcional y requisitos concretos definidos por
el desarrollador.

### Regresiones

**Riesgo:** un cambio en stock, descuentos o contratos puede romper otro
módulo.

**Mitigación:** ejecución repetida de pruebas y builds después de
cambios significativos.

### Hard coding de reglas

**Riesgo:** la IA puede resolver rápidamente un caso con valores fijos
que dificulten la evolución.

**Mitigación:** se refinó la lógica de cupones para obtener el
porcentaje desde los datos del cupón.

### Alucinación o documentación de elementos inexistentes

**Riesgo:** atribuir al proyecto módulos, patrones o infraestructura que
no existen.

**Mitigación:** documentación basada en el código y en la conversación
conservada. No se afirma que exista Checkout, base de datos o una
arquitectura de microservicios.

### Dependencia excesiva de la herramienta

**Riesgo:** no poder explicar el código durante la sustentación.

**Mitigación:** documentar las decisiones y preparar la defensa de
responsabilidades, contratos, trade-offs y evolución posible.

## 9. Qué debe poder defender el desarrollador

El uso de Copilot no reemplaza la comprensión de la solución. Para
sustentar el proyecto se debe poder explicar, como mínimo:

-   por qué el backend está dividido en productos, carrito, descuentos y
    cupones;
-   por qué las reglas de descuento pertenecen al backend;
-   cómo se aplican los descuentos secuenciales y el límite del 35 %;
-   por qué el porcentaje del cupón se obtiene de los datos y no de una
    constante;
-   cómo se actualiza y restaura el stock;
-   cómo Angular consume los endpoints mediante servicios;
-   por qué se utilizan componentes standalone y organización por
    features;
-   cómo se manejan errores y estados de carga;
-   qué verifican las pruebas;
-   qué limitaciones introduce mantener estado sin persistencia
    productiva;
-   por qué no se creó un módulo Checkout para este alcance.

## 10. Declaración de uso de IA

Para el desarrollo de esta solución se utilizó GitHub Copilot como
herramienta de asistencia de programación. La herramienta apoyó tareas
de análisis del código, generación y modificación de implementaciones,
ejecución de pruebas, diagnóstico y refinamiento. Los requerimientos
funcionales y el alcance fueron dirigidos por el desarrollador, y los
cambios se sometieron a validaciones mediante pruebas, compilación e
integración antes de considerarse parte de la solución.

La conversación de Copilot se conserva como evidencia del proceso de
co-creación y permite auditar la secuencia de instrucciones, cambios y
validaciones realizadas durante el desarrollo.

## 11. Conclusión

El uso de IA en `examen-ecommerce` se entiende como co-creación
asistida: la IA acelera exploración, implementación y diagnóstico,
mientras la responsabilidad por requisitos, aceptación, validación y
explicación técnica permanece en el desarrollador.

La principal medida de gobernanza aplicada fue mantener trazabilidad y
validar de forma repetida los cambios generados, en lugar de asumir que
una salida de IA es correcta por el solo hecho de haber sido generada.
