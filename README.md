# QhuriNet · Consola

**Prototipo HTML estático** de la consola web de **QhuriNet**, una plataforma que
conecta a quien **genera** residuos reciclables (vecinos, bodegas y pequeños
comercios) con **recicladores urbanos**.

**Curso:** 1ASI0705 · Arquitectura de Aplicaciones Web.

> **Es una simulación visual, sin backend ni persistencia.** No hay servidor,
> base de datos, API ni autenticación real. Todo el estado vive en JavaScript
> dentro del navegador; lo que no está representado en la URL se pierde al
> recargar. Los datos (anuncios, recojos, chats, puntos, tickets,
> notificaciones) son constantes de muestra escritas a mano. La app real se
> construye en Spring Boot y Angular; este archivo es su referencia visual.

Publicado en GitHub Pages: <https://nicolasrjs.github.io/qhurinet-prototipo/>

```
qhurinet-prototipo/
├─ index.html            ← la maqueta completa: marcado, estilos y estado
├─ support.js            ← runtime mínimo que la hace navegable en el navegador
├─ tests/flows.test.cjs  ← pruebas de la lógica de rutas y acciones (node --test)
├─ public/images/        ← biblioteca de assets SVG (ver su README)
├─ TRAZABILIDAD.md       ← qué elemento de cada pantalla está implementado, simulado o decorativo
└─ .vscode/settings.json ← silencia los falsos positivos del validador CSS
```

## Cómo abrirlo

**Doble clic a `index.html`** o servir la carpeta por HTTP:

```
python -m http.server 8000
```

`support.js` interpreta la plantilla: mueve `<helmet>` al `<head>`, resuelve
`{{ }}`, `sc-if` y `sc-for`, ata `onClick` / `onChange` / `onKeyDown`, aplica
`style-hover` y provee la clase `DCLogic`. Cada cambio de estado repinta el árbol
entero y devuelve el foco al campo donde se estaba escribiendo. Además escribe en
el query string la pestaña, el rol y los estados listados más abajo, y los lee
al arrancar y al usar Atrás/Adelante. Con `file://` los deep links funcionan al
abrir, pero la barra no se actualiza al navegar: el navegador no permite tocar el
historial en ese origen.

Sin frameworks ni dependencias externas; la única petición a la red es la
tipografía IBM Plex desde Google Fonts.

## Roles y navegación

La consola tiene dos caras, que se alternan con el botón **MODO** de la barra
lateral (`REC` ⇄ `GEN`) o con el tipo de cuenta elegido en la pantalla de acceso:

| Rol            | Pestañas                                        | Entra como |
| -------------- | ----------------------------------------------- | ---------- |
| **Reciclador** | Mapa · Recojos · Chats · Perfil · Soporte        | Ciudadano  |
| **Generador**  | Publicar · Anuncios · Chats · Perfil · Soporte   | Bodega o comercio |

Mapa y Recojos son exclusivas del reciclador; Publicar y Anuncios, del
generador. Chats, Perfil y Soporte existen en ambos roles.

## Pantallas

Base: `https://nicolasrjs.github.io/qhurinet-prototipo/`

| Pantalla | Rol | Enlace directo |
| --- | --- | --- |
| Inicio de sesión | — | [`?screen=login`](https://nicolasrjs.github.io/qhurinet-prototipo/?screen=login) |
| Registro | — | [`?screen=register`](https://nicolasrjs.github.io/qhurinet-prototipo/?screen=register) |
| Mapa (anuncios) | Reciclador | [`?role=reciclador&defaultTab=mapa`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=mapa) |
| Mapa (puntos de reciclaje) | Reciclador | [`?role=reciclador&defaultTab=mapa&view=puntos`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=mapa&view=puntos) |
| Recojos | Reciclador | [`?role=reciclador&defaultTab=recojos`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=recojos) |
| Chats (reciclador) | Reciclador | [`?role=reciclador&defaultTab=chats`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=chats) |
| Perfil (reciclador) | Reciclador | [`?role=reciclador&defaultTab=perfil`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=perfil) |
| Soporte (reciclador) | Reciclador | [`?role=reciclador&defaultTab=soporte`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=soporte) |
| Publicar | Generador | [`?role=generador&defaultTab=publicar`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=generador&defaultTab=publicar) |
| Anuncios | Generador | [`?role=generador&defaultTab=publicaciones`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=generador&defaultTab=publicaciones) |
| Chats (generador) | Generador | [`?role=generador&defaultTab=chats`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=generador&defaultTab=chats) |
| Perfil (generador) | Generador | [`?role=generador&defaultTab=perfil`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=generador&defaultTab=perfil) |
| Soporte (generador) | Generador | [`?role=generador&defaultTab=soporte`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=generador&defaultTab=soporte) |
| Centro de notificaciones | Ambos | [`?role=generador&defaultTab=publicar&notif=1`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=generador&defaultTab=publicar&notif=1) |
| Editar perfil | Ambos | [`?defaultTab=perfil&edit=perfil`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=perfil&edit=perfil) |
| Documentos de verificación | Ambos | [`?defaultTab=perfil&docs=1`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=perfil&docs=1) |
| Agregar método de pago | Ambos | [`?defaultTab=perfil&pay=1`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=perfil&pay=1) |
| Detalle de un punto | Reciclador | [`?defaultTab=mapa&view=puntos&point=p1`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=mapa&view=puntos&point=p1) |
| Rutas guardadas | Reciclador | [`?defaultTab=mapa&panel=rutas`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=mapa&panel=rutas) |
| Seguimiento del recolector | Generador | [`?defaultTab=publicaciones&track=g1`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=generador&defaultTab=publicaciones&track=g1) |
| Escáner QR | Reciclador | [`?defaultTab=recojos&dialog=qr&row=r2`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=recojos&dialog=qr&row=r2) |
| Reprogramar recolección | Ambos | [`?defaultTab=recojos&dialog=reprogramar&row=r2`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=recojos&dialog=reprogramar&row=r2) |
| Cancelar recolección | Ambos | [`?defaultTab=publicaciones&dialog=cancelar&row=g2`](https://nicolasrjs.github.io/qhurinet-prototipo/?role=generador&defaultTab=publicaciones&dialog=cancelar&row=g2) |

La valoración posterior a la entrega no tiene URL: se llega confirmando una
entrega en el escáner.

## Parámetros de URL

Todos viajan en el query string. `support.js` los escribe al navegar (así el
enlace de la barra reproduce lo que se ve) y los valida al leerlos: un valor
desconocido se ignora y se conserva el dato de muestra. Un `#hash` no significa
nada y se descarta.

### Navegación

| Parámetro | Valores | Qué hace |
| --- | --- | --- |
| `defaultTab` | `mapa`, `recojos`, `chats`, `publicar`, `publicaciones`, `perfil`, `soporte` | Pestaña visible. Si es exclusiva de un rol, ese rol se deduce de ella. Por defecto `mapa`. |
| `role` | `reciclador`, `generador` | Rol en las pestañas compartidas (`chats`, `perfil`, `soporte`). En las exclusivas manda la pestaña y la barra lo omite. Por defecto `reciclador`. |

### Acceso

| Parámetro | Valores | Qué hace |
| --- | --- | --- |
| `screen` | `login`, `register` | Muestra la pantalla de acceso en lugar de la aplicación. Al entrar desaparece. |
| `account` | `ciudadano`, `bodega` | Tipo de cuenta preseleccionado en la pantalla de acceso. `ciudadano` entra como reciclador y `bodega` como generador. Solo se escribe mientras `screen` está presente. |

### Mapa

| Parámetro | Valores | Qué hace |
| --- | --- | --- |
| `view` | `anuncios`, `puntos` | Lista y pines activos: anuncios de material o puntos fijos de reciclaje. Por defecto `anuncios`. |
| `q` | texto | Búsqueda por nombre y dirección (sin distinguir mayúsculas ni tildes). Escribir no crea entradas de historial. |
| `material` | `carton`, `pet`, `vidrio`, `metal`, `plastico` | Chip de material activo. `plastico` incluye PET; `pet` limita a PET. |
| `type` | `acopio`, `bodega`, `reciclador`, `municipal` | Chip de tipo de punto activo (solo en la vista de puntos). |
| `hidden` | tipos separados por comas | Tipos de punto ocultados desde la leyenda. |
| `point` | `p1` … `p8` | Punto con el panel de detalle abierto. |
| `near`, `heavy`, `today` | `1` | Filtros «Cerca de mí» (≤ 5 km), «+20 kg» y «Hoy» activos. Los dos últimos solo afectan a anuncios. |

### Ruta activa y rutas guardadas

| Parámetro | Valores | Qué hace |
| --- | --- | --- |
| `stops` | ids separados por comas (`a1`, `a2`, `p1`…) o `none` | Paradas de la ruta activa, en orden. Por defecto `a1,a2`. |
| `opt` | `1` | La ruta se muestra optimizada por vecino más cercano. |
| `route` | `centro`, `costa`, `sur` | Carga una de las rutas guardadas de ejemplo. |
| `panel` | `rutas` | Abre el panel de rutas guardadas (solo en el mapa). |

### Recojos, Anuncios y Chats

| Parámetro | Valores | Qué hace |
| --- | --- | --- |
| `dialog` | `guardar`, `reprogramar`, `cancelar`, `qr` | Diálogo abierto: guardar ruta, reprogramar, cancelar o escáner QR. Los tres últimos necesitan `row`. |
| `row` | `r1`…`r4`, `g1`…`g4`, `n1`… | Fila sobre la que actúa `dialog`. `n1`… son anuncios publicados desde el formulario. |
| `menu` | id de fila | Fila con el menú «⋯» desplegado. |
| `priority` | ids separados por comas | Filas marcadas como prioritarias. |
| `updates` | JSON `{ "r2": { "state", "date", "slot", "reason" } }` | Cambios confirmados por fila: estado (`Reprogramado`, `Cancelado`, `Completado`), fecha y franja, motivo. Se valida al leerlo. |
| `date`, `slot` | `AAAA-MM-DD`, una franja de `08:00–11:00` … `18:00–21:00` | Precargan el diálogo de reprogramación. No se escriben de vuelta. |
| `thread` | `t1`, `t2`, `t3` | Conversación abierta en Chats. |
| `chatRow` | id de fila | Entrega mostrada en el panel derecho de Chats. |
| `track` | `g1` | Seguimiento del recolector abierto (solo generador, solo entregas «En camino»). |
| `progress` | `0` … `100` | Avance inicial del seguimiento. |

### Cuenta, perfil y soporte

| Parámetro | Valores | Qué hace |
| --- | --- | --- |
| `notif` | `1` | Panel de notificaciones abierto. |
| `read` | ids separados por comas (`nr1`…`nr6`, `ng1`…`ng6`) | Notificaciones marcadas como leídas. Sin el parámetro, las tres primeras de cada rol están sin leer. |
| `edit` | `perfil` | Diálogo «Editar perfil» abierto (en Perfil). |
| `profile` | JSON `{ "name", "phone", "bio", "mats" }` | Cambios guardados del perfil. Solo se escriben los campos que difieren de los datos de muestra. |
| `docs` | `1` | Diálogo de documentos abierto (en Perfil). |
| `uploaded` | JSON `[{ "type", "name", "date" }]` | Documentos subidos. `type` es `DNI`, `RUC` u `Otro`; aparecen como aprobados. |
| `pay` | `1` | Diálogo «Agregar método de pago» abierto (en Perfil). |
| `methods` | JSON `[{ "kind", "detail" }]` | Métodos agregados. `kind` es `yape`, `plin`, `tarjeta`, `transferencia` o `efectivo`; reciben ids `m3`, `m4`… |
| `payDefault` | `m1`, `m2`, `m3`… | Método predeterminado. `m1` (tarjeta) es el valor por defecto y no se escribe. |
| `pubs` | JSON `[{ "mats", "kg", "window", "pay", "note" }]` | Anuncios publicados desde Publicar; aparecen al inicio de la tabla de Anuncios con ids `n1`, `n2`… |
| `tickets` | JSON `[{ "title", "category", "evidence" }]` | Tickets creados desde Soporte; aparecen al inicio de «Mis tickets» con ids `#4950`, `#4951`… |

Los valores JSON van codificados por `URLSearchParams`; la forma más simple de
obtenerlos es reproducir el estado en la interfaz y copiar la barra.

## Cómo simula la interacción

Todo vive en el `<script type="text/x-dc">` del final de `index.html`, en una
clase `Component extends DCLogic`:

- **Datos de muestra** en constantes al inicio: `ADS`, `RECYCLING_POINTS`,
  `POINT_TYPES`, `THREADS`, `CONVOS`, `FAQ_DATA`, `PICKUPS`, `PUBLICATIONS`,
  `SAVED_ROUTES`, `DOCUMENTS`, `PAY_METHODS`, `TICKETS`, `NOTIFICATIONS`.
- **Catálogo de materiales**: `carton`, `pet`, `vidrio`, `metal` y `plastico`
  (`MAT_ORDER` y `MAP_MATERIALS`). Es el mismo en el formulario de Publicar,
  los filtros del mapa, los materiales aceptados por cada punto y el perfil.
- `state` es lo único que cambia al hacer clic. `readMapState`,
  `readFlowState` y `readAccountState` lo reconstruyen desde la URL;
  `routeParams()` y `accountParams()` lo escriben de vuelta.
- `renderVals()` devuelve los valores y acciones que interpola el marcado;
  `afterRender()` mantiene el foco de los diálogos y el temporizador del
  seguimiento.
- Las métricas de ruta se calculan sobre coordenadas relativas: 80 m por
  unidad, 15 km/h y 3 min por parada. La sugerencia de material de Publicar es
  una búsqueda de palabras clave en la nota y el nombre de la foto, con un
  porcentaje de confianza fijo por material.

## Pruebas

`node --test tests/flows.test.cjs` comprueba cálculos de ruta, optimización,
guardado, aislamiento de filas, validación de fechas y motivos, códigos de
entrega, roles y lectura de la URL. Usa solo módulos incluidos en Node.js.

## Limitaciones conocidas

- **Sin persistencia.** Al recargar solo vuelve lo representado en la URL.
  Mensajes enviados, anuncios reclamados, rutas creadas o eliminadas, la
  valoración y los borradores de los diálogos se reinician.
- **Las imágenes no viajan en la URL.** La foto de perfil, la del anuncio y la
  evidencia del reporte se leen del archivo elegido como data URL y viven solo
  en memoria; un enlace no las aguanta. El nombre del archivo sí se conserva en
  documentos y tickets.
- **El inicio de sesión pide el tipo de cuenta** porque no hay backend que lo
  deduzca del correo. Google y Facebook entran con el tipo elegido sin OAuth.
  Cualquier correo con formato válido y contraseña de 8 caracteres entra.
- **Los anuncios publicados desde el formulario** (`n1`…) exponen el mismo menú
  que los precargados, pero no tienen conversación propia: «Abrir chat» los
  lleva al hilo de muestra `t3`, y no pueden seguirse porque nacen «Esperando».
- **La validación de documentos es automática por diseño:** cualquier archivo
  entra como aprobado, sin revisar su contenido.
- **Las pestañas de estado** de Recojos y Anuncios (Activos · Completados ·
  Cancelados) muestran contadores pero no filtran la tabla.
- **Cifras de muestra fijas:** resumen del mes, materiales del mes, historial de
  actividad, valoraciones recibidas y los datos de contraparte del chat
  (valoración, entregas, verificado) no cambian con las acciones.
- **Textos de muestra fuera del catálogo:** filas precargadas como «Papel de
  oficina» y el desglose «Papel y cartón» del resumen del mes conservan
  materiales que ya no están en el catálogo de cinco.
- **Decorativos por decisión:** Guardar borrador, Ajustar punto, Llamar ahora,
  Ver anuncio, PDF/CSV, la tarjeta «Anuncios nuevos», el badge de activos y el
  clic sobre tickets. Ver `TRAZABILIDAD.md`.
- **Sin servicios reales:** no hay mapa geográfico, geolocalización, cámara ni
  lector de QR (el escáner acepta el código de muestra de cada entrega) ni
  clasificador de imágenes.
- **La URL crece** con los estados serializados en JSON; sigue siendo válida
  pero es larga de leer.
- Los controles originales usan `<div onClick>` y no reciben foco por teclado;
  los agregados después usan botones y campos con etiquetas accesibles.

## Assets

La biblioteca vive en [`public/images/`](public/images/README.md): logotipo,
favicon, íconos de navegación, materiales, avatares e ilustraciones, todo en
SVG. **Los íconos que ve el prototipo van embebidos en `index.html`**, no
cargados por ruta: el artboard se publica en un sandbox que bloquea las
peticiones a archivos vecinos. El dibujo embebido y el archivo de
`public/images/` son el mismo trazo; al tocar uno hay que tocar el otro.

## Sobre los avisos del editor

VS Code reporta errores de CSS en `index.html` (`at-rule or selector expected`,
`property value expected`). Son falsos positivos: su validador no entiende la
interpolación `{{ expr }}` dentro de `style="…"`, que el runtime resuelve antes
de pintar. `.vscode/settings.json` los desactiva con
`"html.validate.styles": false` (requiere recargar la ventana).

## Para quien lo implemente en Angular

El propio `index.html` es la fuente de verdad visual: paleta, tipografía, escala
de espaciado, radios, variantes de botón y formato de datos es-PE (coma decimal,
miles con espacio, horas en 24 h) están resueltos ahí, en los estilos en línea.
`TRAZABILIDAD.md` dice qué comportamiento existe de verdad y qué es solo
apariencia.
