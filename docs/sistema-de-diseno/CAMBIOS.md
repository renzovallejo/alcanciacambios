# Cambios del sistema de diseño

## v3.4.1 · Revisión por tipos de usuario

**Ícono de la app:** nuevo ícono «Chanchito» (`assets/icono-app/`, ver su LEEME): maestro de 1024 px y variantes para web, Android e iOS generadas desde él.

**Mascota en vector:** `assets/mascota/chanchito.svg`, con fondo transparente, lienzo desde 0, 0 y recorte justo (antes se corría a la izquierda en algunos visores).

**Tarjeta «Lleva ahorrado»:** pasa del azul principal lleno a su versión clara: fondo `fondo-azul` (#F5F7FE) sin borde, monto en `principal` y etiquetas en `texto-secundario`. Más liviana en la portada; el azul fuerte queda para el botón principal.

**Menos texto:** auditoría de las versiones de primer día y de una semana: −39 % y −23 % de palabras en pantalla. Se quitaron subtítulos explicativos, ayudas al pie, frases tranquilizadoras y resúmenes que repetían lo elegido. Regla nueva en `documentacion/lenguaje.md`.

**Lenguaje:** se deja de usar «anotar» (no es tan común en Perú). Plata: «guardar / sacar» («Sí, guardar», «¡Listo, ya se guardó!», «Lo que entró y salió»). Momentos: «contar» («Contar algo que pasó», «3 cosas contadas»). Se quitan los avisos «no mueve plata de verdad».

Componentes nuevos (todos con tokens existentes; ver capturas en el paquete para desarrollo):

- **Tarjeta de opción con radio** (`.reason.wide` + `.radio-dot`): «¿Quién le envía?», metas en el flujo, días del recordatorio. Subtítulo opcional («Administra la cuenta»).
- **Chip de acción** (`.chip`): versión del cuento. 44 dp de alto, fondo azul suave.
- **Aviso en línea** (`.banner`): borrador a medias y día de la propina. Fondo crema, icono + texto + acciones debajo.
- **Aviso flotante con Deshacer** (`.toast`): 6 s, fondo texto, acción subrayada.
- **Tarjeta «Idea de 1 minuto»**: lavanda, ceja con icono de foco.
- **Moneda al chanchito**: moneda dorada de 30 dp que cae sobre la mascota (respeta reducir movimiento).
- Iconos nuevos de Lucide: person-standing, users-round, user-round-plus, pencil, trash-2, lightbulb, bell, clock-3, hand-coins, coins.

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
| Mesada / Propina / Cumpleaños / Buen comportamiento / Otro | Propina de la semana / Le dieron propina / Por su cumple / Se portó bien / Otra cosa |
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
- Dinero: ya no se pide la etiqueta «práctica». En v3.4.1 también se quitó el aviso «no mueve plata de verdad»: las familias ya lo saben.
- En Perú «propina» es la plata semanal: el id `mesada` se muestra como «Propina de la semana» (sin «Su»: más corto en las filas).
- El chanchito es masculino: «Conectado», «Préndelo».

### Archivos
- `editable/alcancia-ds-v3.3.pen` → `editable/alcancia-ds-v3.4.pen` (198 textos actualizados).
- `documentacion/componentes.json` (36) y `pantallas.json` (28): textos de ejemplo y overrides actualizados.
- Los renders PNG/PDF v3.3 se conservan en `referencias/*-v3.3/` como referencia de medidas.

## v3.3
Doce pantallas de referencia y cuatro paneles. Ver `referencias/sistema-v3.3/`.
