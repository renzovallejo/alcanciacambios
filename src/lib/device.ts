/**
 * Estado del chanchito. No hay hardware conectado a esta app: no se simula conexión
 * (regla del DS). Todas las pantallas leen de aquí para no contradecirse.
 */
export const DEVICE = {
  connection: 'disconnected' as 'connected' | 'disconnected',
  battery: { value: 52, receivedAt: null as string | null },
  volume: { value: 10, receivedAt: null as string | null },
  savedWifiName: 'CREMA VOLTEADA 2.4G',
};
export const isConnected = () => DEVICE.connection === 'connected';
