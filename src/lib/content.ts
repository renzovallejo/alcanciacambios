import type { Topic } from '../domain';
import { t } from '../i18n';

/** Nombre visible del tema (catálogo de textos). */
export const TOPIC_LABEL = new Proxy({} as Record<Topic, string>, { get: (_, k: string) => t(`temas.${k}`) });
export const TOPIC_ICON: Record<Topic, string> = { ahorrar: 'wallet', 'gastar-bien': 'shopping-cart', compartir: 'hand-heart', ganar: 'briefcase-business' };
export const TOPIC_ORDER: Topic[] = ['ahorrar', 'gastar-bien', 'compartir', 'ganar'];

/** short = versión de 1 minuto para los días sin tiempo. */
export interface StoryItem { id: string; title: string; topic: Topic; minutes: number; output: 'phone' | 'piggy-bank'; text: string; short: string; questions: string[] }
export interface MissionItem { id: string; title: string; topic: Topic; minutes: number; summary: string; materials: string[]; steps: string[] }
export interface GameItem { id: string; title: string; topic: Topic; minutes: number; players: string; scenario: string; roles: string[]; questions: string[] }

export const STORIES: StoryItem[] = [
  { id: 's-chanchito', title: 'Cómo nació tu alcancía', topic: 'ahorrar', minutes: 4, output: 'piggy-bank',
    text: 'Hace tiempo, un chanchito soñaba con guardar cosas valiosas. Un día, una niña le metió una moneda, y después otra, y otra más. El chanchito se dio cuenta de que, poquito a poco, esas monedas se iban convirtiendo en algo que ella quería de verdad. Desde ese día, cada moneda que entra tiene su propia historia.',
    short: 'Un chanchito recibió una moneda, y luego otra, y otra. Poquito a poco, esas monedas se volvieron algo que su dueña quería de verdad.',
    questions: ['¿Qué habrá sentido el chanchito con la primera moneda?', '¿Para qué te gustaría juntar tus monedas?'] },
  { id: 's-planifica', title: 'Planifica y ahorra para una meta', topic: 'ahorrar', minutes: 5, output: 'phone',
    text: 'Sofía quería un libro de dinosaurios. Le preguntó a su abuelita cuánto costaba y lo apuntaron juntas en un papel. Si guardaba un poquito de su propina cada semana, en un mes lo tendría. Cada vez que metía una moneda al chanchito, pintaba un cuadradito en su calendario. ¡Cuando pintó el último, el libro fue suyo!',
    short: 'Sofía quería un libro. Guardó un poquito cada semana y pintó un cuadradito por cada moneda. Cuando pintó el último, ¡el libro fue suyo!',
    questions: ['¿Cuánto tiempo se demoró Sofía en juntar para su libro?', '¿Qué te gustaría juntar tú?'] },
  { id: 's-separa', title: 'Separa el ahorro del gasto', topic: 'ahorrar', minutes: 7, output: 'phone',
    text: 'Cada vez que a Mateo le daban su propina, la repartía en dos tarritos: uno para guardar y otro para gastar. El de gastar se vaciaba rapidito, pero el de guardar iba creciendo despacito. Un día Mateo se dio cuenta de que ya le alcanzaba para su juguete favorito, ¡y sin haber tocado el otro tarrito!',
    short: 'Mateo tenía dos tarritos: uno para guardar y otro para gastar. El de guardar creció despacito, hasta que le alcanzó para su juguete.',
    questions: ['¿Para qué servía cada tarrito?', '¿Cómo podrían ordenar sus monedas en casa?'] },
  { id: 's-control', title: 'Lleva control de lo que gastas', topic: 'gastar-bien', minutes: 6, output: 'phone',
    text: 'Durante una semana, Valeria apuntó en un cuadernito todo lo que se compraba en la bodega. Al final vio que casi toda su propina se le había ido en dulces y galletas. No se molestó: solo decidió escoger mejor la semana siguiente. Apuntar le ayudó a ver en qué se le iba la plata.',
    short: 'Valeria apuntó una semana lo que compraba. Vio que casi todo se le iba en dulces, y decidió escoger mejor.',
    questions: ['¿Qué descubrió Valeria al apuntar sus compras?', '¿Qué apuntarían ustedes esta semana?'] },
  { id: 's-compara', title: 'Compara precios antes de comprar', topic: 'gastar-bien', minutes: 9, output: 'phone',
    text: 'Sofía quería un cuaderno. En la primera librería estaba carísimo; pero como buena detective, preguntó en dos más… ¡y encontró el mismo cuaderno más barato! Con lo que se ahorró, le alcanzó para un lápiz. ¡Caso cerrado!',
    short: 'Sofía preguntó el precio de un cuaderno en tres librerías. En la última estaba más barato, ¡y le alcanzó para un lápiz!',
    questions: ['¿Qué hizo Sofía antes de comprar?', '¿Cuándo les serviría a ustedes comparar precios?'] },
  { id: 's-lonchera', title: 'La lonchera compartida', topic: 'compartir', minutes: 5, output: 'phone',
    text: 'En el recreo, Diego vio que su amigo Luis no había traído lonchera. Diego tenía un pan con palta y una mandarina. Lo pensó un ratito y le invitó la mitad de su pan. Luis se puso feliz, y al día siguiente le trajo una galleta para compartir. Diego descubrió que compartir también se siente bonito por dentro.',
    short: 'Diego compartió la mitad de su pan con un amigo que no trajo lonchera. Al día siguiente, su amigo le invitó una galleta.',
    questions: ['¿Cómo se habrá sentido Luis?', '¿Con quién te gustaría compartir algo?'] },
  { id: 's-chicha', title: 'La chicha morada de Camila', topic: 'ganar', minutes: 6, output: 'phone',
    text: 'Camila quería juntar para unas zapatillas. Con su abuela prepararon chicha morada y la vendieron en la puerta de la casa el domingo. Primero apuntaron cuánto gastaron en maíz morado, piña y azúcar. Al final del día contaron lo que juntaron y restaron lo que gastaron: ¡eso era lo que de verdad habían ganado!',
    short: 'Camila y su abuela vendieron chicha morada. Contaron lo que juntaron, restaron lo que gastaron, y vieron cuánto ganaron de verdad.',
    questions: ['¿Por qué Camila restó lo que gastó?', '¿Qué trabajito podrían hacer ustedes?'] },
];

export const MISSIONS: MissionItem[] = [
  { id: 'm-meta-familia', minutes: 10, title: 'Una meta en familia', topic: 'ahorrar', summary: 'Escojan juntos algo que quieran lograr y piensen cómo llegar.',
    materials: ['Papel y colores', 'Un lugar de la casa donde todos lo vean (la refri, por ejemplo)'],
    steps: ['Cada uno dice algo que le gustaría tener o hacer.', 'Escojan una meta que puedan lograr en unas semanas.', 'Apunten cuánto cuesta y cuánto van a guardar cada semana.', 'Péguenla donde todos la vean.'] },
  { id: 'm-monedas', minutes: 5, title: 'Separa tus monedas', topic: 'ahorrar', summary: 'Practiquen separar las monedas: unas para guardar y otras para gastar.',
    materials: ['Dos tarritos o cajitas', 'Unas cuantas monedas'],
    steps: ['Pónganle nombre a cada tarrito: «Guardar» y «Gastar».', 'Repartan las monedas como quieran.', 'Conversen por qué las repartieron así.'] },
  { id: 'm-compara', minutes: 15, title: 'Compara antes de escoger', topic: 'gastar-bien', summary: 'Busquen la misma cosa en dos sitios y comparen precios.',
    materials: ['Un catálogo, una visita a la bodega o al mercado'],
    steps: ['Escojan algo chiquito que quieran comprar.', 'Pregunten cuánto cuesta en dos sitios.', 'Conversen cuál escogerían y por qué.'] },
  { id: 'm-compartir', minutes: 10, title: 'Escoge algo para compartir', topic: 'compartir', summary: 'Piensen en algo que puedan compartir con otra persona.',
    materials: ['Nada, solo ganas'],
    steps: ['Piensen en alguien a quien les gustaría alegrar.', 'Escojan qué podrían compartir: su tiempo, un juguete, un dibujo.', 'Conversen cómo se sintieron.'] },
  { id: 'm-trabajito', minutes: 15, title: 'Un trabajito en casa', topic: 'ganar', summary: 'Escojan juntos un trabajito extra y conversen cuánto valdría.',
    materials: ['Algo que se pueda hacer en casa: regar las plantas, ordenar los juguetes'],
    steps: ['Escojan un trabajito que no sea de todos los días.', 'Conversen cuánto valdría y por qué.', 'Háganlo juntos y, si quieren, anoten la plata en Alcancía.'] },
];

export const GAMES: GameItem[] = [
  { id: 'g-tienda', minutes: 15, title: 'La bodeguita de la casa', topic: 'gastar-bien', players: 'para dos',
    scenario: 'Arman una bodeguita en un rincón de la casa. Uno vende y el otro compra con monedas de mentira.',
    roles: ['Quien vende: pone los precios y atiende.', 'Quien compra: decide qué llevar y cuánto gastar.'],
    questions: ['¿Cómo decidiste qué comprar?', '¿Qué pasó cuando no te alcanzaba?'] },
  { id: 'g-necesito', minutes: 5, title: '¿Lo necesito o lo quiero?', topic: 'gastar-bien', players: 'para dos',
    scenario: 'Uno nombra cosas y el otro dice si es algo que necesita o algo que solo quiere.',
    roles: ['Quien pregunta: dice cosas.', 'Quien responde: explica por qué.'],
    questions: ['¿Hubo cosas difíciles de decidir?', '¿La respuesta cambia según la persona?'] },
  { id: 'g-regalo', minutes: 10, title: 'Un regalo entre todos', topic: 'compartir', players: 'en familia',
    scenario: 'Imaginan que hacen una chanchita entre todos para regalarle algo a alguien.',
    roles: ['Cada uno propone una idea y dice con cuánto pondría.'],
    questions: ['¿Qué regalo escogieron y por qué?', '¿Cómo se sintieron al juntar entre todos?'] },
  { id: 'g-negocio', minutes: 10, title: 'Mi primer negocito', topic: 'ganar', players: 'para dos',
    scenario: 'Imaginan un negocito, como vender chicha morada, y piensan qué necesitan y a cuánto venderían.',
    roles: ['Quien tiene el negocio.', 'Un cliente preguntón.'],
    questions: ['¿Qué necesitas para empezar tu negocito?', '¿Cómo sabrías si te fue bien?'] },
  { id: 'g-espera', minutes: 5, title: '¿Ahora o después?', topic: 'ahorrar', players: 'para dos',
    scenario: 'Uno ofrece algo chiquito ahora o algo más grande si espera un ratito. El otro decide y explica por qué.',
    roles: ['Quien ofrece: inventa las dos opciones.', 'Quien decide: escoge y cuenta por qué.'],
    questions: ['¿Fue difícil esperar?', '¿Para qué cosas vale la pena esperar?'] },
];

export type StepRef = { kind: 'story' | 'mission' | 'game' | 'action'; id: string; title: string; to?: string };
export interface Activity { topic: Topic; title: string; blurb: string; steps: StepRef[] }

export const ACTIVITIES: Record<Topic, Activity> = {
  ahorrar: { topic: 'ahorrar', title: 'Fijar una meta de ahorro', blurb: 'Conversen cómo pueden llegar a esa primera meta.',
    steps: [{ kind: 'story', id: 's-planifica', title: 'Un cuento para conversar' }, { kind: 'mission', id: 'm-monedas', title: 'Separar las monedas en tarritos' }, { kind: 'action', id: 'meta', title: 'Crear la meta juntos', to: '/meta/nueva?volver=/actividad/ahorrar' }] },
  'gastar-bien': { topic: 'gastar-bien', title: 'Comparar antes de comprar', blurb: 'Descubran por qué conviene comparar antes de comprar.',
    steps: [{ kind: 'story', id: 's-compara', title: 'Un cuento para conversar' }, { kind: 'game', id: 'g-necesito', title: 'Juego: ¿lo necesito o lo quiero?' }, { kind: 'mission', id: 'm-compara', title: 'Comparar en dos lugares' }] },
  compartir: { topic: 'compartir', title: 'Escoger algo para compartir', blurb: 'Piensen juntos qué les gustaría compartir.',
    steps: [{ kind: 'game', id: 'g-regalo', title: 'Juego: un regalo entre todos' }, { kind: 'mission', id: 'm-compartir', title: 'Escoger algo para compartir' }] },
  ganar: { topic: 'ganar', title: 'Imaginar un negocito', blurb: 'Conversen cómo se puede ganar plata con un trabajito.',
    steps: [{ kind: 'game', id: 'g-negocio', title: 'Juego: mi primer negocito' }, { kind: 'story', id: 's-separa', title: 'Un cuento sobre el ahorro y el gasto' }] },
};

export const stepPath = (s: StepRef, topic: Topic, n: number): string =>
  s.to ?? `/${s.kind === 'story' ? 'cuento' : s.kind === 'mission' ? 'mision' : 'juego'}/${s.id}?a=${topic}&p=${n}`;

export const findStory = (id: string) => STORIES.find((s) => s.id === id);
export const findMission = (id: string) => MISSIONS.find((s) => s.id === id);
export const findGame = (id: string) => GAMES.find((s) => s.id === id);

export const STEP_ICON: Record<StepRef['kind'], string> = { story: 'book-open', mission: 'flag', game: 'messages-square', action: 'target' };

/** Minutos aproximados de un paso, para que quien tiene poco tiempo sepa cuánto le toma. */
export function stepMinutes(s: StepRef): number {
  if (s.kind === 'story') return findStory(s.id)?.minutes ?? 5;
  if (s.kind === 'mission') return findMission(s.id)?.minutes ?? 10;
  if (s.kind === 'game') return findGame(s.id)?.minutes ?? 10;
  return 2;
}

/** Siguiente actividad para sugerir: la primera que no han terminado (o null si hicieron todas). */
export function nextActivity(finished: Topic[], except?: Topic): Activity | null {
  const tp = TOPIC_ORDER.find((x) => x !== except && !finished.includes(x));
  return tp ? ACTIVITIES[tp] : null;
}

/** Ideas de 1 minuto: para cualquier momento del día, sin preparar nada. Cambia cada día. */
export interface Idea { id: string; topic: Topic; text: string }
export const IDEAS: Idea[] = [
  { id: 'i-bodega', topic: 'gastar-bien', text: 'En la bodega, pregúntale: «¿Esto lo necesitamos o lo queremos?».' },
  { id: 'i-contar', topic: 'ahorrar', text: 'Cuenten juntos las monedas de su chanchito antes de dormir.' },
  { id: 'i-precio', topic: 'gastar-bien', text: 'Jueguen a adivinar el precio de algo que tengan a la mano.' },
  { id: 'i-meta', topic: 'ahorrar', text: 'Pregúntale: «¿Qué te gustaría juntar este mes?».' },
  { id: 'i-compartir', topic: 'compartir', text: 'Pregúntale: «¿A quién te gustaría darle una sorpresa?».' },
  { id: 'i-trabajo', topic: 'ganar', text: 'Cuéntale en qué trabajas tú y para qué sirve tu trabajo.' },
  { id: 'i-espera', topic: 'ahorrar', text: 'Pregúntale: «¿Qué cosa valió la pena esperar?».' },
];
export const ideaOfDay = (d = new Date()): Idea => IDEAS[Math.floor(d.getTime() / 86_400_000) % IDEAS.length];
