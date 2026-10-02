import { Route, Routes } from 'react-router-dom';
import Layout, { TaskLayout } from './components/Layout';
import Home from './screens/Home';
import { AllGoals, AllMovements } from './screens/Lists';
import { Aprender, Biblioteca } from './screens/Learn';
import Progreso from './screens/Progreso';
import { SaldoImporte, SaldoListo, SaldoMotivo, SaldoRevisar } from './screens/Saldo';
import NuevaMeta from './screens/NuevaMeta';
import Chanchito from './screens/Chanchito';
import Cuento from './screens/Cuento';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="aprender" element={<Aprender />} />
        <Route path="biblioteca" element={<Biblioteca />} />
        <Route path="progreso" element={<Progreso />} />
        <Route path="metas" element={<AllGoals />} />
        <Route path="movimientos" element={<AllMovements />} />
      </Route>
      <Route element={<TaskLayout />}>
        <Route path="saldo/importe" element={<SaldoImporte />} />
        <Route path="saldo/motivo" element={<SaldoMotivo />} />
        <Route path="saldo/revisar" element={<SaldoRevisar />} />
        <Route path="saldo/listo" element={<SaldoListo />} />
        <Route path="meta/nueva" element={<NuevaMeta />} />
        <Route path="chanchito" element={<Chanchito />} />
        <Route path="cuento" element={<Cuento />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
