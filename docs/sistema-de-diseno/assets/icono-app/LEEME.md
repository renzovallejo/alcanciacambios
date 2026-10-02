# Ícono de la app «Chanchito»

**Maestro:** `original/AppIcon-1024.png` (1024 × 1024, PNG RGB sin transparencia, sRGB). Chanchito centrado sobre azul principal (`#141C7A`) con halo morado arriba a la izquierda y naranja abajo a la derecha. Cuadrado y sin esquinas: cada sistema aplica su propia máscara.

Todo lo demás **se genera** desde el maestro (`python3 scripts/icono-app/generar.py`, requiere `pip install pillow`). No editar las variantes a mano.

| Archivo | Uso |
|---|---|
| `original/Icono-Google-Play-512.png` | Ficha de Google Play (512 × 512) |
| `ios/AppIcon.appiconset/` | Xcode: un solo ícono de 1024 (Xcode 14+ genera los demás tamaños) |
| `android/mipmap-*/ic_launcher.png`, `ic_launcher_round.png` | Ícono del launcher (48–192 px) |
| `android/mipmap-anydpi-v26/ic_launcher.xml` + `ic_launcher_fondo.png` | Ícono adaptativo (Android 8+). El maestro no trae capas: el fondo es el ícono con margen para la zona segura (66 %) y el frente va vacío. Si diseño entrega el chanchito en una capa aparte, reemplazar `ic_launcher_frente.png` y usar solo el degradado de fondo |
| `web/favicon-16/32/64.png` | Pestaña del navegador (con esquinas redondeadas) |
| `web/apple-touch-icon.png` | «Agregar a inicio» en iPhone (180 px) |
| `web/icono-192.png`, `icono-512.png`, `icono-maskable-512.png` | Manifiesto web (Android / Chrome). El «maskable» tiene margen para la máscara circular |

**Reglas**
- Sin texto ni el nombre de la app dentro del ícono.
- No agregar esquinas transparentes, sombras ni bordes: las tiendas y sistemas aplican su máscara.
- Sin variantes de modo oscuro o tintado por ahora (el ícono adaptativo no declara capa monocroma).
