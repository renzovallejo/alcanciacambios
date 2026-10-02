# Alcancía · Paquete para desarrollo móvil (DS v3.4)

Hola 👋 Este paquete trae todo lo necesario para llevar a la **app Android e iOS que ya existe** lo que se diseñó y probó en el prototipo web. La idea es que no tengas que adivinar nada: textos, colores, medidas, reglas, estados y animaciones están definidos y probados.

> **Prototipo funcionando** (ábrelo en el celular, es la referencia viva):
> - Cuenta nueva, todo en cero → https://alcancia-nuevo.vercel.app
> - Una semana de uso → https://alcancia-semana.vercel.app
> - Datos de las pantallas de referencia → https://alcancia-five.vercel.app
>
> En los tres, «Ajustes del chanchito» (⚙️) → «Reiniciar la demo» vuelve al estado inicial.

## Por dónde empezar (orden recomendado)

1. **Lee [`01-QUE-CAMBIA.md`](01-QUE-CAMBIA.md)**: qué hay de nuevo respecto de lo que la app tiene hoy (DS v3.3). Es la lista de trabajo.
2. **Mira los videos** de `07-referencias/videos/` (5 min en total) y recorre el prototipo en tu celular.
3. **Copia la base visual** a tu proyecto: tokens (`03-diseno/tokens/`), fuente, iconos y mascota (`04-assets/`).
4. **Copia los textos** (`05-textos/`): `strings.xml` y `Localizable.strings` ya generados, con plurales.
5. **Copia los modelos y reglas** (`06-datos/modelos/`) y corre los casos de prueba de `06-datos/casos-de-prueba/dinero.json` en tus tests.
6. **Implementa pantalla por pantalla** con `02-especificacion/pantallas.md` y la captura correspondiente al lado.
7. **Valida** con `02-especificacion/criterios-de-aceptacion.md` antes de cada entrega.
8. **Importa el backlog** (`09-backlog/tickets.csv`) en Jira, Linear o Trello para seguir el avance.

## Qué hay en cada carpeta

| Carpeta | Para qué te sirve |
|---|---|
| `01-QUE-CAMBIA.md` | Diferencias con la app actual (v3.3 → v3.4). Empieza aquí. |
| `02-especificacion/` | Pantallas, flujos, reglas de negocio, estados, animaciones, accesibilidad, notas por plataforma y criterios de aceptación. |
| `03-diseno/tokens/` | Colores, medidas, tipografía y animación listos: `android/AlcanciaTokens.kt` (Compose), `ios/AlcanciaTokens.swift` (SwiftUI), `res/values/*.xml` y `tokens.json` (Flutter / RN). |
| `03-diseno/sistema-de-diseno/` | Sistema de diseño completo: editable de Pencil, guía de lenguaje (`documentacion/lenguaje.md`), componentes, referencias v3.3. |
| `04-assets/` | Fuente Inter (con `res/font/inter.ttf`), 51 iconos Lucide en SVG, mascota por densidad (`drawable-*dpi` y `Mascota.imageset`) e **ícono de la app** (`icono-app/`: maestro 1024, Google Play, launcher Android adaptativo, AppIcon iOS, web). |
| `05-textos/` | Todos los textos de la app: `android/res/values/strings.xml`, `ios/es.lproj/Localizable.strings(.stringsdict)`, `es.json` y `claves.md` (tabla para buscar un texto). |
| `06-datos/` | Modelos (`Modelos.kt`, `Modelos.swift`), contenido educativo (`contenido.json`), estados de ejemplo (`semillas/`) y casos de prueba de dinero. |
| `07-referencias/` | 60 capturas de todas las pantallas y estados + 5 videos de flujos y animaciones. Índice en `07-referencias/README.md`. |
| `08-prototipo-web/` | Código del prototipo (React). Úsalo como referencia de comportamiento: `src/screens/` tiene cada pantalla. |
| `09-backlog/tickets.csv` | Historias listas para importar, con criterios de aceptación. |
| `manifest.sha256` | Comprobación de integridad de cada archivo. |

## Lo más importante de esta versión

- **Al cargar plata se guarda el motivo y de quién viene** (Mamá, Papá, Abuela, Abuelo, Tío o tía, Otro pariente). Ver `02-especificacion/flujos.md`.
- **Menos texto en pantalla** (auditoría de carga visual) y **nuevo ícono de la app** (`04-assets/icono-app/`).
- Revisión por tipos de usuario (anotar rápido, corregir y borrar, recordatorio, ideas de 1 minuto, voz, cierre de actividad…): §5 de `01-QUE-CAMBIA.md` y épica 6 del backlog.

## Tres reglas que no se negocian

1. **Dinero en céntimos enteros** (`Int`), nunca `Double`/`Float`. S/ 10.50 = 1050.
2. **Ningún texto escrito a mano** en el código: todo sale de `strings.xml` / `Localizable.strings`. Si un texto cambia, se cambia en `es.json` y se regenera (ver abajo).
3. **Honestidad**: la app no simula conexión con el chanchito ni evalúa al niño. (Que no mueve plata de verdad ya lo saben las familias: no se explica en pantalla.) Ver `02-especificacion/reglas-de-negocio.md`.

## Una sola fuente de verdad

Los textos, tokens, contenido y casos de prueba de este paquete **se generan** desde el repositorio `renzovallejo/alcanciacambios` (rama `claude/recrear-app-recursos-puk3x1`):

```bash
git clone https://github.com/renzovallejo/alcanciacambios && cd alcanciacambios
git checkout claude/recrear-app-recursos-puk3x1
npm install
npm run build && npm run handoff:capturas   # capturas y videos (opcional)
npm run handoff                             # vuelve a armar este paquete
```

Así, cuando diseño o producto cambien un texto, te llega un `strings.xml` nuevo en vez de una lista de cambios a mano.

## Supuestos que conviene confirmar

- La app actual está hecha en **Kotlin + Jetpack Compose** y **Swift + SwiftUI**. Si es Flutter o React Native, usa `tokens.json`, `es.json` y `contenido.json`: el contenido es el mismo.
- Solo **español peruano**, sin modo oscuro (el diseño no lo contempla: forzar tema claro).
- **Una persona (niño o niña) por cuenta** en esta versión. Varios perfiles requieren separar datos por persona.
- Los datos viven en el celular. No hay backend: ver «Qué falta decidir» en `01-QUE-CAMBIA.md`.

Cualquier duda: el prototipo es la referencia de comportamiento; si el prototipo y este documento difieren, avisa, porque es un bug de uno de los dos.
