import { LinkButton, Mascota } from '../components/ui';

export default function NotFound() {
  return (
    <div className="center-col nf">
      <Mascota size={100} />
      <h1 className="title center">Uy, esta página no existe</h1>
      <p className="muted center">Puede que el enlace esté mal. No te preocupes, lo que anotaste sigue guardado.</p>
      <LinkButton to="/" block>Ir a Alcancía</LinkButton>
    </div>
  );
}
