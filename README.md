# Gestor de Tareas — cliente web (Next.js)

Cliente web del [Gestor de Tareas](https://github.com/yarlinson/gestor-tareas-java), una API REST hecha con Spring Boot. Permite registrarse, organizar tareas con prioridades y etiquetas, ver un resumen del día, planificarlas en un calendario, recibir avisos de vencimiento y, con rol de administrador, consultar estadísticas y usuarios.

- **Demo en vivo:** <https://gestor-tareas-web-omega.vercel.app>
- **API desplegada:** <https://gestor-tareas-yv7x.onrender.com> (documentación en Swagger UI)
- **Repositorio de la API:** <https://github.com/yarlinson/gestor-tareas-java>

> La API está en un plan gratuito que se apaga tras 15 minutos sin tráfico. La primera visita después de un rato puede tardar de uno a tres minutos; la pantalla de acceso lo avisa y despierta la API mientras escribes tus datos.

## Qué incluye

- **Sesión** con registro e inicio de sesión (JWT), y cierre automático con un aviso si el token expira.
- **Resumen** (`/`): atrasadas, para hoy, próximos 7 días y pendientes en una fila de totales; avance de hechas sobre el total; pendientes por prioridad; y las listas "Atrasadas" y "Lo que viene".
- **Calendario** (`/calendario`): vista de mes (semana desde el lunes) y vista de agenda. Cada día muestra sus tareas; al tocarlo se ven todas y se puede crear una con esa fecha ya puesta. Las tareas **sin plazo** quedan aparte, junto al calendario.
- **Tareas** (`/tareas`): crear rápido solo con el título o con el formulario completo, editar, completar y eliminar.
- **Prioridad, fecha límite y etiquetas** (con autocompletado de las que ya existen).
- **Búsqueda y filtros** por texto, estado, prioridad, etiqueta y "solo vencidas", con orden y paginación.
- **Avisos:** campana con el número de avisos sin leer, que se actualiza sola cada minuto.
- **Panel de administración** (solo rol `ADMIN`): totales, listado de usuarios y ejecución manual de los recordatorios.
- **Modo claro u oscuro con un botón** en el encabezado y en la pantalla de acceso. Sigue al sistema hasta que la persona elige, y entonces recuerda su elección.
- Diseño adaptable a móvil y navegación por teclado.

> El resumen y el calendario usan dos endpoints de la API: `GET /api/tareas/resumen` y los filtros `desde`, `hasta` y `sinFecha` de `GET /api/tareas`. Si despliegas esta web, despliega antes la versión de la API que los incluye.

## Tecnologías

| Área | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, sin librerías de componentes |
| Lenguaje | TypeScript en modo estricto |
| Datos | TanStack Query 5 (caché, invalidación y reintentos) |
| Calidad | ESLint con las reglas de React Compiler, `tsc` |
| Despliegue | Vercel |

## Cómo ejecutarlo

Requiere Node.js 20.9 o superior y una API en funcionamiento.

```powershell
npm install
Copy-Item .env.example .env.local      # y ajusta NEXT_PUBLIC_API_URL
npm run dev
```

La aplicación queda en <http://localhost:3000>. Por defecto apunta a `http://localhost:8080`; para usar la API desplegada, pon su URL en `NEXT_PUBLIC_API_URL`.

**La API debe permitir el origen de la web (CORS).** El navegador bloquea las llamadas entre dominios distintos salvo que la API las autorice. En la API, la variable `CORS_ALLOWED_ORIGINS` debe incluir el origen desde el que se abre esta web, por ejemplo `http://localhost:3000` en desarrollo y la URL de Vercel en producción. Si no, la aplicación mostrará que no pudo conectar.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación de producción |
| `npm run lint` | Análisis estático con ESLint |

## Despliegue en Vercel

1. Importa este repositorio en [Vercel](https://vercel.com/new); detecta Next.js solo.
2. En **Settings → Environment Variables** define `NEXT_PUBLIC_API_URL` con la URL pública de la API (sin barra final) y despliega. Esa variable viaja en el código del navegador: no pongas secretos en ella.
3. Copia la URL que Vercel te asigna (por ejemplo `https://gestor-tareas-web.vercel.app`) y agrégala a `CORS_ALLOWED_ORIGINS` en la API (en Render, **Environment**), separada por coma de las demás. Son orígenes exactos: cada dominio, incluido el de una vista previa de Vercel, debe estar en la lista.

## Decisiones de diseño

- **Token en `localStorage`.** Es la opción más simple y funciona con la API tal como está, pero un script malicioso en la página podría leerlo (XSS). Por eso la interfaz no inserta HTML de terceros: todo el contenido se muestra como texto y React lo escapa. La alternativa más estricta, una cookie `httpOnly` emitida por un servidor intermedio, exigiría más infraestructura y complicaría el límite de intentos por IP de la API. Está explicado en [`src/lib/session.ts`](src/lib/session.ts).
- **La sesión como almacén externo.** El token se lee con `useSyncExternalStore`, así que el estado de React se mantiene sincronizado con `localStorage` sin efectos que actualicen estado y sin desajustes de hidratación entre el servidor y el navegador.
- **El rol solo decide qué se muestra.** Ocultar la administración a quien no es `ADMIN` es una comodidad; la autorización real la hace la API, que responde 403 a cualquier otro usuario.
- **Cliente de API con errores tipados.** Todas las llamadas pasan por [`src/lib/api.ts`](src/lib/api.ts): convierte las respuestas de error (formato RFC 7807) en un `ApiError` con el detalle por campo, vacía la sesión ante un 401 y reconoce el `Retry-After` de los límites de intentos.
- **Caché con TanStack Query.** Cada mutación invalida solo lo que cambia (por ejemplo, editar la fecha límite de una tarea también refresca los avisos, porque la API los reinicia). Al paginar se conserva la página anterior mientras llega la siguiente.
- **Modal con `<dialog>` nativo.** El navegador se ocupa de atrapar el foco, cerrar con Escape y bloquear el fondo, sin dependencias.
- **Arranque en frío.** Al abrir la pantalla de acceso se envía un `fetch` silencioso a `/actuator/health` para despertar la API, y si el inicio de sesión tarda más de 6 segundos se explica por qué.
- **El tema se decide antes de pintar.** Un guion mínimo en el `<head>` ([`src/app/layout.tsx`](src/app/layout.tsx)) lee la elección guardada (o, si no hay, la del sistema) y escribe `data-tema` en `<html>` antes del primer pintado, así no hay destello de claro al abrir en oscuro. Después, React lo lee con `useSyncExternalStore` ([`src/lib/tema.ts`](src/lib/tema.ts)); la elección se guarda en `localStorage` y se sincroniza entre pestañas.
- **El calendario pide solo lo que dibuja.** Trae las tareas con fecha entre el primer y el último día de la cuadrícula visible (`desde` y `hasta`, ambos inclusivos), así que el servidor filtra y no se descargan todas las tareas. Las que no tienen fecha van por otra consulta (`sinFecha`). Todas las consultas de tareas empiezan por la clave `["tareas", …]`, de modo que completar o editar una tarea refresca a la vez la lista, el resumen y el calendario.
- **Fechas sin horas.** Una fecha límite es un día, no un instante. Las celdas se calculan con fechas `AAAA-MM-DD` y aritmética en UTC ([`src/lib/calendario.ts`](src/lib/calendario.ts)), para que el huso horario del navegador no corra una tarea al día anterior o siguiente. El primer día de la semana es una constante (`PRIMER_DIA_DE_LA_SEMANA`).
- **"Hoy" sigue a la API.** El día de hoy se calcula en `America/Bogota` ([`src/lib/hoy.ts`](src/lib/hoy.ts)), la misma zona que usa la API por defecto (`APP_TIMEZONE`) para decidir qué está vencido. Si cambias una, cambia la otra; si no, el resumen y el calendario podrían discrepar de la API alrededor de la medianoche.

## Identidad visual

La interfaz imita una **hoja de contabilidad** (el libro contable de papel verde claro). En una lista de tareas lo que decide es el plazo, y un libro contable ya tiene un lenguaje para leer cantidades, saldos y totales.

- **El plazo es el protagonista.** Cada fila empieza con los días que faltan en números grandes. Lo atrasado se escribe en rojo y entre paréntesis, como un saldo negativo: `(4)`. La administración sigue la misma idea: un balance con conceptos unidos por puntos a su cantidad.
- **Filas con reglas, no tarjetas.** Columnas (plazo, tarea, prioridad), líneas finas entre filas y doble raya en los totales. Las etiquetas se listan con una línea de puntos hacia su cantidad, como en el índice de un libro.
- **Dos tintas de bolígrafo.** El rojo es solo para el atraso; el azul, para lo hecho, los enlaces y el foco. Al completar una tarea, una línea azul tacha el título: es la única animación y responde a una acción (se respeta `prefers-reduced-motion`).
- **La prioridad se lee por la forma, no por el color:** tres barras de altura creciente y la palabra. Se entiende sin distinguir colores y deja el rojo libre para el atraso.
- **Tipografía.** Source Serif 4 para el contenido y Barlow Condensed para columnas, botones y números, con cifras tabulares.
- **Resumen y calendario con el mismo lenguaje.** El resumen es una fila de totales con doble raya, como el pie de una hoja contable; las atrasadas llevan el saldo en rojo y entre paréntesis. En el calendario, la raya a la izquierda de cada tarea es más gruesa cuanto mayor es la prioridad, lo atrasado va en rojo y lo hecho, tachado; en móvil cada día se reduce a puntos y el detalle se abre al tocarlo.
- **Modo claro y oscuro** ("tinta nocturna") con las mismas tintas aclaradas. Los contrastes de texto se calcularon: el peor caso es 5,75:1 en claro y 7,47:1 en oscuro (el mínimo es 4,5:1), y la línea de los campos llega a 3,07:1 (el mínimo para bordes de controles es 3:1).

Los colores y los estilos comunes están en [`src/app/globals.css`](src/app/globals.css) como variables CSS, así que cambiar la paleta es tocar un solo bloque.

## Estructura

```
src/
├── app/            Rutas (/, /tareas, /calendario y /admin), diseño raíz y estilos globales
├── components/     Pantallas y piezas de interfaz (resumen, calendario, tareas, etiquetas, avisos, administración, tema)
└── lib/            Cliente de la API, sesión, tema, hooks de datos, calendario, tipos y utilidades
```

## Pruebas

Esta versión no incluye pruebas automáticas. Se verificó con `tsc`, `eslint` y la compilación de producción, y a mano contra una API local: registro, inicio de sesión, creación y edición de tareas, filtros, avisos, panel de administración con una cuenta administradora y rechazo con una cuenta normal, el resumen y el calendario (mes y agenda, crear una tarea desde un día, completarla y ver el resumen actualizarse, cambio de mes) en claro y en oscuro, y la vista en un teléfono. La lógica de fechas del calendario (`src/lib/calendario.ts`) está pensada para probarse con pruebas unitarias; es lo siguiente que falta.
