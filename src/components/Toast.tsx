import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { t } from '../i18n';

/** Aviso breve al pie con una acción opcional (p. ej. «Deshacer» tras borrar). Se va solo a los 6 s. */
interface Toast { message: string; action?: { label: string; run: () => void } }
const Ctx = createContext<(t: Toast) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number>();
  const show = useCallback((x: Toast) => {
    setToast(x);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 6000);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="toast">
            <span>{toast.message}</span>
            {toast.action && (
              <button type="button" className="toast-action" onClick={() => { toast.action!.run(); setToast(null); }}>{toast.action.label}</button>
            )}
            <button type="button" className="toast-close" aria-label={t('comun.cerrar')} onClick={() => setToast(null)}>×</button>
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
