import { LinkButton, Mascota } from '../components/ui';
import { t } from '../i18n';

export default function NotFound() {
  return (
    <div className="center-col nf">
      <Mascota size={100} />
      <h1 className="title center">{t('noEncontrado.titulo')}</h1>
      <p className="muted center">{t('noEncontrado.texto')}</p>
      <LinkButton to="/" block>{t('noEncontrado.boton')}</LinkButton>
    </div>
  );
}
