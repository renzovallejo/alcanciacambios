import type { Topic } from '../domain';

export const TOPIC_LABEL: Record<Topic, string> = { ahorrar: 'Ahorrar', 'gastar-bien': 'Gastar bien', compartir: 'Compartir', ganar: 'Ganar' };
export const TOPIC_ICON: Record<Topic, string> = { ahorrar: 'wallet', 'gastar-bien': 'shopping-cart', compartir: 'hand-heart', ganar: 'briefcase-business' };
export const TOPIC_ORDER: Topic[] = ['ahorrar', 'gastar-bien', 'compartir', 'ganar'];

export interface StoryItem { id: string; title: string; topic: Topic; minutes: number; output: 'phone' | 'piggy-bank'; text: string; questions: string[] }
export interface MissionItem { id: string; title: string; topic: Topic; summary: string; materials: string[]; steps: string[] }
export interface GameItem { id: string; title: string; topic: Topic; players: string; scenario: string; roles: string[]; questions: string[] }

export const STORIES: StoryItem[] = [
  { id: 's-chanchito', title: 'Cómo nació tu alcancía', topic: 'ahorrar', minutes: 4, output: 'piggy-bank',
    text: 'Hace tiempo, un chanchito soñaba con guardar cosas valiosas. Un día, una niña le metió una moneda, y después otra, y otra más. El chanchito se dio cuenta de que, poquito a poco, esas monedas se iban convirtiendo en algo que ella quería de verdad. Desde ese día, cada moneda que entra tiene su propia historia.',
    questions: ['¿Qué habrá sentido el chanchito con la primera moneda?', '¿Para qué te gustaría juntar tus monedas?'] },
  { id: 's-planifica', title: 'Planifica y ahorra para una meta', topic: 'ahorrar', minutes: 5, output: 'phone',
    text: 'Sofía quería un libro de dinosaurios. Le preguntó a su abuelita cuánto costaba y lo apuntaron juntas en un papel. Si guardaba un poquito de su propina cada semana, en un mes lo tendría. Cada vez que metía una moneda al chanchito, pintaba un cuadradito en su calendario. ¡Cuando pintó el último, el libro fue suyo!',
    questions: ['¿Cuánto tiempo se demoró Sofía en juntar para su libro?', '¿Qué te gustaría juntar tú?'] },
  { id: 's-separa', title: 'Separa el ahorro del gasto', topic: 'ahorrar', minutes: 7, output: 'phone',
    text: 'Cada vez que a Mateo le daban su propina, la repartía en dos tarritos: uno para guardar y otro para gastar. El de gastar se vaciaba rapidito, pero el de guardar iba creciendo despacito. Un día Mateo se dio cuenta de que ya le alcanzaba para su juguete favorito, ¡y sin haber tocado el otro tarrito!',
    questions: ['¿Para qué servía cada tarrito?', '¿Cómo podrían ordenar sus monedas en casa?'] },
  { id: 's-control', title: 'Lleva control de lo que gastas', topic: 'gastar-bien', minutes: 6, output: 'phone',
    text: 'Durante una semana, Valeria apuntó en un cuadernito todo lo que se compraba en la bodega. Al final vio que casi toda su propina se le había ido en dulces y galletas. No se molestó: solo decidió escoger mejor la semana siguiente. Apuntar le ayudó a ver en qué se le iba la plata.',
    questions: ['¿Qué descubrió Valeria al apuntar sus compras?', '¿Qué apuntarían ustedes esta semana?'] },
  { id: 's-compara', title: 'Compara precios antes de comprar', topic: 'gastar-bien', minutes: 9, output: 'phone',
    text: 'Sofía quería un cuaderno. En la primera librería estaba carísimo; pero como buena detective, preguntó en dos más… ¡y encontró el mismo cuaderno más barato! Con lo que se ahorró, le alcanzó para un lápiz. ¡Caso cerrado!',
    questions: ['¿Qué hizo Sofía antes de comprar?', '¿Cuándo les serviría a ustedes comparar precios?'] },
];

export const MISSIONS: MissionItem[] = [
  { id: 'm-meta-familia', title: 'Una meta en familia', topic: 'ahorrar', summary: 'Escojan juntos algo que quieran lograr y piensen cómo llegar.',
    materials: ['Papel y colores', 'Un lugar de la casa donde todos lo vean (la refri, por ejemplo)'],
    steps: ['Cada uno dice algo que le gustaría tener o hacer.', 'Escojan una meta que puedan lograr en unas semanas.', 'Apunten cuánto cuesta y cuánto van a guardar cada semana.', 'Péguenla donde todos la vean.'] },
  { id: 'm-monedas', title: 'Separa tus monedas', topic: 'ahorrar', summary: 'Practiquen separar las monedas: unas para guardar y otras para gastar.',
    materials: ['Dos tarritos o cajitas', 'Unas cuantas monedas'],
    steps: ['Pónganle nombre a cada tarrito: «Guardar» y «Gastar».', 'Repartan las monedas como quieran.', 'Conversen por qué las repartieron así.'] },
  { id: 'm-compara', title: 'Compara antes de escoger', topic: 'gastar-bien', summary: 'Busquen la misma cosa en dos sitios y comparen precios.',
    materials: ['Un catálogo, una visita a la bodega o al mercado'],
    steps: ['Escojan algo chiquito que quieran comprar.', 'Pregunten cuánto cuesta en dos sitios.', 'Conversen cuál escogerían y por qué.'] },
  { id: 'm-compartir', title: 'Escoge algo para compartir', topic: 'compartir', summary: 'Piensen en algo que puedan compartir con otra persona.',
    materials: ['Nada, solo ganas'],
    steps: ['Piensen en alguien a quien les gustaría alegrar.', 'Escojan qué podrían compartir: su tiempo, un juguete, un dibujo.', 'Conversen cómo se sintieron.'] },
];

export const GAMES: GameItem[] = [
  { id: 'g-tienda', title: 'La bodeguita de la casa', topic: 'gastar-bien', players: 'para dos',
    scenario: 'Arman una bodeguita en un rincón de la casa. Uno vende y el otro compra con monedas de mentira.',
    roles: ['Quien vende: pone los precios y atiende.', 'Quien compra: decide qué llevar y cuánto gastar.'],
    questions: ['¿Cómo decidiste qué comprar?', '¿Qué pasó cuando no te alcanzaba?'] },
  { id: 'g-necesito', title: '¿Lo necesito o lo quiero?', topic: 'gastar-bien', players: 'para dos',
    scenario: 'Uno nombra cosas y el otro dice si es algo que necesita o algo que solo quiere.',
    roles: ['Quien pregunta: dice cosas.', 'Quien responde: explica por qué.'],
    questions: ['¿Hubo cosas difíciles de decidir?', '¿La respuesta cambia según la persona?'] },
  { id: 'g-regalo', title: 'Un regalo entre todos', topic: 'compartir', players: 'en familia',
    scenario: 'Imaginan que hacen una chanchita entre todos para regalarle algo a alguien.',
    roles: ['Cada uno propone una idea y dice con cuánto pondría.'],
    questions: ['¿Qué regalo escogieron y por qué?', '¿Cómo se sintieron al juntar entre todos?'] },
  { id: 'g-negocio', title: 'Mi primer negocito', topic: 'ganar', players: 'para dos',
    scenario: 'Imaginan un negocito, como vender chicha morada, y piensan qué necesitan y a cuánto venderían.',
    roles: ['Quien tiene el negocio.', 'Un cliente preguntón.'],
    questions: ['¿Qué necesitas para empezar tu negocito?', '¿Cómo sabrías si te fue bien?'] },
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
