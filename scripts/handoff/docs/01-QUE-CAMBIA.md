# Qué cambia respecto de la app actual (DS v3.3 → v3.4)

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
| ✏️ | Alcancía (con datos) | «Registrar salida» → **«Sacar plata»** con flujo propio. Metas abren su detalle. Meta completa muestra «¡Logrado!». Saldo con conteo animado al volver de anotar. Estado de conexión real (ver §3). | 06, 43 |
| ✏️ | Alcancía (primer día) | Solo textos y estado de conexión. | 01 |
| 🆕 | Agregar plata · paso 3 «¿Todo bien?» | Resumen y confirmación. No estaba diseñado en v3.3. | 41 |
| 🆕 | Agregar plata · paso 4 «¡Listo!» | Confirmación y aviso si se completó una meta. | 42 |
| 🆕 | **Sacar plata** (4 pasos) | Mismo flujo que agregar, con motivos propios y validación «No le alcanza». | 44, 45 |
| 🆕 | Sus metas (lista) | Todas las metas en orden estable + «Poner otra meta». | 07 |
| 🆕 | Detalle de meta | Avance, «Le faltan…», plata guardada para esa meta, «Agregar plata a esta meta». | 08 |
| 🆕 | Poner meta | Nombre + costo. Al venir de una actividad, vuelve a la actividad. | 04 |
| 🆕 | Todo lo anotado + detalle | Lista completa de entradas y salidas, y su detalle. | 09, 10 |
| ✏️ | Aprender | El estado «Para empezar / En curso» sale de la actividad realmente empezada, no de si hay plata. | 02, 11 |
| ✏️ | Biblioteca | Pestaña «Juegos» (antes «Juegos de rol»). Cada elemento abre su contenido. El filtro de tema se conserva al cambiar de formato. | 12–14 |
| 🆕 | Misión | Materiales, pasos marcables (no es tarea), «Anotar cómo les fue». | 17 |
| 🆕 | Juego | Escenario, roles, preguntas, «Ya lo conversamos». | 18 |
| ✏️ | Cuento | Abre cualquier cuento. Icono real de pausa. Error recuperable si no hay audio. | 15, 37 |
| 🆕 | Para conversar (guía) | Preguntas + consejos + «Ya lo conversamos» (opcional). | 16 |
| 🆕 | Actividad | Pasos, «Toca ahora», «Ya hicimos este paso». **Abrirla no la empieza**: solo el botón «Empezar». | 19, 20 |
| ✏️ | Progreso | Todo sale de datos reales: momento más reciente, conteos con plural, estado de cada tema, siguiente actividad sugerida. Estado vacío propio. | 21, 03 |
| 🆕 | Tema | Lo anotado en ese tema + su actividad. | 22 |
| 🆕 | Lo que pasó (momento) | Detalle + mensajitos recibidos + «Mandarle un mensajito». | 23 |
| 🆕 | Anotar algo que pasó | Qué pasó, título opcional, quién lo vio, tema opcional. | 25 |
| 🆕 | Felicitar | 4 frases o una propia. | 26 |
| 🆕 | Todo lo anotado (Progreso) | Cosas que pasaron, conversaciones y mensajitos. | 24 |
| ✏️ | El chanchito (ajustes) | Cada fila abre su pantalla. Estado «Conectando…» y error recuperable. | 27, 38 |
| 🆕 | Batería / WiFi / Volumen / Conectar este celular / Perfil | Datos «lo último que sabemos»; cambios bloqueados sin conexión; perfil edita el nombre. | 28–32 |
| 🆕 | Selector de persona | Al tocar el nombre. Hoy una sola persona. | 33 |
| 🆕 | Cerrar sesión (confirmación) | Confirmación previa. Conectar con la autenticación real de la app. | 34 |

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

## 5. Qué falta decidir (fuera de este paquete)

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
