# Alcancía · Kit de front para Android e iOS (DS v3.4)

Este kit es **código de interfaz listo para pegar** en la app que ya existe: tema, 36 componentes y las pantallas principales en **Jetpack Compose** y **SwiftUI**, con los mismos textos, colores, iconos, animaciones y reglas que el prototipo web. La idea: que cambiar o construir una pantalla sea armar piezas que ya existen, no dibujar desde cero.

> Prototipo de referencia (ábrelo en el celular): cuenta nueva https://alcancia-nuevo.vercel.app · una semana de uso https://alcancia-semana.vercel.app
> Especificación completa, backlog y criterios de aceptación: `alcancia-dev-handoff-v3.4.zip` (paquete aparte).

## Qué trae

| Carpeta | Para qué |
|---|---|
| `android/ui/` | Kotlin + Compose: `tema/`, `componentes/`, `pantallas/`, `modelo/`, `dinero/`, `i18n/` y `generado/` (tokens, iconos, datos de ejemplo) |
| `android/plataforma/Plataforma.kt` | Lo único que toca Android: fuente, iconos, mascota, textos de `strings.xml`, «reducir movimiento». Ajusta el `import …R` |
| `android/previews/Previews.kt` | 11 previews con datos reales (incluye una **demo interactiva** del flujo completo) |
| `android/res/` | `strings.xml`, Inter en 3 pesos, 51 iconos como VectorDrawable (`ic_*.xml`), mascota por densidad e **ícono de la app** (`mipmap-*/ic_launcher*`, adaptativo incluido) |
| `ios/Alcancia/` | Swift + SwiftUI: `Componentes/`, `Pantallas/` (con `#Preview`), `Modelo/`, `Textos/` y `Generado/` |
| `ios/Recursos/` | `Assets.xcassets` (51 iconos vectoriales `ic-*` como plantilla, `Mascota` y **`AppIcon`** de 1024), `es.lproj/Localizable.strings(.stringsdict)`, Inter en 3 pesos |
| `capturas/kit-compose/` | Cómo se ve el kit Compose renderizado (pantallas y galería de componentes) |
| `capturas/web/` | Las mismas pantallas en el prototipo web, para comparar |
| `MAPA-DE-PANTALLAS.md` | Cada pantalla de la app → qué componentes usar (también las que el kit no trae hechas) |
| `verificacion-escritorio/` | Proyecto Gradle que compila el kit Compose en escritorio, lo renderiza y recorre el flujo con toques. Opcional |

## Android en 30 minutos

1. **Copia** `android/ui/`, `android/plataforma/` y `android/previews/` dentro de tu módulo (p. ej. `app/src/main/java/pe/alcancia/ui/`). El paquete es `pe.alcancia.ui`; si usas otro, cámbialo con *Refactor → Move*.
2. **Copia** `android/res/` dentro de `app/src/main/res/` (si ya tienes `strings.xml`, combínalo: las claves del kit empiezan por el nombre de la sección, p. ej. `alcancia_agregar_plata`).
3. En `plataforma/Plataforma.kt`, cambia `import pe.alcancia.R` por el `R` de tu app.
4. **Dependencias** (Compose 1.6 o superior; el kit usa foundation, material3 y ui-tooling para previews):
   ```kotlin
   implementation(platform("androidx.compose:compose-bom:2024.09.00"))
   implementation("androidx.compose.foundation:foundation")
   implementation("androidx.compose.material3:material3")
   implementation("androidx.compose.ui:ui-tooling-preview")
   debugImplementation("androidx.compose.ui:ui-tooling")
   ```
5. Envuelve la UI: `setContent { AlcanciaTheme { DemoFlujoPlata(Ejemplos.semana) } }` y corre. Verás Alcancía y podrás guardar y sacar plata de verdad (estado local).
6. Abre `Previews.kt`: cada pantalla con datos reales. Cambia un color o un texto y míralo al instante.

## iOS en 30 minutos

1. **Arrastra** `ios/Alcancia/` a tu proyecto en Xcode (*Copy items if needed*, target de la app). Requiere iOS 16+ y Xcode 15+ (por `#Preview`).
2. **Arrastra** `ios/Recursos/Assets.xcassets` (o copia sus carpetas `Iconos/` y `Mascota.imageset` a tu catálogo actual), `es.lproj/` y `Fuentes/`.
3. En `Info.plist` agrega las fuentes:
   ```xml
   <key>UIAppFonts</key>
   <array><string>Inter-Regular.ttf</string><string>Inter-Medium.ttf</string><string>Inter-SemiBold.ttf</string></array>
   ```
   y en *Project → Info → Localizations* deja **Spanish** como idioma de desarrollo.
4. Prueba: `WindowGroup { DemoFlujoPlata(inicial: Ejemplos.semana) }`.
5. Cada archivo de `Pantallas/` tiene sus `#Preview` con los mismos datos que Android.

## Cómo está pensado (para iterar rápido)

- **Pantallas sin lógica de negocio.** Reciben un estado de UI (`AlcanciaUi`, `MetaUi`, `MovimientoUi`…) con los textos ya resueltos y avisan los toques con funciones (`AccionesAlcancia`, `alContinuar`…). Tu ViewModel decide qué pasa. Así una pantalla se puede cambiar sin tocar datos, y al revés.
- **Una clave, tres plataformas.** `t("alcancia.agregarPlata")` en Kotlin y Swift usa la misma clave que la web (`es.json`). Las variables van por nombre: `t("flujo.in.ahora", "nombre" to "Sofía", "monto" to "S/ 25.00")` / `t("flujo.in.ahora", ["nombre": "Sofía", "monto": "S/ 25.00"])`. Nunca escribas texto en el código: si hace falta uno nuevo, se agrega a `es.json` y se regenera.
- **Iconos por nombre.** `Icono(Ic.PiggyBank)` / `Icono(nombre: Ic.piggyBank)`. Los 51 iconos son los mismos de la web.
- **Dinero en céntimos (`Int`).** `formatoSoles(1050)` → «S/ 10.50»; `validarMonto("abc")` devuelve el mismo error que la web. Corre los casos de `06-datos/casos-de-prueba/dinero.json` del paquete de especificación contra `validarMonto` / `Dinero.validar`.
- **Animaciones incluidas y apagables.** Conteo del saldo, chanchito que salta (también al tocarlo), barras que crecen, ✓ con rebote, moneda que cae, fila nueva resaltada, píldora de pestañas. Todas pasan a 0 ms si el sistema pide reducir movimiento.
- **Accesibilidad incluida.** Títulos marcados como encabezado, opciones como radio con estado, botones de icono con nombre, objetivos táctiles de 44 dp/pt, textos con Dynamic Type / escala de fuente.

## Qué trae hecho y qué no

| Hecho (con previews) | Se arma con los componentes (ver `MAPA-DE-PANTALLAS.md`) |
|---|---|
| Alcancía: primer día, con datos, borrador a medias, día de propina, idea de 1 minuto | Sus metas, detalle de meta, poner/editar meta |
| Agregar plata: Cuánto → De dónde salió → **Quién le envía** → Listo | Detalle y corrección de movimientos |
| Sacar plata: Cuánto → En qué (con resumen) → Listo | Aprender, Biblioteca, cuento, misión, juego, actividad |
| Lo que entró y salió (por mes) | Progreso, tema, momento, contar algo que pasó, felicitar |
| Barra de pestañas | Ajustes del chanchito, quién acompaña, recordatorio |

## Qué se verificó

- **Compose:** el código de `android/ui/` se compiló (Kotlin 2.1, Compose 1.6) y se renderizó en escritorio con las mismas APIs de Compose: ver `capturas/kit-compose/`. Además se recorrió el flujo completo con toques automáticos (agregar S/ 10 de la Abuela → «¡Listo, ya se guardó!» → S/ 35.00; sacar S/ 5 → S/ 30.00). `Plataforma.kt` (la parte con `R`) y `Previews.kt` son los únicos archivos que no se pudieron compilar fuera de Android Studio.
- **Iconos Android:** los 51 VectorDrawable se compararon píxel a píxel contra los SVG originales (diferencia máxima 0.005 %).
- **SwiftUI:** los 17 archivos pasan un analizador de sintaxis Swift, pero **no se compilaron** (SwiftUI solo compila en macOS/Xcode). Están escritos con las mismas piezas y nombres que Compose; si Xcode marca algo, suele ser un detalle de firma: avísanos y lo corregimos en la fuente.
- **Textos:** el armado del kit falla si el código usa una clave que no existe en `es.json`.

## Si cambia un texto, un color o un icono

Todo lo que está en `generado/` / `Generado/`, `res/values/strings.xml`, `Localizable.strings`, iconos y fuentes **se genera** desde el repositorio del prototipo:

```bash
git clone https://github.com/renzovallejo/alcanciacambios && cd alcanciacambios
git checkout claude/recrear-app-recursos-puk3x1 && npm install
npm run front-kit:verificar   # opcional: compila y renderiza el kit Compose (necesita JDK 17+)
npm run front-kit             # vuelve a armar este kit
```

No edites esos archivos a mano: cambia la fuente (`src/i18n/es.json`, `src/tokens.css`, `src/assets/iconos/`) y regenera.
