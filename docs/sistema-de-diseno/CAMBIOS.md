# Cambios del sistema de diseño

## v3.4 · Lenguaje peruano familiar

**Qué cambia:** los textos. **Qué no cambia:** colores, tipografía, espacios, radios, componentes, tokens ni contratos de datos.

### Nuevo
- `documentacion/lenguaje.md`: guía de voz y tono, glosario «usar / evitar», palabras de Perú, formato de moneda, diminutivos, patrones por componente y checklist.
- `referencias/app-v3.4/`: 20 capturas de la app implementada con los textos nuevos.
- Panel «04 / Lenguaje que orienta» (antes «Contenido que orienta») con las reglas de voz.

### Textos principales que cambian
| Antes (v3.3) | Ahora (v3.4) |
|---|---|
| Agregar saldo / Registrar salida | Agregar plata / Sacar plata |
| Agregar primer saldo | Anotar su primera plata |
| DINERO AHORRADO | LLEVA AHORRADO |
| Saldo de práctica actual | Ahora tiene ahorrado |
| Monto a agregar · Montos rápidos | Cuánto · O escoge uno rápido |
| Después de confirmar | Así quedaría |
| ¿De dónde viene? · Elige un motivo | ¿De dónde salió esta plata? · Escoge una opción |
| Destino del saldo · Sin meta | ¿Es para alguna meta? · Ninguna meta en especial |
| Mesada / Propina / Cumpleaños / Buen comportamiento / Otro | Su propina de la semana / Le dieron propina / Por su cumple / Se portó bien / Otra cosa |
| Ingreso registrado · Últimos movimientos | Guardó plata · Lo último que anotaron |
| Metas de ahorro | Sus metas |
| Conocer la actividad / Continuar actividad / Explorar actividad | Ver de qué se trata / Seguir con la actividad / Ver la actividad |
| Actividad iniciada / Por explorar | Ya empezaron / Todavía no empiezan |
| Registrar un momento · Observado por Mamá | Anotar algo que pasó · Lo contó Mamá |
| Celebrar un logro | Felicitar a Sofía |
| Juegos de rol · La tienda de casa | Juegos · La bodeguita de la casa |
| Reintentar conexión · Enciéndela… · Emparejar | Intentar otra vez · Préndelo… · Conectar este celular |
| S/. 10.00 | S/ 10.00 |

### Reglas actualizadas
- «Siempre «Juegos de rol»» pasa a: en la pestaña decir «Juegos» y explicar «Jueguen a ser otros y conversen».
- «Usar verbos específicos: «Agregar saldo»…» pasa a verbos cotidianos: «Agregar plata», «Sacar plata»…
- Dinero: ya no se pide la etiqueta «práctica»; se aclara con «Esto es solo para llevar la cuenta. La app no mueve plata de verdad».
- En Perú «propina» es la plata semanal: el id `mesada` se muestra como «Su propina de la semana».
- El chanchito es masculino: «Conectado», «Préndelo».

### Archivos
- `editable/alcancia-ds-v3.3.pen` → `editable/alcancia-ds-v3.4.pen` (198 textos actualizados).
- `documentacion/componentes.json` (36) y `pantallas.json` (28): textos de ejemplo y overrides actualizados.
- Los renders PNG/PDF v3.3 se conservan en `referencias/*-v3.3/` como referencia de medidas.

## v3.3
Doce pantallas de referencia y cuatro paneles. Ver `referencias/sistema-v3.3/`.
