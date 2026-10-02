/**
 * Arma el kit de front para Android (Compose) e iOS (SwiftUI): entrega/alcancia-front-kit-v3.4/ y su .zip.
 * Uso: npm run front-kit
 *   1. genera tokens, textos, iconos y datos de ejemplo (generar.ts)
 *   2. verifica que toda clave de texto usada en Kotlin y Swift exista en es.json
 *   3. copia código, recursos y capturas, y arma el zip
 * Las capturas del kit salen de `npm run front-kit:verificar` (compila el kit Compose y lo renderiza).
 */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { DS, ROOT, copy, copyDir, exportStrings, flatten, write } from '../handoff/exportar';
import { KIT, generar } from './generar';
import { exportarIconos } from './iconos';
import es from '../../src/i18n/es.json';

const NOMBRE = 'alcancia-front-kit-v3.4';
const OUT = join(ROOT, 'entrega', NOMBRE);
const CAPTURAS = join(KIT, 'verificar', 'build', 'capturas');
const FUENTES = join(KIT, 'fuentes');

/* 1 · generar */
const gen = generar();

/* 2 · claves de texto usadas en el código nativo */
const claves = new Set(flatten(es as never).map(([k]) => k.replace(/_(one|other)$/, '')));
const fuentes: string[] = [];
const walk = (d: string, ext: RegExp) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p, ext) : ext.test(f) && fuentes.push(p); });
walk(join(KIT, 'android'), /\.kt$/); walk(join(KIT, 'ios'), /\.swift$/);
const faltan: string[] = [];
for (const f of fuentes) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\bt[n]?\(\s*"([a-zA-Z][\w.-]*)"/g)) if (!claves.has(m[1])) faltan.push(`${relative(KIT, f)}: ${m[1]}`);
  // Claves armadas con un id del catálogo: motivos.<id>, quien.<id>.
  for (const m of s.matchAll(/(?:Opcion\(|Opcion\(id: )"([\w-]+)"/g)) if (!claves.has(`motivos.${m[1]}`) && !claves.has(`quien.${m[1]}`)) faltan.push(`${relative(KIT, f)}: opción ${m[1]}`);
}
for (const k of ['titulo', 'pregunta', 'deDonde', 'paraMeta', 'ahora', 'confirmar', 'listo']) for (const f of ['in', 'out']) if (!claves.has(`flujo.${f}.${k}`)) faltan.push(`flujo.${f}.${k}`);
if (faltan.length) { console.error('✘ Claves de texto que no existen en es.json:\n  ' + faltan.join('\n  ')); process.exit(1); }

/* 3 · armar */
if (!existsSync(join(FUENTES, 'inter_semibold.ttf'))) {
  console.log('· Generando Inter por peso (pip install fonttools)…');
  execSync(`mkdir -p "${FUENTES}" && for w in 400:regular 500:medium 600:semibold; do fonttools varLib.instancer -q "${join(DS, 'assets', 'fuentes', 'Inter-variable.ttf')}" wght=\${w%%:*} -o "${FUENTES}/inter_\${w##*:}.ttf" --update-name-table; done`, { stdio: 'inherit', shell: '/bin/bash' });
}
rmSync(OUT, { recursive: true, force: true });
rmSync(`${OUT}.zip`, { force: true });

copyDir(join(KIT, 'docs'), OUT);

// Android
const A = join(OUT, 'android');
copyDir(join(KIT, 'android', 'ui'), join(A, 'ui'));
copy(join(KIT, 'android', 'plataforma', 'Plataforma.kt'), join(A, 'plataforma', 'Plataforma.kt'));
copy(join(KIT, 'android', 'previews', 'Previews.kt'), join(A, 'previews', 'Previews.kt'));
const tmp = mkdtempSync(join(tmpdir(), 'textos-'));
exportStrings(tmp);
copy(join(tmp, 'android', 'res', 'values', 'strings.xml'), join(A, 'res', 'values', 'strings.xml'));
for (const w of ['regular', 'medium', 'semibold']) copy(join(FUENTES, `inter_${w}.ttf`), join(A, 'res', 'font', `inter_${w}.ttf`));
const mascota = (s: string) => join(ROOT, 'src', 'assets', 'mascota', `mascota-${s}.png`);
copy(mascota('1x'), join(A, 'res', 'drawable-mdpi', 'mascota.png'));
copy(mascota('2x'), join(A, 'res', 'drawable-xhdpi', 'mascota.png'));
copy(mascota('3x'), join(A, 'res', 'drawable-xxhdpi', 'mascota.png'));

// Ícono de la app (maestro en el sistema de diseño)
const ICONO = join(DS, 'assets', 'icono-app');
for (const d of readdirSync(join(ICONO, 'android')).filter((x) => x.startsWith('mipmap'))) copyDir(join(ICONO, 'android', d), join(A, 'res', d));

// iOS
const I = join(OUT, 'ios');
copyDir(join(KIT, 'ios', 'Alcancia'), join(I, 'Alcancia'));
const XC = join(I, 'Recursos', 'Assets.xcassets');
write(join(XC, 'Contents.json'), JSON.stringify({ info: { author: 'xcode', version: 1 } }, null, 2));
const iconos = exportarIconos(join(A, 'res'), XC);
copyDir(join(ICONO, 'ios', 'AppIcon.appiconset'), join(XC, 'AppIcon.appiconset'));
const set = join(XC, 'Mascota.imageset');
copy(mascota('1x'), join(set, 'mascota.png')); copy(mascota('2x'), join(set, 'mascota@2x.png')); copy(mascota('3x'), join(set, 'mascota@3x.png'));
write(join(set, 'Contents.json'), JSON.stringify({ images: [1, 2, 3].map((n) => ({ idiom: 'universal', filename: n === 1 ? 'mascota.png' : `mascota@${n}x.png`, scale: `${n}x` })), info: { author: 'xcode', version: 1 } }, null, 2));
copy(join(tmp, 'ios', 'es.lproj', 'Localizable.strings'), join(I, 'Recursos', 'es.lproj', 'Localizable.strings'));
copy(join(tmp, 'ios', 'es.lproj', 'Localizable.stringsdict'), join(I, 'Recursos', 'es.lproj', 'Localizable.stringsdict'));
for (const [w, ps] of [['regular', 'Regular'], ['medium', 'Medium'], ['semibold', 'SemiBold']]) copy(join(FUENTES, `inter_${w}.ttf`), join(I, 'Recursos', 'Fuentes', `Inter-${ps}.ttf`));
copy(join(DS, 'assets', 'fuentes', 'OFL-Inter.txt'), join(I, 'Recursos', 'Fuentes', 'OFL-Inter.txt'));
copy(join(DS, 'assets', 'fuentes', 'OFL-Inter.txt'), join(A, 'res', 'font', 'OFL-Inter.txt'));
copy(join(DS, 'assets', 'mascota', 'chanchito.svg'), join(OUT, 'mascota-vector', 'chanchito.svg'));
copy(join(DS, 'assets', 'mascota', 'LEEME.md'), join(OUT, 'mascota-vector', 'LEEME.md'));
rmSync(tmp, { recursive: true, force: true });

// Capturas: las del kit (Compose renderizado) y las de la web para comparar.
if (existsSync(CAPTURAS)) copyDir(CAPTURAS, join(OUT, 'capturas', 'kit-compose'));
else console.warn('⚠️  Sin capturas del kit: corre «npm run front-kit:verificar» antes.');
const WEB = join(ROOT, 'entrega', '.generado', 'pantallas');
if (existsSync(WEB)) for (const f of readdirSync(WEB).filter((x) => /alcancia-con-datos|alcancia-primer-dia|alcancia-borrador|recordatorio-propina\.png|agregar-|sacar-|^\d+-movimientos\.png/.test(x))) copy(join(WEB, f), join(OUT, 'capturas', 'web', f));

// Verificación en escritorio (opcional para el equipo): el mismo proyecto que generó las capturas.
copyDir(join(KIT, 'verificar'), join(OUT, 'verificacion-escritorio'), (n) => ['build', '.gradle', '.kotlin'].includes(n));

// Manifest y zip
const files: string[] = [];
const all = (d: string) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? all(p) : files.push(p); });
all(OUT);
write(join(OUT, 'manifest.sha256'), files.sort().map((f) => `${createHash('sha256').update(readFileSync(f)).digest('hex')}  ${relative(OUT, f)}`).join('\n'));
execSync(`cd "${join(ROOT, 'entrega')}" && zip -qr -X "${NOMBRE}.zip" "${NOMBRE}"`);
const mb = (statSync(`${OUT}.zip`).size / 1024 / 1024).toFixed(1);
console.log(`✔ ${relative(ROOT, OUT)}.zip · ${mb} MB · ${files.length + 1} archivos · ${iconos.length} iconos · ${gen.textos} textos · ${fuentes.length} archivos de código revisados`);
