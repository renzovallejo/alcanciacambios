import es from './es.json';

/**
 * Catálogo único de textos. Es la fuente de verdad para web, Android e iOS:
 * `npm run handoff` lo exporta a strings.xml y Localizable.strings.
 * Variables: {nombre}. Plurales: clave_one / clave_other.
 */
type Params = Record<string, string | number>;
type Tree = { [k: string]: string | Tree };

function lookup(key: string): string | undefined {
  const v = key.split('.').reduce<string | Tree | undefined>((o, k) => (typeof o === 'object' ? o[k] : undefined), es as Tree);
  return typeof v === 'string' ? v : undefined;
}

export function t(key: string, params?: Params): string {
  const v = lookup(key);
  if (v === undefined) {
    if (import.meta.env.DEV) console.warn(`Falta el texto «${key}» en es.json`);
    return key;
  }
  return params ? v.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m)) : v;
}

/** Plural según la regla del español: 1 → _one, resto → _other. */
export function tn(key: string, count: number, params?: Params): string {
  return t(`${key}_${count === 1 ? 'one' : 'other'}`, { count, ...params });
}

export const hasKey = (key: string) => lookup(key) !== undefined;
