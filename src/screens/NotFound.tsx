import { LinkButton, Mascota } from '../components/ui';

export default function NotFound() {
  return (
    <div className="center-col nf">
      <Mascota size={100} />
      <h1 className="title center">No encontramos esta pantalla</h1>
      <p className="muted center">Puede que el enlace haya cambiado. Tus datos siguen guardados.</p>
      <LinkButton to="/" block>Ir a Alcancía</LinkButton>
    </div>
  );
}
