# QhuriNet · Consola

**Prototipo HTML estático** de la consola web de **QhuriNet**, una red que
conecta a quien **genera** residuos aprovechables con quien los **recicla**.

**Curso:** 1ASI0705 · Arquitectura de Aplicaciones Web.

**Es una simulación visual, sin backend**: no hay servidor, base de datos ni
API. Todo corre en el navegador y nada persiste al recargar.

> Esto no es la aplicación. Es una maqueta navegable para ver y acordar cómo se
> va a ver y cómo se va a sentir la consola. **La app real se construye en
> Spring Boot (backend) y Angular (frontend)**; este archivo es la referencia
> visual que se le entrega a esa implementación.
>
> Los números son de muestra. La búsqueda y los filtros del mapa sí operan
> sobre esos datos; los clics permiten reclamar anuncios, consultar lugares
> fijos y agregar puntos a una ruta simulada, sin backend.

Es un artboard de Claude Design (originalmente `QhuriNet Consola.dc.html`,
renombrado a `index.html` para publicarlo): un solo archivo con marcado,
estilos en línea y el estado de la maqueta, que el canvas renderiza en vivo.

```
qhurinet-html/
├─ index.html            ← la maqueta completa (todas las pantallas)
├─ support.js            ← runtime para abrirla en el navegador
├─ public/images/        ← biblioteca de assets (ver su README)
├─ tests/flows.test.cjs   ← pruebas de lógica sin dependencias
└─ .vscode/settings.json ← silencia los falsos positivos del validador CSS
```

## Cómo abrirlo

**Doble clic a `index.html`.** Se abre en el navegador y es navegable: cambias de
pestaña, reclamas un anuncio, escribes en el chat, abres el escáner.

Eso funciona gracias a `support.js`, que está al lado. El `index.html` lo pide en
su `<head>` pero el archivo no venía en la carpeta, y sin él el navegador no
entiende `sc-if` ni `sc-for`: dibujaba **las siete pantallas apiladas** y dejaba
los dos modales —que son `position: fixed`— encima tapando todo, sin forma de
cerrarlos porque tampoco había JS que atendiera la × ni Cancelar.

`support.js` interpreta lo justo para recorrer la maqueta: mueve `<helmet>` al
`<head>`, resuelve `{{ }}`, `sc-if` y `sc-for`, ata `onClick` / `onChange` /
`onKeyDown`, aplica `style-hover`, inserta los íconos de
`dangerouslySetInnerHTML` y provee la clase `DCLogic`. Cada cambio de estado
repinta el árbol entero y devuelve el foco y el cursor al campo donde estabas
escribiendo.

### Cada pantalla tiene su URL

Las siete pantallas viven en un solo archivo y se cambian con `setState`, que no
es una navegación. Para que aun así se puedan citar una por una, `support.js`
refleja la pestaña y el rol visibles en el **query string**, con los mismos
nombres que las props:

```
index.html?role=generador&defaultTab=publicar
index.html?role=generador&defaultTab=chats
```

La dirección se actualiza sola al cambiar de pestaña, **atrás** y **adelante**
del navegador funcionan, y recargar mantiene la pantalla. En las pestañas
exclusivas de un rol (`mapa`, `recojos`, `publicar`, `publicaciones`) el rol va
implícito y la barra lo omite: `?defaultTab=publicar` abre Publicar en modo
generador sin más. En las compartidas (`chats`, `perfil`, `soporte`) sí hace
falta `role`; sin él se abre como reciclador.

Con doble clic (`file://`) los deep links funcionan igual al abrir, pero la
barra no se actualiza al navegar: el navegador no deja tocar el historial en
ese origen. Un `#hash` en la URL no significa nada y se descarta.

> Pantallas citables: `mapa`, `recojos`, `publicar`, `publicaciones`, `chats`,
> `perfil`, `soporte`. Los dos modales —el escáner QR y la valoración tras
> confirmar la entrega— viven en el estado (`scannerOpen`, `rateOpen`) y no
> tienen URL: se llega haciendo clic.

## Las dos caras del producto

La consola cambia de navegación según el rol, con el botón **MODO** de la barra
lateral (`REC` ⇄ `GEN`). Las dos caras son simétricas: cada rol tiene su
pantalla de trabajo —el **mapa** donde el reciclador busca material,
**Publicar** donde el generador lo ofrece— y su pantalla de seguimiento, con la
misma estructura de tabla por estado, resumen del mes y desglose por material:
**Recojos** lista lo que el reciclador va a recoger, **Anuncios** lista lo que
el generador publicó y quién lo está recogiendo.

| Rol             | Pestañas                                              |
| --------------- | ----------------------------------------------------- |
| **Reciclador**  | Mapa · Recojos · Chats · Perfil · Soporte              |
| **Generador**   | Publicar · Anuncios · Chats · Perfil · Soporte         |

## Pantallas

| Pestaña      | Qué muestra                                                                  |
| ------------ | ---------------------------------------------------------------------------- |
| **Mapa**     | Anuncios y puntos fijos, búsqueda, filtros, detalle y ruta simulada           |
| **Recojos**  | Tabla de recojos por estado, resumen del mes y desglose por material          |
| **Chats**    | Hilos, conversación, y panel de la entrega en curso con el QR                 |
| **Publicar** | Formulario de anuncio con vista previa en vivo y ubicación en el mapa          |
| **Anuncios** | Tabla de publicaciones por estado, con el reciclador que reclamó cada una      |
| **Perfil**   | Datos, métodos de pago, historial, valoraciones y estado de verificación      |
| **Soporte**  | FAQ desplegable, llamada 24/7, reporte de casos y tickets                     |

Dos modales cruzan todas las pantallas: el **escáner QR** que confirma la
entrega y la **valoración** posterior.

### Cuenta, perfil y notificaciones

Antes de la aplicación hay una pantalla de acceso, y dentro de Perfil, Publicar
y Soporte hay estados que también viajan en la URL:

| Estado                              | Parámetros                                         |
| ----------------------------------- | -------------------------------------------------- |
| Inicio de sesión / registro         | `?screen=login` · `?screen=register` (+ `account=ciudadano\|bodega`) |
| Centro de notificaciones            | `notif=1` abre el panel · `read=nr1,ng2,…` marca leídas |
| Editar perfil                       | `defaultTab=perfil&edit=perfil` · cambios guardados en `profile={…}` |
| Documentos de verificación          | `defaultTab=perfil&docs=1` · subidos en `uploaded=[…]` |
| Método de pago                      | `defaultTab=perfil&pay=1` · nuevos en `methods=[…]` · `payDefault=m2` |
| Anuncios publicados desde Publicar  | `pubs=[…]` (aparecen en Anuncios)                  |
| Tickets creados desde Soporte       | `tickets=[…]`                                      |

Ciudadano entra como reciclador y bodega o comercio como generador. Las fotos
(perfil, anuncio, evidencia) se leen del archivo elegido y viven solo en
memoria: un data URL no cabe en un enlace.

### Propiedades configurables

`defaultTab` (enum) elige la pestaña inicial. Si apunta a una pantalla exclusiva
de un rol —`publicar` y `publicaciones` son del generador, `mapa` y `recojos`
del reciclador— el rol inicial se deduce de ahí.

`role` (enum: `reciclador` | `generador`, por defecto `reciclador`) fija el rol
inicial en las pestañas que existen en los dos lados: `chats`, `perfil` y
`soporte`. En las exclusivas manda la pestaña. El botón **MODO** sigue cambiando
el rol en caliente.

## Cómo simula la interacción

Todo vive en el `<script type="text/x-dc">` del final, en una clase
`Component extends DCLogic`:

- **Los datos de muestra** están en constantes al inicio: `ADS`, `RECYCLING_POINTS`, `POINT_TYPES`, `THREADS`,
  `CONVOS`, `FAQ_DATA`, `HEADERS`, `PICKUPS`, `PUBLICATIONS`, `SAVED_ROUTES` y
  `ROUTE_LOCATIONS`. Ahí se cambia el contenido de la maqueta.
- `state` — lo único que se mueve al hacer clic: qué anuncios están
  `claimed`, qué hilo de chat está abierto, qué chips de material y filtros
  están marcados, y si hay un modal en pantalla.
- `tab()` / `role()` — pestaña y rol visibles. El rol es explícito solo si se
  tocó el botón MODO; si no, se deduce de la pestaña.
- `renderVals()` — devuelve los valores y acciones que interpola el marcado.
- `afterRender()` — mantiene el foco de los diálogos y el temporizador del
  seguimiento. La animación actualiza solo posición, ETA y estado, sin repintar
  el resto de la página ni interrumpir los campos de texto.

La ruta parte de los anuncios `a1` y `a2` (32,5 kg). Agregar un punto fijo
incorpora una parada sin sumarle kilos; reclamar otro anuncio también lo añade
al recorrido. El orden, los números de los pines, el trazo, los kilos, los
kilómetros y los minutos se calculan a partir de la misma lista de paradas.

## Puntos de reciclaje y estados del mapa

Los ocho lugares de `RECYCLING_POINTS` son ficticios, permanentes y no tienen
cuenta ni conversación. Sus horarios, direcciones, distancias y calificaciones
son datos simulados. Los anuncios de `ADS` siguen siendo publicaciones temporales.

La lista lateral existente alterna **Anuncios / Puntos**. Los dos conjuntos de
pines conviven: anuncios blancos con kilos; acopio verde cuadrado, bodega amarilla
con forma de casa, reciclador terracota circular y municipal azul en rombo.
La leyenda muestra u oculta cada tipo de punto, también en su lista.

Buscar filtra nombre y dirección sin distinguir mayúsculas ni tildes. La búsqueda
y los filtros afectan a la lista y a los pines de la vista activa. Se puede combinar
un material, un tipo de punto y una búsqueda; pulsar otra vez el chip lo desactiva.
**Plástico** incluye PET y plástico general; **PET** limita a PET. **Cerca de mí**
usa hasta 5 km de distancia simulada. **+20 kg** y **Hoy** solo se aplican a anuncios.
La X y Escape cierran el detalle. **Agregar a ruta** actualiza la ruta activa sin
crear cuentas, chats ni anuncios.

Se pueden copiar estos enlaces; los cambios se reflejan en la URL y funcionan
con Atrás/Adelante. `role=reciclador` es opcional en la pestaña exclusiva `mapa`.

- [Anuncios](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=mapa&view=anuncios)
- [Puntos](https://nicolasrjs.github.io/qhurinet-prototipo/?role=reciclador&defaultTab=mapa&view=puntos)
- [Detalle del centro de acopio](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=mapa&view=puntos&point=p1)
- [Municipales que aceptan vidrio](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=mapa&view=puntos&type=municipal&material=vidrio)
- [Buscar por dirección](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=mapa&view=puntos&q=Salaverry)
- [Sin coincidencias](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=mapa&view=puntos&q=sin-coincidencias)
- [Acopios ocultos](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=mapa&view=puntos&hidden=acopio)

Parámetros: `view=anuncios|puntos`, `point=p1`…`p8`,
`material=carton|pet|vidrio|metal|plastico`, `type=acopio|bodega|reciclador|municipal`,
`q=texto`, `hidden=tipos,separados,por,comas`, `near=1`, `heavy=1`, `today=1`.
Los parámetros desconocidos de estas opciones se ignoran. La ruta activa
también se conserva en la URL mediante `stops`.

## Rutas, seguimiento y acciones de las recolecciones

**Optimizar ruta** ordena todas las paradas seleccionadas por vecino más cercano
desde la posición «TÚ». Si la heurística no mejora la distancia, conserva el
recorrido original. Los cálculos usan coordenadas relativas: cada unidad
representa 80 m, la velocidad media es de 15 km/h y se agregan 3 min por parada.
El recorrido termina en la última parada, sin retorno al origen. Son cifras
simuladas; no hay geolocalización ni servicio de mapas.

**Guardar ruta** solicita un nombre y una descripción opcional. Guarda una copia
del orden actual. **Rutas guardadas** incluye tres ejemplos (Centro, Costa y Sur),
permite cargar una ruta completa y eliminarla de la lista. Eliminar una ruta
guardada no borra la ruta activa. Las rutas creadas o eliminadas vuelven al estado
de muestra al recargar; las paradas de la ruta activa se recuperan desde el enlace.

Cada fila de **Recojos** (`r1`…`r4`) y **Anuncios** (`g1`…`g4`) tiene un menú «⋯»:
reprogramar con fecha y franja, cancelar con un motivo obligatorio y alternar
prioridad. La fila muestra el nuevo estado, horario, motivo y distintivo según
corresponda. Las filas completadas o canceladas conservan su historial y no
admiten reprogramación ni otra cancelación. Cancelar o completar un recojo retira
su parada asociada de la ruta; los contadores de activos y cancelados se actualizan.
Los dos roles mantienen sus conjuntos de datos de muestra independientes.

El generador puede **Seguir recolector** desde la fila `g1`, en camino, y desde su
chat. La posición avanza, disminuye la llegada estimada y al alcanzar el destino
se muestra «El recolector llegó a tu dirección». La demostración dura 60 segundos
desde el progreso cero. Cerrar la vista detiene su temporizador. No se completa
la recolección automáticamente al llegar.

**Abrir chat** conserva el rol de origen y la entrega seleccionada. Cada botón QR
abre la entrega de su fila. El escáner acepta su código de muestra (`QH-R1`,
`QH-R2`, etc.) y rechaza códigos de otras entregas. Confirmar por QR simulado o
por código completa esa fila y muestra su peso y contraparte en la valoración.

| Estado | Enlace de demostración |
| --- | --- |
| Ruta por optimizar | [Cinco paradas](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=mapa&stops=a1,a2,p8,p1,p7) |
| Ruta optimizada | [Orden y resumen recalculados](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=mapa&stops=a1,a2,p8,p1,p7&opt=1) |
| Guardar ruta | [Diálogo de guardado](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=mapa&stops=a1,a2,p1&dialog=guardar) |
| Rutas guardadas | [Panel con ejemplos](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=mapa&panel=rutas) |
| Ruta de ejemplo cargada | [Circuito de la costa](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=mapa&route=costa) |
| Seguimiento desde Anuncios | [Recolector en camino](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=publicaciones&track=g1) |
| Seguimiento desde Chats | [Chat del generador](https://nicolasrjs.github.io/qhurinet-prototipo/?role=generador&defaultTab=chats&thread=t1&chatRow=g1&track=g1&progress=50) |
| Recolector en destino | [Llegada simulada](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=publicaciones&track=g1&progress=100) |
| Menú de Recojos | [Acciones de r2](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=recojos&menu=r2) |
| Menú de Anuncios | [Acciones de g2](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=publicaciones&menu=g2) |
| Reprogramar recojo | [Nueva fecha y franja](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=recojos&dialog=reprogramar&row=r2) |
| Cancelar anuncio | [Confirmación y motivo](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=publicaciones&dialog=cancelar&row=g2) |
| Fila prioritaria | [Prioridad en Anuncios](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=publicaciones&priority=g1) |
| Escáner por entrega | [Bodega Olivo y código manual](https://nicolasrjs.github.io/qhurinet-prototipo/?defaultTab=recojos&dialog=qr&row=r2) |

Los parámetros adicionales son `stops=a1,a2,p1` (`none` para vaciar), `opt=1`,
`route=centro|costa|sur`, `panel=rutas`, `dialog=guardar|reprogramar|cancelar|qr`,
`row=r1|…|r4|g1|…|g4`, `menu=id`, `priority=ids,separados,por,comas`, `thread=t1|t2|t3`,
`chatRow=id`, `track=g1`, `progress=0…100`. `date=AAAA-MM-DD` y `slot=14:00–18:00`
permiten precargar el diálogo de reprogramación. `updates` guarda en JSON los
cambios confirmados por fila (estado, fecha/franja y motivo); se valida al leerlo
y `URLSearchParams` lo codifica. Para compartir una cancelación o reprogramación
ya confirmada, basta copiar la URL que genera la interfaz. Atrás/Adelante restaura
estos estados. Los códigos manuales y los borradores de los diálogos no se guardan.

## Pruebas

Ejecutar `node --test tests/flows.test.cjs` comprueba cálculos de ruta, optimización,
guardado, aislamiento de filas, validación, códigos por entrega, roles y estados
de URL. Utiliza exclusivamente módulos incluidos en Node.js.

## Assets

La biblioteca vive en [`public/images/`](public/images/README.md): logotipo,
favicon, íconos de navegación, materiales, avatares e ilustraciones, todo en
SVG.

**Los íconos que ve el prototipo van embebidos en el `index.html`**, no cargados
por ruta. Es deliberado: el artboard se publica en un sandbox que bloquea las
peticiones a archivos vecinos, así que una referencia relativa se rompería sin
aviso. El dibujo embebido y el archivo de `public/images/` son el mismo trazo;
al tocar uno hay que tocar el otro. Cuando esto pase a una app servida de
verdad, los `<svg>` en línea se reemplazan por los archivos.

## Sobre los avisos del editor

VS Code reporta ~87 errores de CSS en el `index.html`
(`at-rule or selector expected`, `property value expected`). **Son falsos
positivos**: su validador no entiende la interpolación `{{ expr }}` dentro de
`style="…"`, que el runtime resuelve antes de pintar.

`.vscode/settings.json` los desactiva con `"html.validate.styles": false`.
Requiere recargar la ventana (`Ctrl+Shift+P` → *Developer: Reload Window*).

## Lo que el mock no hace, a propósito

Nada de esto es un defecto pendiente: es trabajo que le corresponde a Angular y
Spring Boot, y por eso aquí queda solo insinuado.

- Las pestañas de estado en Recojos y Anuncios **marcan pero no filtran**.
- Los pesos de origen, resumen del mes, historial y valoraciones son de muestra;
  las métricas de ruta se calculan sobre las coordenadas simuladas.
- No hay mapa real, ni escáner de QR, ni llamada, ni envío de formularios: el
  escáner es un dibujo y la confirmación cambia el estado local de la entrega.
- El formulario de publicación mantiene sus limitaciones originales; los nuevos
  diálogos sí validan nombre, fecha, franja, motivo y código de entrega.
- Al recargar se recuperan los estados representados en la URL. Los mensajes,
  reclamos y la colección de rutas creadas por el usuario se reinician.
- Los controles anteriores usan `<div onClick>` y no reciben foco por teclado.
  Los nuevos controles del mapa usan botones con estado accesible.

## Para quien lo implemente en Angular

El propio `index.html` es la fuente de verdad visual: paleta, tipografía,
escala de espaciado, radios, variantes de botón y formato de datos es-PE
(coma decimal, miles con espacio, horas en 24 h) están resueltos ahí, en los
estilos en línea. Los assets están en [`public/images/`](public/images/README.md).
