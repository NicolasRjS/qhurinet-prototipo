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
> Por eso aquí no hay reglas de negocio ni cálculos: los números son de muestra
> y están escritos a mano. Los clics cambian lo que se ve —un botón pasa a
> "Reclamado", un chip se marca, se abre un modal— para poder recorrer los
> flujos, nada más.

Es un artboard de Claude Design (originalmente `QhuriNet Consola.dc.html`,
renombrado a `index.html` para publicarlo): un solo archivo con marcado,
estilos en línea y el estado de la maqueta, que el canvas renderiza en vivo.

```
qhurinet-html/
├─ index.html            ← la maqueta completa (todas las pantallas)
├─ support.js            ← runtime para abrirla en el navegador
├─ public/images/        ← biblioteca de assets (ver su README)
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

Para fijar una pantalla al abrir —útil para mostrar una sola— se pasa por la
barra de direcciones:

```
index.html?defaultTab=publicar
```

> **En el canvas de Claude Design** la maqueta sigue funcionando como siempre;
> el canvas trae su propio runtime y `support.js` se hace a un lado si detecta
> que ya hay uno (`if (window.DCLogic) return;`). Si aun así vieras algo raro
> **dentro del canvas**, renombra `support.js` y todo vuelve a como estaba.
>
> Si alguna vez `support.js` no cargara al abrir con doble clic (`file://`),
> sirve la carpeta por HTTP y entra por ahí:
>
> ```
> python -m http.server 8000
> ```
>
> `support.js` es un script clásico sin `type="module"` ni `fetch`, que es
> justo lo que los navegadores sí restringen en `file://`, así que el doble
> clic debería bastar.

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
| **Mapa**     | Anuncios cercanos con filtros, mapa con la ruta activa y sus paradas           |
| **Recojos**  | Tabla de recojos por estado, resumen del mes y desglose por material          |
| **Chats**    | Hilos, conversación, y panel de la entrega en curso con el QR                 |
| **Publicar** | Formulario de anuncio con vista previa en vivo y ubicación en el mapa          |
| **Anuncios** | Tabla de publicaciones por estado, con el reciclador que reclamó cada una      |
| **Perfil**   | Datos, métodos de pago, historial, valoraciones y estado de verificación      |
| **Soporte**  | FAQ desplegable, llamada 24/7, reporte de casos y tickets                     |

Dos modales cruzan todas las pantallas: el **escáner QR** que confirma la
entrega y la **valoración** posterior.

### Propiedad configurable

`defaultTab` (enum) elige la pestaña inicial. Si apunta a una pantalla exclusiva
de un rol —`publicar` y `publicaciones` son del generador, `mapa` y `recojos`
del reciclador— el rol inicial se deduce de ahí.

## Cómo simula la interacción

Todo vive en el `<script type="text/x-dc">` del final, en una clase
`Component extends DCLogic`:

- **Los datos de muestra** están en constantes al inicio: `ADS`, `THREADS`,
  `CONVOS`, `FAQ_DATA`, `HEADERS`. Ahí se cambia el contenido de la maqueta.
- `state` — lo único que se mueve al hacer clic: qué anuncios están
  `claimed`, qué hilo de chat está abierto, qué chips de material y filtros
  están marcados, y si hay un modal en pantalla.
- `tab()` / `role()` — pestaña y rol visibles. El rol es explícito solo si se
  tocó el botón MODO; si no, se deduce de la pestaña.
- `renderVals()` — devuelve **todo** lo que el marcado interpola. Si un
  `{{ x }}` aparece en el marcado, `renderVals()` lo devuelve; no hay estado
  escondido.

Las cifras son literales, no resultados: la tarjeta de ruta dice
`32,5 kg · 2 paradas · 6,1 km` porque así está escrito. Reclamar un anuncio más
no la recalcula, igual que las tablas de Recojos, Anuncios y Perfil son fijas.
No queda ninguna aritmética en la maqueta: esa lógica le toca al backend.

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

- Los filtros del mapa y las pestañas de estado en Recojos y Anuncios **marcan
  pero no filtran**. Muestran cómo se ve el control activo.
- Las cifras de ruta, resumen del mes, historial y valoraciones son fijas.
- No hay mapa real, ni escáner de QR, ni llamada, ni envío de formularios: el
  escáner es un dibujo y "Confirmar entrega" solo abre el modal de valoración.
- No hay validación de campos ni mensajes de error.
- Nada persiste: al recargar, la maqueta vuelve a su estado inicial.
- Los elementos interactivos son `<div onClick>`, no `<button>`, así que no
  reciben foco por teclado. En Angular deben ser botones reales.

## Para quien lo implemente en Angular

El propio `index.html` es la fuente de verdad visual: paleta, tipografía,
escala de espaciado, radios, variantes de botón y formato de datos es-PE
(coma decimal, miles con espacio, horas en 24 h) están resueltos ahí, en los
estilos en línea. Los assets están en [`public/images/`](public/images/README.md).
