# Verificación del kit Compose en escritorio

Compila `../android/ui/` (el mismo código que va a la app) con Compose para escritorio, que tiene las mismas APIs, y:

1. renderiza cada pantalla y una galería de componentes a PNG (`build/capturas/`), con los datos de ejemplo;
2. recorre el flujo de plata con toques automáticos (`Prueba.kt`) y falla si algo no responde.

```bash
gradle -q run --args="$PWD/build/capturas"   # capturas
gradle -q run --args=prueba                    # flujo con toques
```

Necesita JDK 17+ y Gradle 8. `plataforma/Plataforma.kt` reemplaza al de Android (fuente, iconos SVG, mascota y textos de es.json) y se ejecuta desde el repositorio del prototipo (lee `src/assets`).

Sin acceso a Google Maven (redes restringidas): `./preparar-sin-google-maven.sh` y agrega `-PsinGoogleMaven=true` a los comandos.
