/**
 * Exportadores del paquete para desarrollo móvil.
 * Todo sale de las fuentes del repo: tokens del sistema de diseño, src/i18n/es.json,
 * src/lib/content.ts y las semillas de src/lib/store.tsx.
 */
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const ROOT = join(__dirname, '..', '..');
export const DS = join(ROOT, 'docs', 'sistema-de-diseno');

export function write(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.endsWith('\n') ? content : content + '\n');
}
export function copy(from: string, to: string) {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}
export function copyDir(from: string, to: string, skip: (name: string) => boolean = () => false) {
  for (const e of readdirSync(from, { withFileTypes: true })) {
    if (skip(e.name)) continue;
    const a = join(from, e.name), b = join(to, e.name);
    if (e.isDirectory()) copyDir(a, b, skip);
    else copy(a, b);
  }
}

const GENERADO = 'Generado por scripts/handoff (npm run handoff). No editar a mano: cambia la fuente y vuelve a generar.';
const camel = (k: string) => k.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const Pascal = (k: string) => camel(k).replace(/^./, (c) => c.toUpperCase());

/* ------------------------------------------------------------------ tokens */

type Token = { value: string | number; unit: string; legacy: boolean };
const tokens = (): Record<string, Token> => JSON.parse(readFileSync(join(DS, 'tokens', 'tokens-1x.json'), 'utf8'));

/** Roles tipográficos del DS v3.4 (tamaño sp / interlínea sp / peso). */
export const TYPE_ROLES = [
  { id: 'importe', size: 36, line: 44, weight: 600, uso: 'S/ 15.00' },
  { id: 'tituloPantalla', size: 26, line: 34, weight: 600, uso: 'Alcancía, Aprender, ¿Cuánto va a guardar?' },
  { id: 'destacado', size: 22, line: 30, weight: 600, uso: 'Fijar una meta de ahorro' },
  { id: 'bienvenida', size: 20, line: 28, weight: 600, uso: 'Aprendan a ahorrar juntos, título de momento' },
  { id: 'seccion', size: 18, line: 26, weight: 600, uso: 'Sus metas' },
  { id: 'boton', size: 16, line: 24, weight: 600, uso: 'Agregar plata' },
  { id: 'elemento', size: 16, line: 24, weight: 500, uso: 'Libro de dinosaurios' },
  { id: 'relato', size: 16, line: 24, weight: 400, uso: 'Texto del cuento' },
  { id: 'cuerpo', size: 15, line: 22, weight: 400, uso: 'Explicaciones y ayudas' },
  { id: 'secundario', size: 14, line: 20, weight: 400, uso: 'Descripciones cortas' },
  { id: 'metadatos', size: 13, line: 18, weight: 400, uso: 'Ahorrar · 5 min' },
  { id: 'etiqueta', size: 12, line: 16, weight: 600, uso: 'LLEVA AHORRADO, navegación' },
] as const;

/** Movimiento (ms y curvas) usado en el prototipo; ver 02-especificacion/animaciones.md. */
export const MOTION = [
  { id: 'rapida', ms: 120, curva: 'standard', uso: 'Respuesta táctil (escala 0.98)' },
  { id: 'corta', ms: 200, curva: 'decelerate', uso: 'Aparición de contenido, cambio de formato' },
  { id: 'pantalla', ms: 240, curva: 'emphasized', uso: 'Entrada de pantallas y subpantallas' },
  { id: 'pildora', ms: 280, curva: 'emphasized', uso: 'Indicador de pestaña / formato que se desliza' },
  { id: 'confirmacion', ms: 450, curva: 'overshoot', uso: 'Icono de éxito con rebote' },
  { id: 'conteo', ms: 700, curva: 'decelerate', uso: 'Conteo del saldo y barras de avance' },
] as const;
const CURVES: Record<string, [number, number, number, number]> = {
  standard: [0.2, 0, 0, 1], decelerate: [0, 0, 0.2, 1], emphasized: [0.2, 0.8, 0.2, 1], overshoot: [0.2, 0.9, 0.3, 1.3],
};

export function exportTokens(out: string) {
  const all = tokens();
  const current = Object.entries(all).filter(([, t]) => !t.legacy);
  const colors = current.filter(([, t]) => typeof t.value === 'string' && String(t.value).startsWith('#'));
  const dims = current.filter(([k, t]) => t.unit === 'dp' && !k.startsWith('ui-'));

  // JSON neutral (sirve para Flutter / React Native)
  write(join(out, 'tokens.json'), JSON.stringify({
    _nota: 'Valores a 1×: dp para dimensiones, sp para texto. La interlínea es en sp (tamaño × ratio).',
    color: Object.fromEntries(colors.map(([k, t]) => [k, t.value])),
    dimension: Object.fromEntries(dims.map(([k, t]) => [k, t.value])),
    tipografia: { familia: 'Inter', roles: TYPE_ROLES },
    movimiento: MOTION.map((m) => ({ ...m, cubicBezier: CURVES[m.curva] })),
  }, null, 2));

  // Android · Jetpack Compose
  const kColors = colors.map(([k, t]) => `    val ${Pascal(k)} = Color(0xFF${String(t.value).slice(1).toUpperCase()})`).join('\n');
  const kDims = dims.map(([k, t]) => `    val ${Pascal(k.replace(/^ds-/, ''))} = ${t.value}.dp`).join('\n');
  const kType = TYPE_ROLES.map((r) => `    /** ${r.size}/${r.line} · ${r.weight} · ${r.uso} */\n    val ${r.id} = TextStyle(fontFamily = Inter, fontSize = ${r.size}.sp, lineHeight = ${r.line}.sp, fontWeight = FontWeight(${r.weight}))`).join('\n');
  const kMotion = MOTION.map((m) => `    /** ${m.uso} */\n    const val ${Pascal(m.id)}Ms = ${m.ms}`).join('\n');
  const kCurves = Object.entries(CURVES).map(([k, c]) => `    val ${Pascal(k)} = CubicBezierEasing(${c.map((n) => `${n}f`).join(', ')})`).join('\n');
  write(join(out, 'android', 'AlcanciaTokens.kt'), `// ${GENERADO}
package pe.alcancia.ui.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
// import <tu.paquete>.R  ← ajustar al paquete de la app

/** Colores del DS v3.4. Blanco siempre como fondo de página; fondos suaves solo en bloques con significado. */
object AlcanciaColor {
${kColors}
}

/** Dimensiones a 1× (dp). Objetivo táctil mínimo: TouchMin. */
object AlcanciaDimen {
${kDims}
}

/** Inter variable: copiar 04-assets/fuentes/Inter-variable.ttf a res/font/inter.ttf. */
val Inter = FontFamily(
    Font(R.font.inter, FontWeight(400)),
    Font(R.font.inter, FontWeight(500)),
    Font(R.font.inter, FontWeight(600)),
)

/** Roles tipográficos. Usar sp: respetan el tamaño de texto del sistema. */
object AlcanciaType {
${kType}
}

/** Duraciones (ms) y curvas. Si el sistema pide reducir animaciones, usar 0 ms. */
object AlcanciaMotion {
${kMotion}
}

object AlcanciaEasing {
${kCurves}
}
`);

  // iOS · SwiftUI
  const sColors = colors.map(([k, t]) => `    static let ${camel(k)} = Color(hex: 0x${String(t.value).slice(1).toUpperCase()})`).join('\n');
  const sDims = dims.map(([k, t]) => `    static let ${camel(k.replace(/^ds-/, ''))}: CGFloat = ${t.value}`).join('\n');
  const textStyle = (size: number) => (size >= 26 ? '.title' : size >= 20 ? '.title3' : size >= 17 ? '.headline' : size >= 15 ? '.body' : size >= 13 ? '.footnote' : '.caption');
  const sType = TYPE_ROLES.map((r) => `    /// ${r.size}/${r.line} · ${r.weight} · ${r.uso}\n    static let ${r.id} = AlcanciaTextStyle(size: ${r.size}, lineHeight: ${r.line}, weight: ${r.weight}, relativeTo: ${textStyle(r.size)})`).join('\n');
  const sMotion = MOTION.map((m) => `    /// ${m.uso}\n    static let ${m.id}: Double = ${m.ms / 1000}`).join('\n');
  const sCurves = Object.entries(CURVES).map(([k, c]) => `    static func ${k}(_ d: Double) -> Animation { .timingCurve(${c.join(', ')}, duration: d) }`).join('\n');
  write(join(out, 'ios', 'AlcanciaTokens.swift'), `// ${GENERADO}
import SwiftUI

/// Colores del DS v3.4. Blanco siempre como fondo de página; fondos suaves solo en bloques con significado.
enum AlcanciaColor {
${sColors}
}

/// Dimensiones a 1× (pt). Objetivo táctil mínimo: touchMin.
enum AlcanciaDimen {
${sDims}
}

/// Rol tipográfico con Dynamic Type: el tamaño escala con la preferencia del sistema.
struct AlcanciaTextStyle {
    let size: CGFloat
    let lineHeight: CGFloat
    let weight: Int
    let relativeTo: Font.TextStyle

    var font: Font {
        let w: Font.Weight = weight >= 600 ? .semibold : weight >= 500 ? .medium : .regular
        return .custom("Inter", size: size, relativeTo: relativeTo).weight(w)
    }
    /// SwiftUI usa espacio extra entre líneas, no altura de línea total.
    var lineSpacing: CGFloat { lineHeight - size }
}

enum AlcanciaType {
${sType}
}

extension View {
    func alcanciaText(_ style: AlcanciaTextStyle) -> some View {
        font(style.font).lineSpacing(style.lineSpacing)
    }
}

/// Duraciones (s). Respetar @Environment(\\.accessibilityReduceMotion): sin animación si está activo.
enum AlcanciaMotion {
${sMotion}
}

enum AlcanciaEasing {
${sCurves}
}

extension Color {
    init(hex: UInt32) {
        self.init(red: Double((hex >> 16) & 0xFF) / 255, green: Double((hex >> 8) & 0xFF) / 255, blue: Double(hex & 0xFF) / 255)
    }
}
`);

  // Android XML (para vistas clásicas)
  write(join(out, 'android', 'res', 'values', 'colors.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<!-- ${GENERADO} -->\n<resources>\n${colors.map(([k, t]) => `    <color name="${k.replace(/-/g, '_')}">${t.value}</color>`).join('\n')}\n</resources>`);
  write(join(out, 'android', 'res', 'values', 'dimens.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<!-- ${GENERADO} -->\n<resources>\n${dims.map(([k, t]) => `    <dimen name="${k.replace(/-/g, '_')}">${t.value}dp</dimen>`).join('\n')}\n${TYPE_ROLES.map((r) => `    <dimen name="texto_${r.id.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())}">${r.size}sp</dimen>`).join('\n')}\n</resources>`);
}

/* ----------------------------------------------------------------- textos */

type Tree = { [k: string]: string | Tree };
export function flatten(tree: Tree, prefix = ''): [string, string][] {
  return Object.entries(tree).flatMap(([k, v]) => (typeof v === 'string' ? [[prefix + k, v] as [string, string]] : flatten(v, `${prefix}${k}.`)));
}
export const androidName = (key: string) =>
  key.replace(/[.-]/g, '_').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

function args(v: string) {
  const names: string[] = [];
  for (const m of v.matchAll(/\{(\w+)\}/g)) if (!names.includes(m[1]) && m[1] !== 'count') names.push(m[1]);
  return names;
}
const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/^([@?])/, '\\$1');

export function exportStrings(out: string) {
  const es: Tree = JSON.parse(readFileSync(join(ROOT, 'src', 'i18n', 'es.json'), 'utf8'));
  const flat = flatten(es);
  const plurals = new Map<string, { one: string; other: string }>();
  const simple: [string, string][] = [];
  for (const [k, v] of flat) {
    const m = k.match(/^(.*)_(one|other)$/);
    if (m) { const p = plurals.get(m[1]) ?? { one: '', other: '' }; p[m[2] as 'one' | 'other'] = v; plurals.set(m[1], p); }
    else simple.push([k, v]);
  }
  copy(join(ROOT, 'src', 'i18n', 'es.json'), join(out, 'es.json'));

  // Android: posicionales %1$s, %2$s… en orden de aparición. Con argumentos, «%» literal se escribe «%%».
  const andPh = (v: string, plural = false) => {
    const names = args(v);
    const hasArgs = names.length > 0 || plural;
    let r = hasArgs ? v.replace(/%/g, '%%') : v;
    r = r.replace(/\{count\}/g, '%1$d');
    names.forEach((n, i) => { r = r.split(`{${n}}`).join(`%${i + (plural ? 2 : 1)}$s`); });
    return { text: xmlEscape(r), names };
  };
  const aLines = simple.map(([k, v]) => {
    const { text, names } = andPh(v);
    const doc = names.length ? `    <!-- ${k} · ${names.map((n, i) => `%${i + 1}$s = ${n}`).join(', ')} -->\n` : `    <!-- ${k} -->\n`;
    return `${doc}    <string name="${androidName(k)}">${text}</string>`;
  });
  const aPlurals = [...plurals].map(([k, p]) => {
    const one = andPh(p.one, true), other = andPh(p.other, true);
    return `    <!-- ${k} · %1$d = cantidad -->\n    <plurals name="${androidName(k)}">\n        <item quantity="one">${one.text}</item>\n        <item quantity="other">${other.text}</item>\n    </plurals>`;
  });
  const xml = `<?xml version="1.0" encoding="utf-8"?>\n<!-- ${GENERADO}\n     Fuente: src/i18n/es.json · Español peruano familiar (ver 03-diseno/sistema-de-diseno/documentacion/lenguaje.md) -->\n<resources>\n${[...aLines, ...aPlurals].join('\n')}\n</resources>`;
  write(join(out, 'android', 'res', 'values', 'strings.xml'), xml);
  write(join(out, 'android', 'res', 'values-es', 'strings.xml'), xml);

  // iOS: claves con punto (como en es.json), %1$@ posicionales; plurales en .stringsdict.
  const iosEsc = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  const iosPh = (v: string, plural = false) => {
    const names = args(v);
    let r = names.length || plural ? v.replace(/%/g, '%%') : v;
    r = r.replace(/\{count\}/g, '%1$d');
    names.forEach((n, i) => { r = r.split(`{${n}}`).join(`%${i + (plural ? 2 : 1)}$@`); });
    return { text: r, names };
  };
  const iLines = simple.map(([k, v]) => {
    const { text, names } = iosPh(v);
    return `${names.length ? `/* ${names.map((n, i) => `%${i + 1}$@ = ${n}`).join(', ')} */\n` : ''}"${k}" = "${iosEsc(text)}";`;
  });
  write(join(out, 'ios', 'es.lproj', 'Localizable.strings'), `/* ${GENERADO}\n   Fuente: src/i18n/es.json */\n\n${iLines.join('\n')}`);
  const dict = [...plurals].map(([k, p]) => `    <key>${k}</key>
    <dict>
        <key>NSStringLocalizedFormatKey</key>
        <string>%#@cantidad@</string>
        <key>cantidad</key>
        <dict>
            <key>NSStringFormatSpecTypeKey</key>
            <string>NSStringPluralRuleType</string>
            <key>NSStringFormatValueTypeKey</key>
            <string>d</string>
            <key>one</key>
            <string>${iosPh(p.one, true).text.replace('%1$d', '%d')}</string>
            <key>other</key>
            <string>${iosPh(p.other, true).text.replace('%1$d', '%d')}</string>
        </dict>
    </dict>`).join('\n');
  write(join(out, 'ios', 'es.lproj', 'Localizable.stringsdict'), `<?xml version="1.0" encoding="UTF-8"?>\n<!-- ${GENERADO} -->\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n${dict}\n</dict>\n</plist>`);

  // Tabla de equivalencias para buscar un texto en las tres plataformas.
  const rows = flat.map(([k, v]) => `| \`${k}\` | \`${androidName(k.replace(/_(one|other)$/, ''))}\` | ${v.replace(/\|/g, '\\|')} |`);
  write(join(out, 'claves.md'), `# Claves de texto\n\n${GENERADO}\n\nUna misma clave en las tres plataformas. Las variables van entre llaves en es.json y se vuelven posicionales en Android (\`%1$s\`) e iOS (\`%1$@\`), en el orden en que aparecen. Cada string del XML trae un comentario con ese orden.\n\n| es.json / iOS | Android | Texto |\n|---|---|---|\n${rows.join('\n')}\n`);
  return { total: flat.length, plurales: plurals.size };
}

/* ----------------------------------------------------------------- assets */

export function exportAssets(out: string) {
  copy(join(DS, 'assets', 'fuentes', 'Inter-variable.ttf'), join(out, 'fuentes', 'Inter-variable.ttf'));
  copy(join(DS, 'assets', 'fuentes', 'OFL-Inter.txt'), join(out, 'fuentes', 'OFL-Inter.txt'));
  copy(join(DS, 'assets', 'fuentes', 'Inter-variable.ttf'), join(out, 'fuentes', 'android', 'res', 'font', 'inter.ttf'));

  const icons = readdirSync(join(ROOT, 'src', 'assets', 'iconos')).filter((f) => f.endsWith('.svg'));
  for (const f of icons) copy(join(ROOT, 'src', 'assets', 'iconos', f), join(out, 'iconos', 'svg', f));
  copy(join(DS, 'assets', 'iconos', 'LICENSE-Lucide.txt'), join(out, 'iconos', 'LICENSE-Lucide.txt'));

  // Mascota: 1× = mdpi / @1x, 2× = xhdpi / @2x, 3× = xxhdpi / @3x.
  const m = (s: string) => join(ROOT, 'src', 'assets', 'mascota', `mascota-${s}.png`);
  copy(m('1x'), join(out, 'mascota', 'android', 'res', 'drawable-mdpi', 'mascota.png'));
  copy(m('2x'), join(out, 'mascota', 'android', 'res', 'drawable-xhdpi', 'mascota.png'));
  copy(m('3x'), join(out, 'mascota', 'android', 'res', 'drawable-xxhdpi', 'mascota.png'));
  const set = join(out, 'mascota', 'ios', 'Mascota.imageset');
  copy(m('1x'), join(set, 'mascota.png'));
  copy(m('2x'), join(set, 'mascota@2x.png'));
  copy(m('3x'), join(set, 'mascota@3x.png'));
  write(join(set, 'Contents.json'), JSON.stringify({
    images: [
      { idiom: 'universal', filename: 'mascota.png', scale: '1x' },
      { idiom: 'universal', filename: 'mascota@2x.png', scale: '2x' },
      { idiom: 'universal', filename: 'mascota@3x.png', scale: '3x' },
    ],
    info: { author: 'xcode', version: 1 },
  }, null, 2));
  copyDir(join(DS, 'assets', 'icono-app'), join(out, 'icono-app'));
  return { iconos: icons.length };
}
