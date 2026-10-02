/**
 * Arma el paquete para el equipo móvil: entrega/alcancia-dev-handoff-v3.4/ y su .zip.
 * Uso: npm run handoff   (antes: npm run handoff:capturas para regenerar capturas y videos)
 */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DS, ROOT, androidName, copy, copyDir, exportAssets, exportStrings, exportTokens, write } from './exportar';
import { ACTIVITIES, GAMES, MISSIONS, STORIES } from '../../src/lib/content';
import { exampleState, firstDayState, weekState } from '../../src/lib/store';
import { formatMoney, parseAmount, percent } from '../../src/lib/money';

const NOMBRE = 'alcancia-dev-handoff-v3.4';
const OUT = join(ROOT, 'entrega', NOMBRE);
const HANDOFF = join(ROOT, 'scripts', 'handoff');
const GEN = join(ROOT, 'entrega', '.generado'); // capturas y videos (npm run handoff:capturas)

rmSync(OUT, { recursive: true, force: true });
rmSync(`${OUT}.zip`, { force: true });

// 00 / 01 / 02 · documentación escrita a mano
copyDir(join(HANDOFF, 'docs'), OUT);

// 03 · diseño
const D = join(OUT, '03-diseno');
copyDir(DS, join(D, 'sistema-de-diseno'));
exportTokens(join(D, 'tokens'));

// 04 · assets
const assets = exportAssets(join(OUT, '04-assets'));

// 05 · textos
const textos = exportStrings(join(OUT, '05-textos'));

// 06 · datos
const DATA = join(OUT, '06-datos');
write(join(DATA, 'contenido.json'), JSON.stringify({ cuentos: STORIES, misiones: MISSIONS, juegos: GAMES, actividades: Object.values(ACTIVITIES) }, null, 2));
const hoy = new Date().toISOString();
const semilla = (nombre: string, estado: unknown, nota: string) =>
  write(join(DATA, 'semillas', `${nombre}.json`), JSON.stringify({ _nota: nota, _generado: hoy, estado }, null, 2));
semilla('vacio', firstDayState(), 'Primer día: todo en cero. Es el estado inicial real de una cuenta nueva.');
semilla('ejemplo', exampleState(), 'Datos de las pantallas de referencia del DS (Sofía, S/ 15.00).');
semilla('semana', weekState(), 'Una semana de uso. Las fechas son relativas a _generado: desplázalas para que el último registro caiga «hoy».');
copy(join(DS, 'contratos', 'dominio.ts'), join(DATA, 'modelos', 'dominio.ts'));
copy(join(HANDOFF, 'plantillas', 'Modelos.kt'), join(DATA, 'modelos', 'android', 'Modelos.kt'));
copy(join(HANDOFF, 'plantillas', 'Modelos.swift'), join(DATA, 'modelos', 'ios', 'Modelos.swift'));

// Casos de prueba compartidos: salen de la regla web real, para correrlos igual en Android e iOS.
const entradas = ['', '   ', '0', '0.00', '-5', 'abc', '10', '10.5', '10.50', 'S/ 10', 'S/10.50', '0,07', '1,000.50', '1.234', '10.', '.5', '1000', '1000.01', '99999999999', ' 25 '];
const casos = entradas.map((input) => {
  const r = parseAmount(input);
  return r.ok ? { input, ok: true, centimos: r.money.minorUnits, texto: formatMoney(r.money) } : { input, ok: false, codigo: r.code, androidString: androidName(r.code), error: r.error };
});
write(join(DATA, 'casos-de-prueba', 'dinero.json'), JSON.stringify({
  _nota: 'Generado desde src/lib/money.ts. Las apps nativas deben dar el mismo resultado (ok/céntimos o el mismo mensaje de error).',
  validar: casos,
  porcentaje: [[600, 3000], [400, 4000], [5000, 3000], [0, 0], [1, 3]].map(([g, o]) => ({ guardado: g, objetivo: o, porcentaje: percent(g, o) })),
  formato: [0, 7, 1500, 4305, -500].map((c) => ({ centimos: c, texto: formatMoney(c) })),
}, null, 2));

// 07 · referencias visuales (si se generaron)
if (existsSync(GEN)) copyDir(GEN, join(OUT, '07-referencias'));
else console.warn('⚠️  Sin capturas: corre «npm run handoff:capturas» antes para incluir 07-referencias.');

// 08 · prototipo web (código fuente, sin dependencias ni compilados)
const P = join(OUT, '08-prototipo-web');
for (const f of ['package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'vercel.json', 'index.html', 'README.md']) copy(join(ROOT, f), join(P, f));
copyDir(join(ROOT, 'src'), join(P, 'src'));
copyDir(join(ROOT, 'public'), join(P, 'public'));
copyDir(join(ROOT, 'scripts'), join(P, 'scripts'));

// 09 · backlog
copyDir(join(HANDOFF, 'backlog'), join(OUT, '09-backlog'));

// Verificación: toda ruta del paquete citada en los documentos debe existir.
const citadas = new Set<string>();
const mdFiles: string[] = [];
const walkMd = (d: string) => readdirSync(d).forEach((f) => { const p = join(d, f); if (statSync(p).isDirectory()) { if (!p.includes('08-prototipo-web') && !p.includes('sistema-de-diseno')) walkMd(p); } else if (f.endsWith('.md')) mdFiles.push(p); });
walkMd(OUT);
for (const f of mdFiles) for (const m of readFileSync(f, 'utf8').matchAll(/`(0\d-[^`\s]+?)`/g)) citadas.add(m[1].replace(/[#].*$/, '').replace(/\/$/, ''));
const rotas = [...citadas].filter((p) => !/[*…]/.test(p) && !existsSync(join(OUT, p))); // los patrones con * o … no son rutas literales
if (rotas.length) { console.error('✘ Rutas citadas que no existen en el paquete:\n  ' + rotas.join('\n  ')); process.exit(1); }

// Manifest de integridad
const files: string[] = [];
const walk = (d: string) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p); });
walk(OUT);
const manifest = files.sort().map((f) => `${createHash('sha256').update(readFileSync(f)).digest('hex')}  ${relative(OUT, f)}`).join('\n');
write(join(OUT, 'manifest.sha256'), manifest);

execSync(`cd "${join(ROOT, 'entrega')}" && zip -qr -X "${NOMBRE}.zip" "${NOMBRE}"`);
const mb = (statSync(`${OUT}.zip`).size / 1024 / 1024).toFixed(1);
console.log(`✔ ${relative(ROOT, OUT)}.zip · ${mb} MB · ${files.length + 1} archivos · ${textos.total} textos (${textos.plurales} plurales) · ${assets.iconos} iconos`);
