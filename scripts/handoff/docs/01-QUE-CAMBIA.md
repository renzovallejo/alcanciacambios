# Qué cambia respecto de la app actual (DS v3.3 → v3.4, con la revisión por tipos de usuario)

Supuesto: la app de hoy implementa las **12 pantallas de referencia del DS v3.3** (ver `03-diseno/sistema-de-diseno/referencias/pantallas-v3.3/`). Si implementa menos o más, ajusta esta lista.

Leyenda: 🆕 nueva · ✏️ cambia · 🔁 solo textos

## 1. Textos (todas las pantallas) 🔁

Todos los textos pasan a **español peruano familiar** («plata», «propina», «Agregar plata», «¿De dónde salió esta plata?»). No es un cambio de diseño: es reemplazar el archivo de textos.

- Copia `05-textos/android/res/values/strings.xml` y `05-textos/ios/es.lproj/` completos.
- Cambios más visibles: `03-diseno/sistema-de-diseno/CAMBIOS.md` (tabla antes / después).
- Reglas para textos nuevos: `03-diseno/sistema-de-diseno/documentacion/lenguaje.md`.
- **Motivos de plata**: los ids no cambian; cambia lo que se muestra. `mesada` → «Su propina de la semana», `propina` → «Le dieron propina», `cumpleanos` → «Por su cumple», `buen-comportamiento` → «Se portó bien», `otro` → «Otra cosa».

## 2. Pantallas

| | Pantalla | Qué hacer | Ref. |
|---|---|---|---|
| ✏️ | Alcancía (con datos) | «Registrar salida» → **«Sacar plata»** con flujo propio. Metas abren su detalle. Meta completa muestra «¡Logrado!». Saldo con conteo animado al volver de anotar. Estado de conexión real (ver §3). | 13, 58 |
| ✏️ | Alcancía (primer día) | Solo textos y estado de conexión. | 01 |
| 🆕 | Agregar plata · paso 3 «¿Quién le envía?» | Mamá, Papá, Abuela, Abuelo, Tío o tía, Otro pariente (pide nombre). Quien administra la cuenta dice «Administra la cuenta». Debajo, resumen y «Sí, anotar». | 55 |
| 🆕 | Agregar plata · paso 4 «¡Listo!» | Confirmación, aviso si se completó una meta, moneda para que el niño la meta al chanchito, oferta de recordatorio. | 56, 57 |
| 🆕 | **Sacar plata** (3 pasos) | Cuánto → En qué (con resumen y «Sí, anotar») → Listo. Motivos propios y validación «No le alcanza». | 59, 60, 11 |
| 🆕 | Sus metas (lista) | Todas las metas en orden estable + «Poner otra meta». | 14, 12 |
| 🆕 | Detalle de meta | Avance, «Le faltan…», plata guardada para esa meta, «Agregar plata a esta meta». | 15, 10 |
| 🆕 | Poner meta | Nombre + costo. Al venir de una actividad, vuelve a la actividad. | 04, 20 |
| 🆕 | Todo lo anotado + detalle | Lista completa de entradas y salidas, y su detalle. | 16–19 |
| ✏️ | Aprender | El estado «Para empezar / En curso» sale de la actividad realmente empezada, no de si hay plata. | 02, 21 |
| ✏️ | Biblioteca | Pestaña «Juegos» (antes «Juegos de rol»). Cada elemento abre su contenido. El filtro de tema se conserva al cambiar de formato. | 22–24 |
| 🆕 | Misión | Materiales, pasos marcables (no es tarea), «Anotar cómo les fue». | 27 |
| 🆕 | Juego | Escenario, roles, preguntas, «Ya lo conversamos». | 28 |
| ✏️ | Cuento | Abre cualquier cuento. Icono real de pausa. Error recuperable si no hay audio. | 25, 50, 51 |
| 🆕 | Para conversar (guía) | Preguntas + consejos + «Ya lo conversamos» (opcional). | 26 |
| 🆕 | Actividad | Pasos, «Toca ahora», «Ya hicimos este paso». **Abrirla no la empieza**: solo el botón «Empezar». | 29, 30, 45 |
| ✏️ | Progreso | Todo sale de datos reales: momento más reciente, conteos con plural, estado de cada tema, siguiente actividad sugerida. Estado vacío propio. | 31, 03 |
| 🆕 | Tema | Lo anotado en ese tema + su actividad. | 32 |
| 🆕 | Lo que pasó (momento) | Detalle + mensajitos recibidos + «Mandarle un mensajito». | 33 |
| 🆕 | Anotar algo que pasó | Qué pasó, título opcional, quién lo vio, tema opcional. | 35 |
| 🆕 | Felicitar | 4 frases o una propia. | 36 |
| 🆕 | Todo lo anotado (Progreso) | Cosas que pasaron, conversaciones y mensajitos. | 34 |
| ✏️ | El chanchito (ajustes) | Cada fila abre su pantalla. Estado «Conectando…» y error recuperable. | 37, 52, 05 |
| 🆕 | Batería / WiFi / Volumen / Conectar este celular / Perfil | Datos «lo último que sabemos»; cambios bloqueados sin conexión; perfil edita el nombre. | 38–42 |
| 🆕 | Selector de persona | Al tocar el nombre. Hoy una sola persona. | 46 |
| 🆕 | Cerrar sesión (confirmación) | Confirmación previa. Conectar con la autenticación real de la app. | 47 |

Los números de la columna «Ref.» son las capturas de `07-referencias/pantallas/`.

## 3. Comportamiento

- **Estado del chanchito único y honesto**: todas las pantallas muestran el mismo estado. Sin hardware conectado se muestra «Sin conexión»; nunca se simula «Conectado».
- **Meta alcanzada**: al confirmar plata que completa una meta, aviso en el paso 4 y «¡Logrado!» en la tarjeta.
- **Salidas**: no se puede sacar más de lo ahorrado ni más de lo que tiene la meta de origen.
- **Actividades**: «Empezar» marca el tema como «Ya empezaron». Abrir el detalle o un paso no cambia nada.
- **Progreso**: el momento destacado es el más reciente con fecha válida; si fue hace más de 7 días, la etiqueta dice «LO ÚLTIMO QUE ANOTARON» en lugar de «ESTA SEMANA».
- Detalle completo: `02-especificacion/reglas-de-negocio.md`.

## 4. Animaciones 🆕

Transiciones de pantalla, indicador de pestaña que se desliza, conteo del saldo, barras que crecen, check con rebote, movimiento nuevo resaltado y chanchito «buscando». Todas con duración y curva definidas y desactivadas si el sistema pide reducir movimiento. Ver `02-especificacion/animaciones.md` y los videos.

## 5. Revisión por tipos de usuario 🆕

Salió de revisar los flujos con familias muy digitales y poco digitales, con y sin tiempo, muy y poco interesadas, con y sin distracciones. Todo está en el prototipo y en las capturas.

| # | Cambio | Dónde | Ref. |
|---|---|---|---|
| 1 | **De quién viene la plata.** Agregar plata pregunta «¿Quién le envía?» y lo guarda en el movimiento (`senderId`, `senderName`). Las listas muestran quién envió (en entradas) y el detalle separa «Le envió» de «Lo anotó». | Agregar plata, listas, detalle | 55, 18 |
| 2 | **Anotar rápido.** Motivo, meta y quién envía vienen marcados de la última vez. Chip «Repetir: S/ 10.00 · Mamá» en Alcancía lleva directo a confirmar. El monto se selecciona entero al tocarlo. Metas como tarjetas a la vista, no desplegable. | Alcancía, Agregar/Sacar | 13, 54 |
| 3 | **Retomar lo que quedó a medias.** Si salen del flujo sin anotar, Alcancía ofrece «Seguir» o «Descartar». | Alcancía | 08 |
| 4 | **Corregir y borrar** movimientos, metas y momentos, con «Deshacer» durante 6 s. Nunca se permite dejar plata en negativo: se avisa en vez de guardar. Borrar una meta no borra plata. | Detalle de movimiento, meta y momento | 17–20 |
| 5 | **Metas logradas.** Quedan como logradas aunque se use la plata; «Usar esta plata» abre Sacar plata con meta y monto puestos. En «Sus metas» van aparte. | Detalle de meta, Sus metas | 10–12 |
| 6 | **Primer día que explica.** Una línea dice para qué sirve la app. Si el chanchito nunca se conectó, se invita a «Conectar chanchito» en vez de mostrar «Sin conexión». | Alcancía, Chanchito | 01, 05 |
| 7 | **Menos lectura.** El aviso «solo lleva la cuenta» sale completo la primera vez; después, una línea corta con «¿Por qué?». | Agregar plata, listas | 06 |
| 8 | **Quién acompaña** (nombre y relación). Firma lo que se anota y llena «¿Quién lo vio?». Si no está, se toma del primer momento anotado. | Ajustes del chanchito | 43 |
| 9 | **Recordatorio de propina.** Se ofrece tras anotar «Su propina de la semana»; ese día Alcancía muestra un aviso. En el prototipo es un aviso dentro de la app; en nativo, **notificación local** (ver plataformas). | Listo, Alcancía, Ajustes | 09, 44 |
| 10 | **Ideas de 1 minuto** (una por día) con «Ya lo hicimos», que suma una conversación. | Alcancía, Aprender | 13, 21 |
| 11 | **Duración** de cada paso, **versión de 1 minuto** de cada cuento y **«Leer en voz alta» con la voz del celular** (TTS del sistema). | Actividad, Cuento | 29, 51 |
| 12 | **Más contenido**: 2 cuentos (compartir, ganar), 1 misión (ganar), 1 juego (ahorrar). La Biblioteca lista todo. | Biblioteca | 22–24 |
| 13 | **Cierre de actividad**: «Ya terminamos» en el último paso, celebración sin puntaje y siguiente actividad sugerida. | Actividad, Aprender | 45 |
| 14 | **El niño participa**: en «¡Listo!» puede tocar el chanchito para «meter la moneda». Es opcional y no bloquea nada. | Agregar plata · Listo | 57 |
| 15 | **Ahorro en el tiempo**: «Esta semana: +S/ X» en el saldo y «Todo lo anotado» agrupado por mes con lo que entró y salió. | Alcancía, Todo lo anotado | 13, 16 |

## 6. Qué falta decidir (fuera de este paquete)

| Tema | Hoy en el prototipo | Hace falta |
|---|---|---|
| Guardado y sincronización | Solo en el celular | ¿Backend? ¿Varios cuidadores sobre la misma cuenta? |
| Cuentas | «Cerrar sesión» sin cuenta real | Conectar con la autenticación existente de la app |
| Audio de cuentos | No hay archivos | Archivos, derechos y dónde se reproducen (celular / chanchito) |
| Chanchito (hardware) | Siempre «Sin conexión» | Protocolo BLE/WiFi, permisos y confirmación de cambios |
| Varios niños | Una persona | Datos separados por persona y selector real |
| Monto máximo | S/ 1,000.00 provisional | Confirmar con producto |
| Contenido educativo | 5 cuentos, 4 misiones, 4 juegos de ejemplo | Contenido final validado |
| Validación con familias | No hecha | Probar los textos con familias de distintas regiones |
