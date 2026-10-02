/**
 * Capturas de todas las pantallas y videos de los flujos clave → entrega/.generado/
 * Uso: npm run build && npm run handoff:capturas
 * Levanta `vite preview`, inyecta cada conjunto de datos y recorre la app con Playwright.
 * CHROMIUM_PATH permite usar un Chromium ya instalado.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import { ROOT, write } from './exportar';
import { firstDayState, weekState, type AppState } from '../../src/lib/store';

const OUT = join(ROOT, 'entrega', '.generado');
const SHOTS = join(OUT, 'pantallas');
const VIDS = join(OUT, 'videos');
const PORT = 4180;
const BASE = `http://localhost:${PORT}`;
const VIEWPORT = { width: 402, height: 874 };

type Shot = { archivo: string; ruta: string; estado: string; nota?: string };
const indice: Shot[] = [];

async function server() {
  const p = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(BASE)).ok) return p; } catch { /* esperando */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('No arrancó vite preview (¿corriste npm run build?)');
}

/** Contexto con el estado inyectado en localStorage antes de cargar la app. */
async function pagina(b: Browser, estado: AppState, video?: string) {
  const ctx = await b.newContext({
    viewport: VIEWPORT, deviceScaleFactor: 2, locale: 'es-PE',
    ...(video ? { recordVideo: { dir: VIDS, size: VIEWPORT } } : {}),
  });
  await ctx.addInitScript((s) => { if (!sessionStorage.getItem('sembrado')) { localStorage.setItem('alcancia:v2', s); sessionStorage.setItem('sembrado', '1'); } }, JSON.stringify(estado));
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept());
  page.on('pageerror', (e) => console.error('Error en la página:', e.message));
  return { ctx, page };
}

let n = 0;
async function foto(page: Page, nombre: string, estado: string, nota?: string, full = true) {
  await page.waitForTimeout(500);
  const archivo = `${String(++n).padStart(2, '0')}-${nombre}.png`;
  await page.screenshot({ path: join(SHOTS, archivo), fullPage: full });
  indice.push({ archivo, ruta: new URL(page.url()).pathname + new URL(page.url()).search, estado, nota });
}
const ir = async (page: Page, ruta: string) => { await page.goto(BASE + ruta); await page.waitForTimeout(250); };
const tocar = async (page: Page, texto: string) => { await page.getByText(texto, { exact: false }).first().click(); await page.waitForTimeout(250); };

async function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(SHOTS, { recursive: true });
  const srv = await server();
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  try {
    /* ---------- primer día ---------- */
    {
      const { ctx, page } = await pagina(b, firstDayState());
      await ir(page, '/'); await foto(page, 'alcancia-primer-dia', 'vacío');
      await ir(page, '/aprender'); await foto(page, 'aprender-para-empezar', 'vacío');
      await ir(page, '/progreso'); await foto(page, 'progreso-sin-momentos', 'vacío');
      await ir(page, '/meta/nueva'); await foto(page, 'meta-nueva', 'vacío', 'Primera meta', false);
      await ir(page, '/saldo/importe'); await page.fill('#monto', 'abc'); await foto(page, 'agregar-cuanto-error', 'vacío', 'Error de monto junto al campo', false);
      await ctx.close();
    }
    /* ---------- una semana de uso ---------- */
    {
      const { ctx, page } = await pagina(b, weekState());
      const pasos: [string, string, string?][] = [
        ['/', 'alcancia-con-datos'], ['/metas', 'metas'], ['/meta/g1', 'meta-detalle'], ['/movimientos', 'movimientos'],
        ['/movimiento/w4', 'movimiento-detalle', 'Una salida'], ['/aprender', 'aprender-en-curso'], ['/biblioteca', 'biblioteca-cuentos'],
      ];
      for (const [r, nom, nota] of pasos) { await ir(page, r); await foto(page, nom, 'semana', nota); }
      await page.getByRole('tab', { name: 'Misiones' }).click(); await foto(page, 'biblioteca-misiones', 'semana');
      await page.getByRole('tab', { name: 'Juegos' }).click(); await foto(page, 'biblioteca-juegos', 'semana');
      const mas: [string, string, string?][] = [
        ['/cuento/s-compara?a=gastar-bien&p=1', 'cuento'], ['/guia/s-compara', 'guia-para-conversar'], ['/mision/m-monedas', 'mision'],
        ['/juego/g-tienda', 'juego'], ['/actividad/gastar-bien', 'actividad-en-curso'], ['/actividad/compartir', 'actividad-sin-empezar', 'Abrir no la inicia'],
        ['/progreso', 'progreso'], ['/tema/ahorrar', 'tema'], ['/momento/o1', 'momento-detalle'], ['/avances', 'todo-lo-anotado'],
        ['/momento/nuevo', 'anotar-algo-que-paso'], ['/celebrar?m=o1', 'felicitar'], ['/chanchito', 'chanchito-ajustes'],
        ['/chanchito/bateria', 'chanchito-bateria'], ['/chanchito/wifi', 'chanchito-wifi'], ['/chanchito/sonido', 'chanchito-volumen'],
        ['/chanchito/emparejar', 'chanchito-conectar-celular'], ['/chanchito/perfil', 'perfil'], ['/perfiles', 'selector-de-persona'],
        ['/sesion/cerrar', 'cerrar-sesion'], ['/sesion/cerrada', 'sesion-cerrada'], ['/no-existe', 'pagina-no-encontrada'],
      ];
      for (const [r, nom, nota] of mas) { await ir(page, r); await foto(page, nom, 'semana', nota); }
      await ir(page, '/cuento/s-compara'); await page.locator('.play').click(); await foto(page, 'cuento-audio-no-disponible', 'semana', 'Error recuperable');
      await ir(page, '/chanchito'); await tocar(page, 'Intentar otra vez'); await page.waitForTimeout(1700); await foto(page, 'chanchito-error-conexion', 'semana');
      // Flujo agregar plata (4 pasos) con meta alcanzada
      await ir(page, '/saldo/importe'); await page.fill('#monto', '10'); await foto(page, 'agregar-1-cuanto', 'semana', undefined, false);
      await tocar(page, 'Continuar'); await tocar(page, 'Su propina de la semana'); await tocar(page, 'Ninguna meta en especial');
      await page.locator('.opt', { hasText: 'Pelota de fútbol' }).click(); await foto(page, 'agregar-2-de-donde', 'semana', undefined, false);
      await tocar(page, 'Continuar'); await foto(page, 'agregar-3-revisar', 'semana', undefined, false);
      await tocar(page, 'Sí, anotar'); await foto(page, 'agregar-4-listo-meta-lograda', 'semana', 'La pelota llega a S/ 20 de S/ 20', false);
      await ir(page, '/'); await foto(page, 'alcancia-meta-lograda', 'semana');
      // Flujo sacar plata
      await ir(page, '/salida/importe'); await page.fill('#monto', '999'); await foto(page, 'sacar-1-no-alcanza', 'semana', undefined, false);
      await page.fill('#monto', '3'); await tocar(page, 'Continuar'); await tocar(page, 'Se compró algo'); await foto(page, 'sacar-2-en-que', 'semana', undefined, false);
      await ctx.close();
    }

    /* ---------- videos de flujos (referencia de animación) ---------- */
    mkdirSync(VIDS, { recursive: true });
    const videos: [string, AppState, (p: Page) => Promise<void>][] = [
      ['agregar-plata', weekState(), async (p) => {
        await ir(p, '/'); await p.waitForTimeout(800); await tocar(p, 'Agregar plata'); await p.waitForTimeout(600);
        await tocar(p, 'S/ 5'); await p.waitForTimeout(500); await tocar(p, 'Continuar'); await tocar(p, 'Ayudó en casa'); await p.waitForTimeout(500);
        await tocar(p, 'Continuar'); await p.waitForTimeout(700); await tocar(p, 'Sí, anotar'); await p.waitForTimeout(1500);
        await tocar(p, 'Volver a Alcancía'); await p.waitForTimeout(2500);
      }],
      ['meta-lograda', weekState(), async (p) => {
        await ir(p, '/meta/g2'); await p.waitForTimeout(900); await tocar(p, 'Agregar plata a esta meta'); await p.fill('#monto', '10'); await p.waitForTimeout(500);
        await tocar(p, 'Continuar'); await tocar(p, 'Su propina de la semana'); await tocar(p, 'Continuar'); await p.waitForTimeout(500);
        await tocar(p, 'Sí, anotar'); await p.waitForTimeout(2000); await tocar(p, 'Volver a Alcancía'); await p.waitForTimeout(2500);
      }],
      ['navegacion-y-biblioteca', weekState(), async (p) => {
        await ir(p, '/'); await p.waitForTimeout(800); await tocar(p, 'Aprender'); await p.waitForTimeout(800);
        await p.getByRole('link', { name: 'Biblioteca' }).first().click(); await p.waitForTimeout(800);
        await p.getByRole('tab', { name: 'Misiones' }).click(); await p.waitForTimeout(800); await p.getByRole('tab', { name: 'Juegos' }).click(); await p.waitForTimeout(800);
        await p.getByRole('tab', { name: 'Cuentos' }).click(); await p.waitForTimeout(800); await p.getByRole('link', { name: 'Progreso' }).click(); await p.waitForTimeout(1500);
      }],
      ['anotar-y-felicitar', weekState(), async (p) => {
        await ir(p, '/aprender'); await p.waitForTimeout(600); await tocar(p, 'Anotar algo que pasó');
        await p.fill('#mom-titulo', 'Ahorró para la pelota'); await p.fill('#mom-texto', 'Decidió no comprar dulces para guardar para su pelota.'); await p.fill('#mom-autor', 'Papá');
        await p.waitForTimeout(500); await p.getByRole('button', { name: 'Guardar', exact: true }).click(); await p.waitForTimeout(900);
        await tocar(p, 'Mandarle un mensajito'); await tocar(p, '¡Qué chévere'); await p.waitForTimeout(400); await p.getByRole('button', { name: 'Guardar', exact: true }).click(); await p.waitForTimeout(1500);
      }],
      ['chanchito-sin-conexion', weekState(), async (p) => {
        await ir(p, '/chanchito'); await p.waitForTimeout(700); await tocar(p, 'Intentar otra vez'); await p.waitForTimeout(2500);
      }],
    ];
    for (const [nombre, estado, flujo] of videos) {
      const { ctx, page } = await pagina(b, estado, nombre);
      await flujo(page);
      const path = await page.video()!.path();
      await ctx.close();
      renameSync(path, join(VIDS, `${nombre}.webm`));
    }
    for (const f of readdirSync(VIDS)) if (!/^[a-z-]+\.webm$/.test(f)) rmSync(join(VIDS, f));

    write(join(OUT, 'README.md'), `# Referencias visuales (DS v3.4)

Generadas con \`npm run handoff:capturas\` desde el prototipo web, a 402 × 874 dp con densidad 2×. Son la referencia de **textos, estados y comportamiento**. Para medidas exactas, usa los tokens y el editable de Pencil.

## Pantallas (${indice.length})

| Archivo | Ruta en el prototipo | Datos | Nota |
|---|---|---|---|
${indice.map((s) => `| \`pantallas/${s.archivo}\` | \`${s.ruta}\` | ${s.estado} | ${s.nota ?? ''} |`).join('\n')}

Datos: **vacío** = cuenta nueva (06-datos/semillas/vacio.json); **semana** = una semana de uso (06-datos/semillas/semana.json).

## Videos (animaciones)

| Archivo | Qué muestra |
|---|---|
| \`videos/agregar-plata.webm\` | Flujo de 4 pasos, check con rebote, regreso con conteo del saldo y movimiento nuevo resaltado |
| \`videos/meta-lograda.webm\` | Agregar a una meta hasta completarla: aviso «¡Ya juntaron todo…!» y estado «¡Logrado!» |
| \`videos/navegacion-y-biblioteca.webm\` | Píldora de pestañas y de formatos deslizándose, transición entre pantallas |
| \`videos/anotar-y-felicitar.webm\` | Anotar algo que pasó y mandar un mensajito |
| \`videos/chanchito-sin-conexion.webm\` | «Intentar otra vez» → Conectando… → error recuperable |

Los .webm se abren en Chrome, Firefox o VLC.
`);
    console.log(`✔ ${indice.length} capturas y ${videos.length} videos en entrega/.generado`);
  } finally {
    await b.close();
    srv.kill();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
