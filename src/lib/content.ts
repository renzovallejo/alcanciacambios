import type { Topic } from '../domain';

export const TOPIC_LABEL: Record<Topic, string> = { ahorrar: 'Ahorrar', 'gastar-bien': 'Gastar bien', compartir: 'Compartir', ganar: 'Ganar' };
export const TOPIC_ICON: Record<Topic, string> = { ahorrar: 'wallet', 'gastar-bien': 'shopping-cart', compartir: 'hand-heart', ganar: 'briefcase-business' };
export const TOPIC_ORDER: Topic[] = ['ahorrar', 'gastar-bien', 'compartir', 'ganar'];

export interface StoryItem { id: string; title: string; topic: Topic; minutes: number; output: 'phone' | 'piggy-bank'; text: string; questions: string[] }
export interface MissionItem { id: string; title: string; topic: Topic; summary: string; materials: string[]; steps: string[] }
export interface GameItem { id: string; title: string; topic: Topic; players: string; scenario: string; roles: string[]; questions: string[] }

export const STORIES: StoryItem[] = [
  { id: 's-chanchito', title: 'Cómo nació tu alcancía', topic: 'ahorrar', minutes: 4, output: 'piggy-bank',
    text: 'Hace mucho, un chanchito de cartón soñaba con guardar cosas valiosas. Un día, una niña le dejó una moneda y luego otra. El chanchito descubrió que, poco a poco, esas monedas se convertían en algo que ella quería de verdad. Desde entonces, cada moneda que llega cuenta una historia.',
    questions: ['¿Qué crees que sintió el chanchito con la primera moneda?', '¿Para qué te gustaría guardar tus monedas?'] },
  { id: 's-planifica', title: 'Planifica y ahorra para una meta', topic: 'ahorrar', minutes: 5, output: 'phone',
    text: 'Sofía quería un libro de dinosaurios. Le preguntó a su abuela cuánto costaba y lo anotaron juntas. Si guardaba un poquito cada semana, en un mes lo tendría. Cada vez que agregaba una moneda, pintaba un cuadro en su calendario. ¡Cuando pintó el último cuadro, el libro era suyo!',
    questions: ['¿Cuánto tiempo tardó Sofía en juntar para su libro?', '¿Qué meta te gustaría anotar tú?'] },
  { id: 's-separa', title: 'Separa el ahorro del gasto', topic: 'ahorrar', minutes: 7, output: 'phone',
    text: 'Cada vez que Mateo recibía su mesada, usaba dos frascos: uno para guardar y otro para gastar. El frasco de gastar se vaciaba rápido, pero el de guardar crecía despacio. Un día Mateo se dio cuenta de que tenía dinero para su juguete favorito sin haber tocado el otro frasco.',
    questions: ['¿Para qué servía cada frasco?', '¿Cómo podrían organizar sus monedas en casa?'] },
  { id: 's-control', title: 'Lleva control de lo que gastas', topic: 'gastar-bien', minutes: 6, output: 'phone',
    text: 'Valeria anotó en una libreta cada cosa que compraba durante una semana. Al final vio que había gastado casi todo en golosinas. No se enojó: solo decidió elegir mejor la semana siguiente. Anotar le ayudó a ver con claridad adónde se iba su dinero.',
    questions: ['¿Qué descubrió Valeria al anotar sus compras?', '¿Qué anotarían ustedes esta semana?'] },
  { id: 's-compara', title: 'Compara precios antes de comprar', topic: 'gastar-bien', minutes: 9, output: 'phone',
    text: 'Sofía quería un cuaderno. En la primera tienda costaba mucho; pero como buena detective, buscó en dos más… ¡y encontró el mismo cuaderno más barato! Con lo que ahorró, le alcanzó para un lápiz. ¡Caso cerrado!',
    questions: ['¿Qué hizo Sofía antes de elegir?', '¿Cuándo comparar precios les puede servir a ustedes?'] },
];

export const MISSIONS: MissionItem[] = [
  { id: 'm-meta-familia', title: 'Una meta en familia', topic: 'ahorrar', summary: 'Elijan juntos algo que quieran lograr y piensen cómo acercarse.',
    materials: ['Papel y lápices', 'Un lugar visible de la casa'],
    steps: ['Cada persona dice algo que le gustaría tener o hacer.', 'Elijan una meta que puedan lograr en unas semanas.', 'Anoten cuánto cuesta y cuánto quieren guardar cada semana.', 'Péguenla donde todos la vean.'] },
  { id: 'm-monedas', title: 'Separa tus monedas', topic: 'ahorrar', summary: 'Practiquen separar monedas entre guardar y gastar.',
    materials: ['Dos frascos o cajas', 'Algunas monedas'],
    steps: ['Pongan nombre a cada frasco: «Guardar» y «Gastar».', 'Repartan las monedas entre ambos como prefieran.', 'Conversen por qué eligieron ese reparto.'] },
  { id: 'm-compara', title: 'Compara antes de elegir', topic: 'gastar-bien', summary: 'Busquen el mismo producto en dos lugares y comparen.',
    materials: ['Un folleto, catálogo o conversación con un vendedor'],
    steps: ['Elijan algo pequeño que quieran comprar.', 'Averigüen cuánto cuesta en dos lugares.', 'Conversen qué opción elegirían y por qué.'] },
  { id: 'm-compartir', title: 'Elige algo para compartir', topic: 'compartir', summary: 'Piensen en algo que puedan compartir con otra persona.',
    materials: ['Ninguno'],
    steps: ['Piensen en alguien a quien les gustaría alegrar.', 'Elijan qué podrían compartir: tiempo, un juguete, un dibujo.', 'Conversen cómo se sintieron al decidirlo.'] },
];

export const GAMES: GameItem[] = [
  { id: 'g-tienda', title: 'La tienda de casa', topic: 'gastar-bien', players: 'dos personas',
    scenario: 'Convierten un rincón de la casa en una tienda. Una persona vende y la otra compra con monedas imaginarias.',
    roles: ['Vendedor o vendedora: pone precios y atiende.', 'Comprador o compradora: decide qué comprar y cuánto gastar.'],
    questions: ['¿Cómo decidiste qué comprar?', '¿Qué pasó cuando no alcanzaban las monedas?'] },
  { id: 'g-necesito', title: '¿Lo necesito o lo quiero?', topic: 'gastar-bien', players: 'dos personas',
    scenario: 'Una persona nombra objetos y la otra dice si son algo que necesita o algo que quiere.',
    roles: ['Quien pregunta: nombra objetos.', 'Quien responde: explica su elección.'],
    questions: ['¿Hubo objetos difíciles de clasificar?', '¿Cambia la respuesta según la persona?'] },
  { id: 'g-regalo', title: 'Un regalo entre todos', topic: 'compartir', players: 'en familia',
    scenario: 'Imaginan que juntan monedas entre todos para hacerle un regalo a alguien.',
    roles: ['Cada persona propone una idea y cuánto aportaría.'],
    questions: ['¿Qué regalo eligieron y por qué?', '¿Cómo se sintieron al aportar juntos?'] },
  { id: 'g-negocio', title: 'Mi primer pequeño negocio', topic: 'ganar', players: 'dos personas',
    scenario: 'Imaginan un negocio pequeño, como vender limonada, y piensan qué necesitan y cuánto cobrarían.',
    roles: ['Dueño o dueña del negocio.', 'Cliente curioso que hace preguntas.'],
    questions: ['¿Qué necesita tu negocio para empezar?', '¿Cómo sabrías si te fue bien?'] },
];

export type StepRef = { kind: 'story' | 'mission' | 'game' | 'action'; id: string; title: string; to?: string };
export interface Activity { topic: Topic; title: string; blurb: string; steps: StepRef[] }

export const ACTIVITIES: Record<Topic, Activity> = {
  ahorrar: { topic: 'ahorrar', title: 'Fijar una meta de ahorro', blurb: 'Conversen cómo acercarse a esa primera meta.',
    steps: [{ kind: 'story', id: 's-planifica', title: 'Un cuento para conversar' }, { kind: 'mission', id: 'm-monedas', title: 'Separar las monedas' }, { kind: 'action', id: 'meta', title: 'Crear la meta juntos', to: '/meta/nueva' }] },
  'gastar-bien': { topic: 'gastar-bien', title: 'Comparar antes de comprar', blurb: 'Descubran por qué conviene mirar antes de elegir.',
    steps: [{ kind: 'story', id: 's-compara', title: 'Un cuento para conversar' }, { kind: 'game', id: 'g-necesito', title: 'Juego: ¿lo necesito o lo quiero?' }, { kind: 'mission', id: 'm-compara', title: 'Comparar en dos lugares' }] },
  compartir: { topic: 'compartir', title: 'Elegir algo para compartir', blurb: 'Piensen juntos en qué les gustaría compartir.',
    steps: [{ kind: 'game', id: 'g-regalo', title: 'Juego: un regalo entre todos' }, { kind: 'mission', id: 'm-compartir', title: 'Elegir algo para compartir' }] },
  ganar: { topic: 'ganar', title: 'Imaginar un pequeño negocio', blurb: 'Conversen cómo se puede ganar dinero con un trabajo pequeño.',
    steps: [{ kind: 'game', id: 'g-negocio', title: 'Juego: mi primer pequeño negocio' }, { kind: 'story', id: 's-separa', title: 'Un cuento sobre el ahorro y el gasto' }] },
};

export const stepPath = (s: StepRef, topic: Topic, n: number): string =>
  s.to ?? `/${s.kind === 'story' ? 'cuento' : s.kind === 'mission' ? 'mision' : 'juego'}/${s.id}?a=${topic}&p=${n}`;

export const findStory = (id: string) => STORIES.find((s) => s.id === id);
export const findMission = (id: string) => MISSIONS.find((s) => s.id === id);
export const findGame = (id: string) => GAMES.find((s) => s.id === id);
