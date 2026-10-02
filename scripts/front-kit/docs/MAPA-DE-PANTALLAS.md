# Mapa de pantallas → componentes

Para cada pantalla de la app: dónde verla en el prototipo, su captura en el paquete de especificación (`07-referencias/pantallas/NN-…`) y con qué piezas del kit se arma. Los nombres son iguales en Kotlin y Swift (en Swift los parámetros llevan etiqueta).

**Piezas comunes**

| Necesito… | Compose | SwiftUI |
|---|---|---|
| Pantalla de pestaña con scroll | `PantallaPestana { }` + `EncabezadoPantalla` + `FilaContexto` | `PantallaPestana { }` + `EncabezadoPantalla` + `FilaContexto` |
| Tarea con «←/✕» y botón fijo al pie | `PantallaTarea(titulo, onAtras, pie = { Boton(...) }) { }` | `PantallaTarea(titulo:, alAtras:) { Boton } contenido: { }` |
| Título de sección con enlace | `EncabezadoSeccion("Sus metas", accion = "Ver todas (2)")` | `EncabezadoSeccion(titulo:, accion:)` |
| Fila tocable con icono y flecha | `Tarjeta(onClick)` o `Row` + `IconTile` + `Icono(Ic.ChevronRight)` | igual |
| Elegir una opción | `GrillaOpciones` (2 columnas) · `OpcionFila` (a lo ancho) · `Chip` | igual |
| Monto | `CampoMonto` + `MontosRapidos` + `validarMonto` | `CampoMonto` + `MontosRapidos` + `Dinero.validar` |
| Texto libre | `CampoTexto` | `CampoTexto` |
| Resumen / detalle de datos | `ListaResumen(listOf("Cuánto" to "S/ 10.00", …))` | `ListaResumen(filas:)` |
| Aviso | `Aviso(texto, ok)` · `Banner(icono, texto) { acciones }` · `AvisoDeshacer` | igual |
| Confirmación | `IconoExito()` | `IconoExito()` |
| Tarjeta de color (cuento, misión, momento) | `Tarjeta(tono = Tono.Violeta / Menta / Crema)` | `Tarjeta(tono: .violeta / .menta / .crema)` |

**Pantallas**

| Pantalla | Web | Captura | Estado | Cómo se arma |
|---|---|---|---|---|
| Alcancía | `/` | 01, 08, 09, 13, 58 | ✅ `AlcanciaPantalla` | — |
| Agregar / Sacar plata (todos los pasos) | `/saldo/*`, `/salida/*` | 53–60, 06, 07 | ✅ `CuantoPantalla`, `MotivoPantalla`, `QuienPantalla`, `ListoPantalla` | — |
| Lo que entró y salió | `/movimientos` | 16 | ✅ `MovimientosPantalla` | — |
| Detalle de movimiento | `/movimiento/:id` | 17, 18 | Armar | `PantallaTarea` + `CajaDato(Entró/Salió)` + `ListaResumen(Le envió, Por qué, Meta, Cuándo, Lo hizo)` + `ParDeBotones { Boton(Corregir, Secundario, icono = Ic.Pencil); Boton(Borrar, Terciario, icono = Ic.Trash2) }` + `AvisoDeshacer` |
| Corregir movimiento | `/movimiento/:id/editar` | 19 | Armar | `CampoMonto` + `GrillaOpciones(motivos)` + `GrillaOpciones(Catalogo.QUIEN_ENVIA)` + `EleccionMeta` |
| Sus metas | `/metas` | 14, 12 | Armar | `TarjetaMeta` × n · sección «Logradas» con `EncabezadoSeccion` |
| Detalle de meta | `/meta/:id` | 15, 10 | Armar | `IconTile` + `Tarjeta(Menta si lograda)` con monto, `BarraAvance(alto = 10.dp)` + `Boton(Agregar plata a esta meta)` / `Boton(Usar esta plata, icono = Ic.HandCoins)` |
| Poner / editar meta | `/meta/nueva` | 04, 20 | Armar | `PantallaTarea` + `CampoTexto` + `CampoTexto` (monto con `validarMonto`) |
| Aprender | `/aprender` | 02, 21 | Armar | `Tarjeta(Violeta)` con `Mascota` + `Boton` · `TarjetaIdea` · filas con `IconTile` |
| Biblioteca | `/biblioteca` | 22–24 | Armar | segmentado de 3 (como `BarraPestanas` pero con `Chip`) + `Tarjeta` destacada + filas |
| Cuento | `/cuento/:id` | 25, 50, 51 | Armar | `Tarjeta(Violeta)` con el texto + `Chip(Cuento completo / Versión de 1 minuto)` + `Boton(Leer en voz alta, Secundario, icono = Ic.Volume2)` (TTS del sistema) |
| Misión / Juego / Para conversar | `/mision/:id`, `/juego/:id`, `/guia/:id` | 26–28 | Armar | `Tarjeta` + listas + `Boton(Ya lo conversamos)` |
| Actividad | `/actividad/:tema` | 29, 30, 45 | Armar | pasos numerados (`IconTile` o círculo) + «N min» + `Boton(Ya terminamos)` + `Tarjeta(Menta)` de cierre |
| Progreso / Tema | `/progreso`, `/tema/:tema` | 31, 32, 03 | Armar | `Tarjeta(Menta)` con `Mascota` + grilla 2×2 de temas (`OpcionTarjeta` sin selección) |
| Lo que pasó · Contar algo que pasó · Felicitar | `/momento/*`, `/celebrar` | 33–36 | Armar | `Tarjeta(Menta)` · `CampoTexto` · `OpcionFila(conRadio = false)` para las frases |
| El chanchito y sus ajustes | `/chanchito/*` | 05, 37–44, 52 | Armar | `Tarjeta(Crema/Menta)` con `Mascota` + `Boton` · filas · `EstadoConexion` |
| Recordatorio | `/chanchito/recordatorio` | 44 | Armar | `OpcionFila` × 7 días + «Sin recordatorio» |

Los textos de cada pantalla están en `es.json` bajo la sección del mismo nombre (`meta.*`, `movimientos.*`, `chanchito.*`…); la tabla completa clave → texto está en `05-textos/claves.md` del paquete de especificación.
