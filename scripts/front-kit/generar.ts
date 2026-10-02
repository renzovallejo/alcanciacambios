/**
 * Genera los archivos derivados del kit de front (no se editan a mano):
 *  - tokens de diseño, argumentos de cada texto, nombres de iconos y datos de ejemplo
 *    para Android (Kotlin) e iOS (Swift), desde la misma fuente que la web.
 * Uso: npm run front-kit:generar   (lo llama también npm run front-kit)
 */
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT, exportTokens, flatten, write } from '../handoff/exportar';
import es from '../../src/i18n/es.json';
import { firstDayState, goalAchieved, goalUsed, movementReason, senderLabel, weekState, type AppState } from '../../src/lib/store';
import { friendlyDate, monthKey, monthLabel, inLastWeek } from '../../src/lib/dates';
import { ideaOfDay } from '../../src/lib/content';

export const KIT = join(ROOT, 'scripts', 'front-kit');
const AND = join(KIT, 'android', 'ui', 'generado');
const IOS = join(KIT, 'ios', 'Alcancia', 'Generado');
const AVISO = 'Generado por scripts/front-kit/generar.ts. No editar a mano: cambia la fuente (src/) y vuelve a generar.';

const kstr = (s: string) => JSON.stringify(s).replace(/\$/g, '\\$');
const sstr = (s: string) => JSON.stringify(s);
const camel = (k: string) => k.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const Pascal = (k: string) => camel(k).replace(/^./, (c) => c.toUpperCase());

export function generar() {
  /* ---------- tokens ---------- */
  const tmp = mkdtempSync(join(tmpdir(), 'tokens-'));
  exportTokens(tmp);
  let kt = readFileSync(join(tmp, 'android', 'AlcanciaTokens.kt'), 'utf8');
  // La fuente la da cada plataforma (Android: R.font.inter) para que el kit no dependa del paquete de la app.
  kt = kt.replace(/\/\/ Generado por[^\n]*\n/, `// ${AVISO}\n`)
    .replace(/\/\/ import <tu\.paquete>\.R[^\n]*\n/, '')
    .replace(/\/\*\* Inter variable[\s\S]*?\n\)\n/, '/** Inter: la carga cada plataforma (ver plataforma/Plataforma.kt). */\nval Inter: FontFamily get() = pe.alcancia.ui.plataforma.interFontFamily()\n')
    .replace('import androidx.compose.ui.text.font.Font\n', '');
  write(join(AND, 'AlcanciaTokens.kt'), kt);
  // iOS: cada peso es un archivo (Inter-Regular / Inter-Medium / Inter-SemiBold): se usa su nombre PostScript, más fiable que .weight().
  const sw = readFileSync(join(tmp, 'ios', 'AlcanciaTokens.swift'), 'utf8').replace(/\/\/ Generado por[^\n]*\n/, `// ${AVISO}\n`)
    .replace(/        let w: Font\.Weight[^\n]*\n        return \.custom\("Inter", size: size, relativeTo: relativeTo\)\.weight\(w\)/,
      '        let nombre = weight >= 600 ? "Inter-SemiBold" : weight >= 500 ? "Inter-Medium" : "Inter-Regular"\n        return .custom(nombre, size: size, relativeTo: relativeTo)');
  if (!sw.includes('Inter-SemiBold')) throw new Error('No se pudo ajustar la fuente en AlcanciaTokens.swift');
  write(join(IOS, 'AlcanciaTokens.swift'), sw);
  rmSync(tmp, { recursive: true, force: true });

  /* ---------- argumentos de cada texto (orden posicional) ---------- */
  const flat = flatten(es as never);
  const args = new Map<string, string[]>();
  for (const [k, v] of flat) {
    const base = k.replace(/_(one|other)$/, '');
    const names = [...v.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((n) => n !== 'count');
    // Textos simples con {count} (no plurales): count es %1$d. En plurales la cantidad la pone el sistema.
    if (base === k && v.includes('{count}')) names.unshift('count');
    if (names.length) args.set(base, [...new Set(names)]);
  }
  const kArgs = [...args].map(([k, n]) => `    ${kstr(k)} to listOf(${n.map(kstr).join(', ')}),`).join('\n');
  write(join(AND, 'TextoArgs.kt'), `// ${AVISO}\npackage pe.alcancia.ui.i18n\n\n/** Variables de cada texto, en el orden posicional de strings.xml (%1$s, %2$s…). */\nval TEXTO_ARGS: Map<String, List<String>> = mapOf(\n${kArgs}\n)\n\n/** Mismo nombre que en strings.xml: «alcancia.agregarPlata» → «alcancia_agregar_plata». */\nfun androidName(clave: String): String =\n    clave.replace(Regex("[.-]"), "_").replace(Regex("([a-z0-9])([A-Z])"), "$1_$2").lowercase()\n`);
  const sArgs = [...args].map(([k, n]) => `    ${sstr(k)}: [${n.map(sstr).join(', ')}],`).join('\n');
  write(join(IOS, 'TextoArgs.swift'), `// ${AVISO}\n\n/// Variables de cada texto, en el orden posicional de Localizable.strings (%1$@, %2$@…).\nlet textoArgs: [String: [String]] = [\n${sArgs}\n]\n`);

  /* ---------- iconos ---------- */
  const icons = readdirSync(join(ROOT, 'src', 'assets', 'iconos')).filter((f) => f.endsWith('.svg')).map((f) => f.replace('.svg', '')).sort();
  write(join(AND, 'Iconos.kt'), `// ${AVISO}\npackage pe.alcancia.ui.componentes\n\n/** Iconos Lucide del kit. En Android son res/drawable/ic_<nombre>.xml; en iOS, Assets/Iconos/ic-<nombre>. */\nobject Ic {\n${icons.map((i) => `    const val ${Pascal(i)} = ${kstr(i)}`).join('\n')}\n}\n`);
  write(join(IOS, 'Iconos.swift'), `// ${AVISO}\n\n/// Iconos Lucide del kit (Assets.xcassets/Iconos/ic-<nombre>).\nenum Ic {\n${icons.map((i) => `    static let ${camel(i)} = ${sstr(i)}`).join('\n')}\n}\n`);

  /* ---------- datos de ejemplo para previews ---------- */
  const ej = (s: AppState) => {
    const metas = s.goals.map((g) => ({ id: g.id, nombre: g.name, icono: g.icon, guardado: g.savedMinor, objetivo: g.targetMinor, lograda: goalAchieved(g), usada: goalUsed(g) }));
    const movs = s.movements.map((m) => ({
      id: m.id, entrada: m.kind === 'in', centimos: Math.abs(m.amountMinor),
      quien: m.kind === 'in' ? senderLabel(m.senderId, m.senderName) : '',
      cuando: friendlyDate(m.at) ?? '', motivo: movementReason(m) ?? '', meta: m.goalName ?? null, mes: monthKey(m.at), mesTitulo: monthLabel(m.at),
    }));
    const semana = s.movements.filter((m) => m.kind === 'in' && inLastWeek(m.at)).reduce((a, m) => a + m.amountMinor, 0);
    const conexion = s.deviceOnline ? 'Conectado' : s.devicePaired ? 'SinConexion' : 'NuncaConectado';
    return { nombre: s.childName, saldo: s.balanceMinor, semana, conexion, metas, movs };
  };
  const datos = { semana: ej(weekState()), primerDia: ej(firstDayState()) };
  const idea = ideaOfDay().text;

  const kMeta = (m: ReturnType<typeof ej>['metas'][number]) => `MetaUi(${kstr(m.id)}, ${kstr(m.nombre)}, ${kstr(m.icono)}, guardado = ${m.guardado}, objetivo = ${m.objetivo}, lograda = ${m.lograda}, usada = ${m.usada})`;
  const kMov = (m: ReturnType<typeof ej>['movs'][number]) => `MovimientoUi(${kstr(m.id)}, ${m.entrada ? 'Flujo.Entrada' : 'Flujo.Salida'}, ${m.centimos}, quien = ${kstr(m.quien)}, cuando = ${kstr(m.cuando)}, motivo = ${kstr(m.motivo)}, meta = ${m.meta ? kstr(m.meta) : 'null'})`;
  const kMeses = (movs: ReturnType<typeof ej>['movs']) => {
    const grupos: { titulo: string; items: typeof movs }[] = [];
    for (const m of movs) { const g = grupos.find((x) => x.titulo === m.mesTitulo); if (g) g.items.push(m); else grupos.push({ titulo: m.mesTitulo, items: [m] }); }
    return `listOf(\n${grupos.map((g) => `        MesUi(${kstr(g.titulo)}, entro = ${g.items.filter((m) => m.entrada).reduce((a, m) => a + m.centimos, 0)}, salio = ${g.items.filter((m) => !m.entrada).reduce((a, m) => a + m.centimos, 0)}, movimientos = listOf(\n${g.items.map((m) => `            ${kMov(m)},`).join('\n')}\n        )),`).join('\n')}\n    )`;
  };
  const kAlc = (d: ReturnType<typeof ej>, extra = '') => `AlcanciaUi(\n        nombre = ${kstr(d.nombre)}, conexion = Conexion.${d.conexion}, saldo = ${d.saldo}, estaSemana = ${d.semana},\n        metas = listOf(${d.metas.map(kMeta).join(', ')}),\n        movimientos = listOf(\n${d.movs.slice(0, 2).map((m) => `            ${kMov(m)},`).join('\n')}\n        ),\n        idea = ${d.movs.length ? kstr(idea) : 'null'},${extra}\n    )`;
  write(join(AND, 'Ejemplos.kt'), `// ${AVISO}\npackage pe.alcancia.ui.ejemplos\n\nimport pe.alcancia.ui.modelo.*\n\n/** Datos reales de las semillas del prototipo (semana y primer día) para previews y pruebas de UI. */\nobject Ejemplos {\n    val semana = ${kAlc(datos.semana)}\n\n    val primerDia = ${kAlc(datos.primerDia)}\n\n    /** Lo que entró y salió en la semana, agrupado por mes. */\n    val meses = ${kMeses(datos.semana.movs)}\n}\n`);

  const sMeta = (m: ReturnType<typeof ej>['metas'][number]) => `MetaUi(id: ${sstr(m.id)}, nombre: ${sstr(m.nombre)}, icono: ${sstr(m.icono)}, guardado: ${m.guardado}, objetivo: ${m.objetivo}, lograda: ${m.lograda}, usada: ${m.usada})`;
  const sMov = (m: ReturnType<typeof ej>['movs'][number]) => `MovimientoUi(id: ${sstr(m.id)}, flujo: ${m.entrada ? '.entrada' : '.salida'}, centimos: ${m.centimos}, quien: ${sstr(m.quien)}, cuando: ${sstr(m.cuando)}, motivo: ${sstr(m.motivo)}, meta: ${m.meta ? sstr(m.meta) : 'nil'})`;
  const sMeses = (movs: ReturnType<typeof ej>['movs']) => {
    const grupos: { titulo: string; items: typeof movs }[] = [];
    for (const m of movs) { const g = grupos.find((x) => x.titulo === m.mesTitulo); if (g) g.items.push(m); else grupos.push({ titulo: m.mesTitulo, items: [m] }); }
    return `[\n${grupos.map((g) => `        MesUi(titulo: ${sstr(g.titulo)}, entro: ${g.items.filter((m) => m.entrada).reduce((a, m) => a + m.centimos, 0)}, salio: ${g.items.filter((m) => !m.entrada).reduce((a, m) => a + m.centimos, 0)}, movimientos: [\n${g.items.map((m) => `            ${sMov(m)},`).join('\n')}\n        ]),`).join('\n')}\n    ]`;
  };
  const sAlc = (d: ReturnType<typeof ej>) => `AlcanciaUi(\n        nombre: ${sstr(d.nombre)}, conexion: .${camel(d.conexion.replace(/^./, (c) => c.toLowerCase()))}, saldo: ${d.saldo}, estaSemana: ${d.semana},\n        metas: [${d.metas.map(sMeta).join(', ')}],\n        movimientos: [\n${d.movs.slice(0, 2).map((m) => `            ${sMov(m)},`).join('\n')}\n        ],\n        idea: ${d.movs.length ? sstr(idea) : 'nil'}\n    )`;
  write(join(IOS, 'Ejemplos.swift'), `// ${AVISO}\n\n/// Datos reales de las semillas del prototipo (semana y primer día) para previews y pruebas de UI.\nenum Ejemplos {\n    static let semana = ${sAlc(datos.semana)}\n\n    static let primerDia = ${sAlc(datos.primerDia)}\n\n    /// Lo que entró y salió en la semana, agrupado por mes.\n    static let meses = ${sMeses(datos.semana.movs)}\n}\n`);

  /* ---------- textos para la verificación en escritorio (no se entrega) ---------- */
  const textos = flat.map(([k, v]) => `    ${kstr(k)} to ${kstr(v)},`).join('\n');
  write(join(KIT, 'verificar', 'plataforma', 'TextosEs.kt'), `// ${AVISO}\npackage pe.alcancia.ui.plataforma\n\n/** es.json aplanado: solo para renderizar el kit en escritorio. En Android se leen de strings.xml. */\nval TEXTOS_ES: Map<String, String> = mapOf(\n${textos}\n)\n`);
  return { iconos: icons.length, textos: flat.length, conArgs: args.size };
}

