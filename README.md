# Alcancía

App web para que las familias acompañen a niñas y niños a ahorrar con su chanchito.

- **App publicada:** https://alcancia-five.vercel.app
- **Código:** `src/` (Vite + React + TypeScript). Los datos se guardan en el navegador (localStorage).
- **Sistema de diseño v3.4:** abrir [`docs/sistema-de-diseno/ABRIR-AQUI.html`](docs/sistema-de-diseno/ABRIR-AQUI.html).
- **Guía de lenguaje:** [`docs/sistema-de-diseno/documentacion/lenguaje.md`](docs/sistema-de-diseno/documentacion/lenguaje.md). Todo texto nuevo debe seguirla.

## Desarrollo

```bash
npm install
npm run dev     # servidor local
npm test        # pruebas unitarias
npm run build   # compilación (tipos + Vite)
```

## Paquete para el equipo móvil (Android / iOS)

```bash
npm run build && npm run handoff:capturas   # capturas y videos de referencia
npm run handoff                             # arma entrega/alcancia-dev-handoff-v3.4.zip
```

Incluye tokens para Compose y SwiftUI, `strings.xml` y `Localizable.strings` generados desde `src/i18n/es.json`, assets por densidad, modelos Kotlin/Swift, contenido, semillas, casos de prueba, especificación, capturas, videos y backlog. Documentación fuente en `scripts/handoff/docs/`.

## Pendiente

No hay archivo de audio, hardware del chanchito, cuentas de usuario ni backend: la app lo dice claramente en cada pantalla donde aplica.
