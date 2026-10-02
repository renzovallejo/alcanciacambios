/**
 * Iconos Lucide → Android VectorDrawable (res/drawable/ic_<nombre>.xml) e iOS (Assets.xcassets/Iconos/ic-<nombre>.imageset con SVG).
 * Lucide usa solo <path>, <circle> y <rect> con trazo de 2 en una grilla de 24: se convierten a pathData equivalente.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, write } from '../handoff/exportar';

const SRC = join(ROOT, 'src', 'assets', 'iconos');
const num = (s: string | undefined, d = 0) => (s === undefined ? d : Number(s));
const attrs = (tag: string) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

/** Un elemento SVG → datos de trazado (mismo dibujo). */
export function aPathData(tag: string): string {
  const a = attrs(tag);
  if (tag.startsWith('<path')) return a.d;
  if (tag.startsWith('<circle')) {
    const cx = num(a.cx), cy = num(a.cy), r = num(a.r);
    return `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;
  }
  if (tag.startsWith('<rect')) {
    const x = num(a.x), y = num(a.y), w = num(a.width), h = num(a.height);
    const rx = Math.min(num(a.rx, num(a.ry)), w / 2), ry = Math.min(num(a.ry, rx), h / 2);
    if (!rx) return `M${x},${y}h${w}v${h}h${-w}z`;
    return `M${x + rx},${y}h${w - 2 * rx}a${rx},${ry} 0 0 1 ${rx},${ry}v${h - 2 * ry}a${rx},${ry} 0 0 1 ${-rx},${ry}h${-(w - 2 * rx)}a${rx},${ry} 0 0 1 ${-rx},${-ry}v${-(h - 2 * ry)}a${rx},${ry} 0 0 1 ${rx},${-ry}z`;
  }
  throw new Error(`Elemento SVG no soportado: ${tag.slice(0, 30)}`);
}

export function elementos(svg: string): string[] {
  return [...svg.matchAll(/<(path|circle|rect)\b[^>]*\/?>/g)].map((m) => m[0]);
}

export function exportarIconos(androidRes: string, iosAssets: string) {
  const nombres = readdirSync(SRC).filter((f) => f.endsWith('.svg')).map((f) => f.replace('.svg', '')).sort();
  for (const n of nombres) {
    const svg = readFileSync(join(SRC, `${n}.svg`), 'utf8');
    const paths = elementos(svg).map(aPathData);
    // Android: trazo negro; el color lo pone Icon(tint = …) o el tema.
    write(join(androidRes, 'drawable', `ic_${n.replace(/-/g, '_')}.xml`), `<?xml version="1.0" encoding="utf-8"?>
<!-- Lucide «${n}» (ISC). Generado desde src/assets/iconos/${n}.svg -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">
${paths.map((d) => `    <path android:pathData="${d}" android:fillColor="#00000000" android:strokeColor="#FF000000"
        android:strokeWidth="2" android:strokeLineCap="round" android:strokeLineJoin="round" />`).join('\n')}
</vector>
`);
    // iOS: el SVG tal cual, como plantilla (toma el color de .foregroundStyle) y conservando el vector.
    const set = join(iosAssets, 'Iconos', `ic-${n}.imageset`);
    write(join(set, `${n}.svg`), svg);
    write(join(set, 'Contents.json'), JSON.stringify({
      images: [{ idiom: 'universal', filename: `${n}.svg` }],
      info: { author: 'xcode', version: 1 },
      properties: { 'preserves-vector-representation': true, 'template-rendering-intent': 'template' },
    }, null, 2));
  }
  write(join(iosAssets, 'Iconos', 'Contents.json'), JSON.stringify({ info: { author: 'xcode', version: 1 }, properties: { 'provides-namespace': false } }, null, 2));
  return nombres;
}
