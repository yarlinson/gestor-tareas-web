# Gestor de Tareas — cliente web (Next.js)

Cliente web del [Gestor de Tareas](https://github.com/yarlinson/gestor-tareas-java), una API REST hecha con Spring Boot. Permite registrarse, organizar tareas con prioridades y etiquetas, ver avisos de vencimiento y, con rol de administrador, consultar estadísticas y usuarios.

- **Demo en vivo:** <https://gestor-tareas-web-omega.vercel.app>
- **API desplegada:** <https://gestor-tareas-yv7x.onrender.com> (documentación en Swagger UI)
- **Repositorio de la API:** <https://github.com/yarlinson/gestor-tareas-java>

> La API está en un plan gratuito que se apaga tras 15 minutos sin tráfico. La primera visita después de un rato puede tardar de uno a tres minutos; la pantalla de acceso lo avisa y despierta la API mientras escribes tus datos.

## Qué incluye

- **Sesión** con registro e inicio de sesión (JWT), y cierre automático con un aviso si el token expira.
- **Tareas:** crear rápido solo con el título o con el formulario completo, editar, completar y eliminar.
- **Prioridad, fecha límite y etiquetas** (con autocompletado de las que ya existen).
- **Búsqueda y filtros** por texto, estado, prioridad, etiqueta y "solo vencidas", con orden y paginación.
- **Avisos:** campana con el número de avisos sin leer, que se actualiza sola cada minuto.
- **Panel de administración** (solo rol `ADMIN`): totales, listado de usuarios y ejecución manual de los recordatorios.
- Modo oscuro automático según el sistema, diseño adaptable a móvil y navegación por teclado.

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

## Estructura

```
src/
├── app/            Rutas (/ y /admin), diseño raíz y estilos globales
├── components/     Pantallas y piezas de interfaz (tareas, etiquetas, avisos, administración)
└── lib/            Cliente de la API, sesión, hooks de datos, tipos y utilidades
```

## Pruebas

Esta versión no incluye pruebas automáticas. Se verificó con `tsc`, `eslint` y la compilación de producción, y a mano contra una API local: registro, inicio de sesión, creación y edición de tareas, filtros, avisos, panel de administración con una cuenta administradora y rechazo con una cuenta normal, y la vista en un teléfono.
