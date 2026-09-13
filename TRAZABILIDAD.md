# Trazabilidad del prototipo QhuriNet

Cruce de cada pantalla del prototipo contra los elementos interactivos que
contiene, para sustentar en el informe qué está cubierto y qué no. Levantado
sobre `index.html` en el estado del repositorio en que se publica este
documento, revisando cada elemento con handler (`onClick`, `onChange`,
`onKeyDown`) y cada elemento que solo aparenta ser interactivo.

Curso 1ASI0705 · Arquitectura de Aplicaciones Web. El prototipo es una
simulación visual sin backend ni persistencia.

## Criterios

| Estado | Significado |
| --- | --- |
| **Implementado** | El control cambia el estado local y la pantalla lo refleja con reglas (validación, contadores, filtros). Se recupera desde la URL cuando el README lo indica. Nada persiste fuera del navegador. |
| **Simulación** | Hay comportamiento, pero el resultado es fabricado: cifras fijas, clasificación por palabras clave, aprobación automática, recorrido animado sin geolocalización, acceso sin credenciales reales. |
| **Decorativo** | No tiene handler. Está dibujado para que la pantalla sea coherente y quedó deliberadamente fuera de alcance. |

Orden: barra de navegación en modo reciclador, luego modo generador, después
los modales y paneles, y al final la pantalla de acceso.

## Elementos comunes a todas las pantallas

| Elemento | Estado | Detalle |
| --- | --- | --- |
| Pestañas de la barra lateral | Implementado | Cambian de pantalla y cierran menús, diálogos y paneles abiertos. Conservan el rol en Chats, Perfil y Soporte. |
| Botón MODO (REC ⇄ GEN) | Implementado | Alterna el rol y salta a Mapa o Publicar. |
| Avatar de la barra lateral | Implementado (sin clic) | Muestra la inicial del nombre o la foto guardada en Editar perfil. No abre nada. |
| Título y subtítulo de la cabecera | Implementado | Por pantalla; los contadores de Recojos y Anuncios se recalculan con las acciones. |
| Campo «Buscar» de la cabecera | Implementado solo en Mapa | Filtra anuncios y puntos por nombre y dirección. En las otras pantallas acepta texto pero no filtra nada. |
| Campana de notificaciones | Implementado | Contador de no leídas del rol activo; abre el panel (ver Modales y paneles). |
| Badge «N RECOJOS/ANUNCIOS ACTIVOS» | Decorativo | El número se recalcula, pero el clic no hace nada. |

## Modo reciclador

### Mapa

| Elemento | Estado | Detalle |
| --- | --- | --- |
| Alternador Anuncios / Puntos | Implementado | Cambia la lista y los pines activos (`view`). |
| Chips «Cerca de mí», «+20 kg», «Hoy» | Implementado | Filtran anuncios; «Cerca de mí» también puntos (≤ 5 km simulados). `+20 kg` y `Hoy` no aplican a puntos. |
| Chips de material (Cartón, PET, Vidrio, Metal, Plástico) | Implementado | Filtran anuncios y puntos; Plástico incluye PET. |
| Chips de tipo de punto (Todos, acopio, comercio o bodega, reciclador, municipal) | Implementado | Solo en la vista de puntos. |
| Búsqueda (cabecera) | Implementado | Nombre, dirección y distrito; sin distinguir mayúsculas ni tildes. |
| Contador «N anuncios/puntos encontrados» y estado vacío | Implementado | Con botón «Limpiar filtros» que restablece búsqueda, chips, leyenda y detalle. |
| Tarjeta de anuncio → botón «Reclamar» | Implementado | Pasa a «Reclamado», agrega la parada a la ruta activa y mueve el destacado al siguiente anuncio. Se reinicia al recargar. |
| Tarjeta de anuncio → ícono «Abrir chat» | Implementado | Navega a Chats. |
| Tarjeta de punto | Implementado | Abre el panel de detalle del punto. |
| Pin de anuncio en el mapa | Implementado | Lleva la lista a ese anuncio (busca por su nombre). |
| Pin de punto en el mapa | Implementado | Abre el detalle del punto. Número de parada si está en la ruta. |
| Leyenda (acopio, comercio o bodega, reciclador, municipal) | Implementado | Cada entrada muestra u oculta ese tipo en pines y lista (`hidden`). |
| Marcador «TÚ» | Decorativo | Origen fijo de la ruta; sin clic. |
| Panel «Ruta activa»: kilos, paradas, distancia, minutos | Simulación | Calculados sobre coordenadas relativas (80 m por unidad, 15 km/h, 3 min por parada), no sobre un mapa real. |
| Parada de la ruta (clic) | Implementado | Abre el detalle del punto o lleva la lista al anuncio. |
| Parada de la ruta → «×» | Implementado | Quita la parada y deshace la optimización. |
| «Optimizar ruta» | Simulación | Reordena por vecino más cercano; conserva el orden si no mejora. Aviso en el panel. |
| «Guardar ruta» | Implementado | Abre el diálogo de guardado (ver Modales). |
| «Rutas guardadas» | Implementado | Abre el panel lateral (ver Modales). |
| «Escanear QR» del panel de ruta | Implementado | Abre el escáner de la primera parada con recojo asociado. |
| Ícono de chat del panel de ruta | Implementado | Abre el chat de esa misma parada. |
| Tarjeta «Anuncios nuevos · 2 sin reclamar» | Decorativo | Texto fijo; el clic no hace nada. |

### Recojos

| Elemento | Estado | Detalle |
| --- | --- | --- |
| Pestañas Activos · Completados · Cancelados | Decorativo | Los contadores se recalculan, pero no filtran la tabla ni se marcan. |
| Clic sobre una fila (cantidad, material, contraparte, estado) | Decorativo | No hay detalle de fila. |
| Ícono «Abrir chat» | Implementado | Abre Chats con la conversación y la entrega de esa fila. |
| Ícono «Escanear QR» | Implementado | Abre el escáner con la entrega de esa fila. En filas completadas o canceladas se abre, pero los botones de confirmar quedan deshabilitados con aviso. |
| Menú «⋯» → «Reprogramar» | Implementado | Diálogo con fecha y franja; actualiza estado y ventana de la fila (`updates`). |
| Menú «⋯» → «Cancelar recolección» | Implementado | Diálogo con motivo obligatorio; cancela la fila y retira su parada de la ruta. |
| Menú «⋯» → «Marcar como prioritaria / Quitar prioridad» | Implementado | Resalta la fila y añade el distintivo (`priority`). |
| Filas completadas o canceladas | Implementado | Bloquean reprogramar, cancelar y confirmar entrega, con aviso. |
| Resumen del mes, meta mensual, materiales del mes | Simulación | Cifras fijas de muestra; no cambian con las acciones. |

### Chats

| Elemento | Estado | Detalle |
| --- | --- | --- |
| Lista de hilos | Implementado | Cambia la conversación y la entrega del panel derecho (`thread`, `chatRow`). |
| Campo «Escribe un mensaje» + «Enviar» / Enter | Implementado | Añade la burbuja con «ahora». Se pierde al recargar. |
| «Ver anuncio» | Decorativo | Sin handler. |
| Panel «Entrega en curso» (kg, material, dirección) | Implementado | Depende de la entrega seleccionada. |
| «Abrir escáner» | Implementado | Abre el escáner de la entrega mostrada. |
| Bloque «Contraparte» (valoración, entregas, verificado) | Simulación | Cifras fijas, iguales para todos los hilos. |
| «Reportar un problema» | Implementado | Navega a Soporte conservando el rol. |

### Perfil

| Elemento | Estado | Detalle |
| --- | --- | --- |
| Tarjeta de identidad (foto/inicial, nombre, rol, bio, correo, teléfono, materiales) | Implementado | Refleja lo guardado en Editar perfil (`profile`). El correo y «Visibilidad: Activa» son fijos. |
| «Editar perfil» | Implementado | Abre el diálogo (ver Modales). |
| «Documentos» y «Ver y subir documentos» | Implementado | Abren el diálogo de documentos (ver Modales). |
| «Cerrar sesión» | Implementado | Vuelve a la pantalla de acceso (`screen=login`). |
| Métodos de pago → «Usar» | Implementado | Cambia el predeterminado (`payDefault`). |
| Métodos de pago → «Agregar método» | Implementado | Abre el diálogo (ver Modales). |
| Historial de actividad | Simulación | Tres filas fijas. |
| Botones «PDF» y «CSV» | Decorativo | Sin handler. |
| Valoraciones recibidas | Simulación | Promedio y comentarios fijos. |
| Tarjeta «Verificación» | Implementado | Lista los documentos de muestra más los subidos; el contador de aprobados se recalcula. |

### Soporte

| Elemento | Estado | Detalle |
| --- | --- | --- |
| Preguntas frecuentes | Implementado | Acordeón de cinco preguntas; se despliegan y pliegan una a una. |
| «Llamar ahora» | Decorativo | Sin handler. |
| Chips de categoría (Incumplimiento, Material distinto, Error en la app) | Implementado | Selección única; va al ticket. |
| Campo «Cuéntanos qué pasó» | Implementado | Obligatorio; error si se envía vacío. |
| «Adjuntar evidencia» y «×» | Implementado | Selector de imagen; muestra el nombre y permite quitarlo. Solo el hecho de haber adjuntado viaja al ticket. |
| «Enviar reporte» | Implementado | Crea el ticket al inicio de «Mis tickets» con estado Abierto, categoría y «con evidencia» (`tickets`); limpia el formulario y muestra aviso. |
| Filas de «Mis tickets» | Decorativo | Sin detalle al hacer clic. |

## Modo generador

### Publicar

| Elemento | Estado | Detalle |
| --- | --- | --- |
| Chips de material (Cartón, PET, Vidrio, Metal, Plástico) | Implementado | Selección múltiple; se refleja en la vista previa. |
| Cantidad + presets 5 / 10 / 25 | Implementado | El campo acepta solo dígitos, punto y coma; se refleja en la vista previa. |
| Campos de disponibilidad (día, rango de horas) | Implementado | Ligados al estado; se reflejan en la vista previa. |
| Pago (Sin pago, Yape, Efectivo) | Implementado | Selección única; se refleja en la vista previa y en la fila publicada. |
| Nota para el reciclador | Implementado | Ligada al estado; alimenta la sugerencia. |
| Sugerencia de material («Sugerencia del sistema … Confianza N %») | Simulación | Búsqueda de palabras clave en la nota y el nombre de la foto, con confianza fija por material (+4 si viene de foto). «Aceptar» marca el chip; «Rechazar» la oculta para ese origen. Etiquetada como simulada en pantalla. |
| Foto → «Agregar» | Implementado | Selector de imagen real con vista previa. La imagen no viaja en la URL. |
| Foto → «×» (quitar) | Implementado | Elimina la vista previa. |
| Validación | Implementado | Bloquea el envío y muestra error junto al campo si falta cantidad, es cero, falta material o falta día/horario. |
| «Publicar anuncio» | Implementado | Agrega la fila al inicio de Anuncios (`pubs`), limpia el formulario y navega a Anuncios. |
| «Guardar borrador» | Decorativo | Sin handler. |
| Mapa lateral y «Ajustar punto» | Decorativo | Dirección fija; sin handler. |
| Vista previa del anuncio | Implementado | Kilos, materiales, horario y pago en vivo; el lugar es fijo. |

### Anuncios

| Elemento | Estado | Detalle |
| --- | --- | --- |
| Pestañas Activos · Completados · Cancelados | Decorativo | Contadores dinámicos (el de completados es fijo en 12); no filtran ni se marcan. |
| Clic sobre una fila | Decorativo | No hay detalle de fila. |
| Ícono «Abrir chat» | Implementado | Abre Chats en modo generador con la entrega de esa fila. Los anuncios publicados desde el formulario usan el hilo de muestra `t3`. |
| Ícono «Ver anuncio» | Decorativo | Sin handler. |
| Menú «⋯» → Reprogramar / Cancelar / Prioridad | Implementado | Igual que en Recojos, también en las filas publicadas desde el formulario (`n1`…). |
| «Seguir recolector» (menú) | Simulación | Solo en filas «En camino» (`g1`). Abre el seguimiento animado (ver Modales). |
| Filas publicadas desde Publicar | Implementado | Nacen «Esperando», «Sin reclamar», con «Publicado ahora · pago»; sus cambios de menú viajan en `updates` y `priority`. |
| Resumen del mes, meta mensual, materiales del mes | Simulación | Cifras fijas. |

### Chats (generador)

Igual que en modo reciclador, con dos diferencias:

| Elemento | Estado | Detalle |
| --- | --- | --- |
| Nombre y subtítulo del hilo | Implementado | Muestran la contraparte y la entrega seleccionada en Anuncios. |
| «Seguir recolector» en el panel derecho | Simulación | Solo si la entrega está «En camino». |
| «Abrir escáner» | No aplica | El escáner es del reciclador; el generador no lo ve. |

### Perfil y Soporte (generador)

Mismos elementos y estados que en modo reciclador. La única diferencia es la
línea de rol de la tarjeta («Generador · Lima Centro») y las notificaciones
del panel, que tienen su propio conjunto por rol.

## Modales y paneles

| Elemento | Estado | Detalle |
| --- | --- | --- |
| **Escáner QR** («Confirmar entrega») | Simulación | No hay cámara: el dibujo del QR es fijo. «Confirmar entrega» completa la fila y abre la valoración. El campo de código manual valida contra el código de muestra de esa entrega (`QH-R1`…) y rechaza los demás. «×» y «Cancelar» cierran. |
| **Valoración** («Entrega confirmada») | Simulación | Botones 1–5 que se marcan; el comentario es un campo suelto sin handler; «Enviar valoración» y «Después» solo cierran. Nada se guarda ni se refleja en el perfil. |
| **Reprogramar recolección** | Implementado | Fecha desde hoy y franja obligatorias; error en caso contrario. Bloqueado en filas cerradas. |
| **Cancelar recolección** | Implementado | Motivo obligatorio (máx. 240 caracteres). Bloqueado en filas cerradas. |
| **Guardar ruta** | Implementado | Nombre obligatorio y al menos una parada; guarda una copia del orden actual. Las rutas creadas no viajan en la URL. |
| **Panel «Rutas guardadas»** | Implementado | Tres rutas de ejemplo más las creadas; «Cargar ruta» reemplaza la ruta activa, «Eliminar» la quita de la lista. |
| **Panel de detalle de punto** | Implementado | Tipo, nombre, dirección, distrito, horario, calificación y materiales aceptados (datos de muestra); «Agregar a ruta» añade la parada; «×» y Escape cierran. |
| **Seguimiento del recolector** | Simulación | Marcador que avanza sobre un mapa dibujado, ETA descendente y estado «llegó» a los 60 s; no completa la recolección. |
| **Editar perfil** | Implementado | Nombre, teléfono, descripción, materiales y foto con vista previa y «Quitar foto». Valida nombre vacío, teléfono de 9 dígitos y al menos un material. «Guardar cambios» aplica; «Cancelar» y «×» descartan. La foto no viaja en la URL. |
| **Documentos de verificación** | Simulación | Lista tipo, nombre, estado y fecha. La subida elige tipo (DNI, RUC, Otro) y archivo, exige un archivo y lo agrega como **Aprobado** con fecha de hoy: la validación es automática por diseño, no revisa el contenido. |
| **Agregar método de pago** | Implementado | Yape, Plin, tarjeta, transferencia o efectivo; campo según medio con validación (celular de 9 dígitos, últimos 4 dígitos de tarjeta, CCI); check «Usar como predeterminado». |
| **Panel de notificaciones** | Implementado | Seis notificaciones fijas por rol (aceptada, coordinada, en camino, confirmada, cancelada y una sexta); «Marcar como leída» por ítem, «Marcar todas» (deshabilitado sin pendientes), «×» y Escape cierran. Las leídas viajan en `read`. |

## Pantalla de acceso

| Elemento | Estado | Detalle |
| --- | --- | --- |
| Tarjetas «Ciudadano» / «Bodega o comercio» | Implementado | Selección obligatoria; decide el rol de entrada (reciclador / generador). |
| Campos de registro (nombre y apellidos, correo, teléfono, contraseña) | Implementado | Validación por campo: dos palabras, formato de correo, 9 dígitos, mínimo 8 caracteres. Error bajo cada campo. |
| Campos de inicio de sesión (correo, contraseña) | Simulación | Misma validación de formato, pero no hay credenciales: cualquier correo válido y contraseña de 8 caracteres entran. Por eso también pide el tipo de cuenta. |
| «Crear cuenta» / «Entrar» / Enter | Implementado | Bloquean el envío con errores; si todo es válido entran a la app en el rol elegido. |
| «Google» y «Facebook» | Simulación | Sin OAuth: entran con el tipo de cuenta elegido y exigen elegirlo primero. |
| Enlaces «Regístrate» / «Inicia sesión» | Implementado | Alternan entre las dos variantes (`screen`). |
| Panel izquierdo (logo, lema, viñetas) | Decorativo | Solo presentación. |

## Resumen

- **Implementado con estado local:** navegación y rol, deep links, mapa completo (vistas, búsqueda, filtros, leyenda, detalle, reclamar, ruta activa y guardadas), menús de acciones por fila en Recojos y Anuncios, chats (hilos y mensajes), formulario de Publicar con validación y publicación real en la tabla, perfil editable, métodos de pago, reporte con ticket, notificaciones, pantalla de acceso con validación.
- **Simulación:** métricas de ruta, optimización, seguimiento del recolector, escáner y valoración, sugerencia de material, aprobación automática de documentos, acceso sin credenciales, cifras de resumen e historial, contraparte del chat.
- **Decorativo (fuera de alcance):** pestañas de estado de las tablas, clic sobre filas y tickets, Ver anuncio, Guardar borrador, Ajustar punto, Llamar ahora, PDF/CSV, tarjeta «Anuncios nuevos», badge de activos, comentario de la valoración, marcador «TÚ».
