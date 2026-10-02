import { Route, Routes } from 'react-router-dom';
import Layout, { TaskLayout } from './components/Layout';
import Home from './screens/Home';
import { AllGoals, AllMovements, MovementDetail, MovementEdit } from './screens/Lists';
import { Aprender, Biblioteca } from './screens/Learn';
import Progreso, { Avances, Celebrar, MomentoDetalle, NuevoMomento } from './screens/Momentos';
import { SaldoImporte, SaldoListo, SaldoMotivo, SaldoQuien, SaldoRevisar } from './screens/Saldo';
import NuevaMeta from './screens/NuevaMeta';
import Chanchito, { Acompana, Bateria, CerrarSesion, Emparejar, Perfil, Perfiles, Recordatorio, SesionCerrada, Sonido, Wifi } from './screens/Chanchito';
import { Cuento, Guia, Juego, Mision } from './screens/Content';
import { Actividad, Tema } from './screens/Actividad';
import GoalDetail from './screens/Goal';
import NotFound from './screens/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="aprender" element={<Aprender />} />
        <Route path="biblioteca" element={<Biblioteca />} />
        <Route path="progreso" element={<Progreso />} />
        <Route path="avances" element={<Avances />} />
        <Route path="tema/:topic" element={<Tema />} />
        <Route path="metas" element={<AllGoals />} />
        <Route path="movimientos" element={<AllMovements />} />
        <Route path="movimiento/:id" element={<MovementDetail />} />
        <Route path="perfiles" element={<Perfiles />} />
        <Route path="meta/:id" element={<GoalDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<TaskLayout />}>
        {(['saldo', 'salida'] as const).map((b) => [
          <Route key={`${b}1`} path={`${b}/importe`} element={<SaldoImporte />} />,
          <Route key={`${b}2`} path={`${b}/motivo`} element={<SaldoMotivo />} />,
          <Route key={`${b}3`} path={`${b}/revisar`} element={<SaldoRevisar />} />,
          <Route key={`${b}5`} path={`${b}/quien`} element={<SaldoQuien />} />,
          <Route key={`${b}4`} path={`${b}/listo`} element={<SaldoListo />} />,
        ])}
        <Route path="meta/nueva" element={<NuevaMeta />} />
        <Route path="meta/:id/editar" element={<NuevaMeta />} />
        <Route path="movimiento/:id/editar" element={<MovementEdit />} />
        <Route path="chanchito/acompana" element={<Acompana />} />
        <Route path="chanchito/recordatorio" element={<Recordatorio />} />
        <Route path="chanchito" element={<Chanchito />} />
        <Route path="chanchito/bateria" element={<Bateria />} />
        <Route path="chanchito/wifi" element={<Wifi />} />
        <Route path="chanchito/sonido" element={<Sonido />} />
        <Route path="chanchito/emparejar" element={<Emparejar />} />
        <Route path="chanchito/perfil" element={<Perfil />} />
        <Route path="sesion/cerrar" element={<CerrarSesion />} />
        <Route path="sesion/cerrada" element={<SesionCerrada />} />
        <Route path="cuento" element={<Cuento />} />
        <Route path="cuento/:id" element={<Cuento />} />
        <Route path="guia/:id" element={<Guia />} />
        <Route path="mision/:id" element={<Mision />} />
        <Route path="juego/:id" element={<Juego />} />
        <Route path="actividad/:topic" element={<Actividad />} />
        <Route path="momento/nuevo" element={<NuevoMomento />} />
        <Route path="momento/:id" element={<MomentoDetalle />} />
        <Route path="momento/:id/editar" element={<NuevoMomento />} />
        <Route path="celebrar" element={<Celebrar />} />
      </Route>
    </Routes>
  );
}
