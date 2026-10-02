# Animaciones

Principio del DS: **alegría con evidencia**. Las animaciones confirman algo que pasó de verdad (se anotó plata, se completó una meta) o ayudan a orientarse (a dónde voy). Nada de confeti, nada en bucle salvo «buscando», nada que retrase una tarea.

**Siempre** respetar la preferencia del sistema de reducir movimiento: duración 0 (cambio inmediato).
- Android: `Settings.Global.ANIMATOR_DURATION_SCALE == 0` o el ajuste «Quitar animaciones».
- iOS: `@Environment(\.accessibilityReduceMotion)`.

Los valores están en `03-diseno/tokens/` (`AlcanciaMotion`, `AlcanciaEasing`). Los videos de `07-referencias/videos/` muestran cada una.

| # | Momento | Qué se anima | Duración · curva | Android (Compose) | iOS (SwiftUI) |
|---|---|---|---|---|---|
| 1 | Cambiar de pestaña | Contenido aparece subiendo 8 dp + fundido | 200 ms · decelerate | `AnimatedContent` con `fadeIn + slideInVertically { it / 100 }` | `.transition(.opacity.combined(with: .offset(y: 8)))` |
| 2 | Abrir una tarea (subpantalla) | Entra desde la derecha 16 dp + fundido | 240 ms · emphasized | Transición del `NavHost`: `slideInHorizontally { 16.dp } + fadeIn` | Transición nativa de `NavigationStack` (push) |
| 3 | Pestaña activa | Píldora azul suave se desliza a la pestaña nueva | 280 ms · emphasized | `animateDpAsState` del desplazamiento del indicador | `matchedGeometryEffect` del fondo |
| 4 | Formatos de Biblioteca | Píldora azul se desliza; la tarjeta y la lista cambian con fundido | 280 ms / 200 ms | Igual que 3 + `Crossfade` | Igual que 3 + `.transition(.opacity)` |
| 5 | Barras de avance (metas, batería, audio) | Crecen de 0 al valor al aparecer | 700 ms · emphasized | `animateFloatAsState` (0 → valor) al entrar | `.animation(.timingCurve…)` sobre el ancho |
| 6 | Saldo que cambió | El número cuenta desde el valor anterior; la tarjeta brilla un instante; el chanchito da un saltito (−10 dp, ±4°) | conteo 700 ms ease-out cúbica · salto 700 ms | `Animatable` para el monto; lector de pantalla recibe el valor final de inmediato | `withAnimation` + `contentTransition(.numericText())` |
| 7 | Movimiento recién anotado | Fondo menta que se desvanece en la fila nueva | 1.6 s (empieza a 0.3 s) | `animateColorAsState` | `.background` animado |
| 8 | Paso 4 «¡Listo!» / «¡Mensajito guardado!» | Icono de 72 dp aparece con rebote (0.4 → 1.12 → 1) + anillo que se expande | 450 ms · overshoot + 1 s anillo | `spring(dampingRatio = 0.5f)` | `.spring(response: 0.45, dampingFraction: 0.55)` |
| 9 | Aviso «¡Ya juntaron todo…!» | Fundido subiendo, después del check | 250 ms, retardo 350 ms | `AnimatedVisibility` | `.transition` con `delay` |
| 10 | Selección (monto rápido, motivo, frase) | El ✓ aparece con rebote corto | 280 ms | `animateFloatAsState` de escala | `.scaleEffect` + spring |
| 11 | Tocar botones y tarjetas | Escala 0.98 mientras se presiona | 120 ms | `Modifier.graphicsLayer` + `interactionSource` | `ButtonStyle` con `scaleEffect` |
| 12 | Botón en proceso | Texto «Un ratito…» + spinner; el botón no cambia de tamaño | spinner 0.8 s en bucle | `CircularProgressIndicator` 16 dp | `ProgressView` |
| 13 | Chanchito «Conectando…» | La mascota se balancea ±5° | 0.5 s en bucle mientras conecta | `rememberInfiniteTransition` | `.rotationEffect` + `repeatForever` |
| 14 | Mapa de temas (Progreso) | Las 4 tarjetas aparecen en cascada | 250 ms, +40 ms cada una | `AnimatedVisibility` con delay por índice | `.transition` con delay por índice |
| 15 | Avisos (error de audio, conversación anotada, borrador, recordatorio, «Deshacer») | Fundido subiendo | 180–250 ms | `AnimatedVisibility(fadeIn + expandVertically)` / `Snackbar` | `.transition(.opacity.combined(with: .move(edge: .top)))` |
| 16 | El niño mete la moneda («¡Listo!») | La moneda baja 46 dp encogiéndose y se desvanece; luego el chanchito salta | 600 ms · ease-in + salto 600 ms (retardo 450 ms) | `Animatable` de offset/escala/alpha + salto de la mascota | `withAnimation(.easeIn(duration: 0.6))` + `.offset`/`.scaleEffect` |
| 17 | Cambiar versión del cuento | El texto cambia con fundido | 200 ms | `Crossfade` | `.transition(.opacity)` |

**Curvas** (`cubic-bezier`): standard `0.2, 0, 0, 1` · decelerate `0, 0, 0.2, 1` · emphasized `0.2, 0.8, 0.2, 1` · overshoot `0.2, 0.9, 0.3, 1.3`.

**Háptica (opcional, recomendada)**: toque ligero al confirmar «Sí, guardar» y al completar una meta (`HapticFeedbackType.LongPress` / `UINotificationFeedbackGenerator().notificationOccurred(.success)`). Nunca en errores de validación.
