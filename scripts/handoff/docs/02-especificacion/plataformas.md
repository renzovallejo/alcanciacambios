# Notas por plataforma (Android e iOS)

## Equivalencias rápidas

| Necesidad | Android (Compose) | iOS (SwiftUI) |
|---|---|---|
| Colores, medidas, tipos, movimiento | `03-diseno/tokens/android/AlcanciaTokens.kt` | `03-diseno/tokens/ios/AlcanciaTokens.swift` |
| Fuente | `04-assets/fuentes/android/res/font/inter.ttf` | Agregar `Inter-variable.ttf` al target + `UIAppFonts` en Info.plist |
| Iconos | Android Studio → *New → Vector Asset* → importar cada SVG de `04-assets/iconos/svg/` (trazo `currentColor` → `tint`) | Arrastrar los SVG al Asset Catalog, *Render As: Template Image*, *Preserve Vector Data* |
| Mascota | `04-assets/mascota/android/res/drawable-*dpi/mascota.png` | `04-assets/mascota/ios/Mascota.imageset` |
| Textos | `05-textos/android/res/values/strings.xml` (+ `values-es`) | `05-textos/ios/es.lproj/Localizable.strings` y `.stringsdict` |
| Modelos y reglas | `06-datos/modelos/android/Modelos.kt` (kotlinx.serialization) | `06-datos/modelos/ios/Modelos.swift` (Codable) |
| Navegación | `NavHost` con 3 destinos de pestaña + tareas a pantalla completa | `TabView` con un `NavigationStack` por pestaña + tareas en `fullScreenCover` o push |
| Guardado local | DataStore (JSON de `EstadoApp`) o Room | SwiftData o archivo JSON en Application Support |

## Textos con variables

- Android: `stringResource(R.string.flujo_in_ahora, nombre, monto)`. El orden de los argumentos está en el comentario de cada string (`%1$s = nombre, %2$s = monto`).
- iOS: `String(format: NSLocalizedString("flujo.in.ahora", comment: ""), nombre, monto)` o `String(localized:)`.
- Plurales: `pluralStringResource(R.plurals.progreso_cosas, n, n)` / `String.localizedStringWithFormat(NSLocalizedString("progreso.cosas", comment: ""), n)`.
- Texto con enlace dentro (`actividad_ultimo_paso`, variable `enlace`): partir el texto en `%1$s` y poner el enlace «ver otro tema» (`actividad_ver_otro_tema`) como texto tocable.

## Teclado y montos

- Campo de monto: `KeyboardType.Decimal` / `.keyboardType(.decimalPad)`. Aceptar «.» y «,» como separador (la regla ya lo hace).
- El pie con «Continuar» queda **por encima del teclado** (`imePadding()` / comportamiento por defecto de SwiftUI con `safeAreaInset(edge: .bottom)`).
- Al tocar un monto rápido, el valor del campo cambia y se cierra cualquier error.

## Botón «atrás» y gestos

- **Android, botón atrás del sistema** en el paso 1 del flujo de plata = «✕»: si ya eligió motivo o meta, pedir confirmación (`BackHandler`).
- En el paso 4 «¡Listo!», atrás lleva a Alcancía (el flujo se sacó de la pila).
- **iOS, deslizar para volver**: igual que «←» en pasos 2 y 3. En el paso 1 presentado como modal, usar `interactiveDismissDisabled(true)` cuando hay cambios y confirmar.

## Área segura, tamaños y texto grande

- Respetar barras del sistema y la zona del gesto de inicio (`WindowInsets.safeDrawing` / `safeAreaInset`). No fijar 98 dp para la barra inferior ni 874 dp de alto.
- Probar a 320, 360, 402 y 430 dp de ancho y con **texto al 200 %** (Android: tamaño de fuente máximo; iOS: Accessibility XXXL). Los textos crecen en alto; no truncar montos, autores ni relatos; los temas de Progreso pasan a 1 columna.
- Usar `sp` (Android) y `relativeTo:` (iOS, ya en los tokens) para que el texto escale.

## Tema claro

El DS no define modo oscuro: forzar claro (`Theme` sin `isSystemInDarkTheme()` / `.preferredColorScheme(.light)`).

## Audio de cuentos (cuando haya archivos)

- Android: Media3 ExoPlayer. iOS: AVPlayer. Sin reproducción automática.
- Estados: detenido, cargando, reproduciendo, pausado, terminado, error (mensaje `cuento_error_audio` / `cuento.errorAudio`). ±10 s dentro de la duración.
- Salida «en el chanchito»: si no hay conexión, error `cuento_error_chanchito` / `cuento.errorChanchito` y el texto sigue disponible.

## Voz del celular (leer cuentos)

- Android: `TextToSpeech` con `Locale("es", "PE")` (si no está, `es-419` o `es`), velocidad 0.95. iOS: `AVSpeechSynthesizer` con `AVSpeechSynthesisVoice(language: "es-MX")` o la que haya en español.
- Detener al salir de la pantalla o al cambiar de versión. Si no hay voz en español: `cuento_voz_no_disponible` / `cuento.vozNoDisponible`.

## Recordatorio de propina

- El prototipo solo muestra un aviso en Alcancía. En nativo, además, **notificación local** semanal el día elegido (p. ej. 9:00): Android `WorkManager` + `NotificationCompat` (Android 13+: permiso `POST_NOTIFICATIONS`, pedirlo al tocar «Sí, recuérdame»); iOS `UNCalendarNotificationTrigger` con `weekday`, pidiendo autorización en ese mismo momento.
- Texto: `alcancia_recordatorio` con `{dia}`. Al tocarla, abrir Agregar plata con «Propina de la semana».

## Deshacer

- Android: `Snackbar` con acción «Deshacer» (6 s). iOS: aviso propio al pie con botón. Guardar una copia del estado anterior y restaurarla completa.

## Chanchito (cuando haya hardware)

- Android 12+: permisos `BLUETOOTH_SCAN` y `BLUETOOTH_CONNECT`; antes, ubicación. iOS: `NSBluetoothAlwaysUsageDescription` (texto en español peruano, p. ej. «Para conectar el chanchito con este celular.»).
- Exponer el estado como un solo flujo observable (`StateFlow` / `@Observable`) que lean todas las pantallas.

## Lo que es solo del prototipo (no implementar)

- «Reiniciar la demo» y «Empezar desde cero» en ajustes del chanchito.
- La franja roja «Volver a cero» arriba de todas las pantallas en la demo de primer día (`VITE_SEED=vacio`).
- La pantalla «Sesión cerrada» (usar el flujo real de la app).
- La página «Uy, esta página no existe» (no aplica en apps nativas).
- El mensaje de Bluetooth «Desde este navegador…» (en nativo, pedir permisos del sistema).
