/**
 * Datos del chanchito. Si está conectado o no vive en el estado de la app (deviceOnline):
 * así todas las pantallas leen lo mismo y no se contradicen.
 */
export const DEVICE = {
  battery: { value: 52, receivedAt: null as string | null },
  volume: { value: 10, receivedAt: null as string | null },
  savedWifiName: 'CREMA VOLTEADA 2.4G',
};
export const isConnected = (s: { deviceOnline?: boolean }) => !!s.deviceOnline;
