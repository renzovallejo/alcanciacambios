# Reglas de negocio

Cada regla indica dónde está implementada en el prototipo (`08-prototipo-web/src/…`) para que puedas comparar comportamiento.

## Dinero (`lib/money.ts`)

| Regla | Detalle |
|---|---|
| Unidad | Céntimos enteros (`Int`). S/ 10.50 = 1050. **Nunca** `Double`/`Float`. |
| Formato | `S/ 10.00`: «S/» + espacio + enteros + punto + 2 decimales. Negativo: `-S/ 5.00` (en listas se muestra `−S/ 5.00` con signo tipográfico). Montos rápidos sin decimales: `S/ 5`. |
| Entrada válida | Se acepta «10», «10.5», «10.50», «S/ 10», «0,07» (coma como decimal) y espacios alrededor. |
| Errores (en este orden) | vacío → `dinero.errorVacio` · coma y punto juntos → `errorSeparador` · más de 2 decimales → `errorDecimales` · cualquier otro formato (letras, negativo) → `errorFormato` · cero → `errorCero` · más de S/ 1,000.00 → `errorMaximo`. |
| Casos de prueba | `06-datos/casos-de-prueba/dinero.json` sale del código real. Úsalos tal cual en tus tests unitarios: mismo input → mismo `ok`/céntimos o mismo código de error. |
| Proyección | «Así quedaría» = ahorrado ± monto. Es una proyección: no cambia nada hasta confirmar. |
| Confirmación | Un solo envío por confirmación (botón bloqueado mientras se guarda). Al confirmar: saldo ± monto, meta ± monto si se eligió, nuevo movimiento al inicio de la lista, borrador limpio. |
| Salidas | No más que lo ahorrado (`dinero.errorNoAlcanza`) ni más que lo guardado en la meta de origen (`dinero.errorMetaNoAlcanza`). La meta nunca baja de 0. |
| Movimiento | Guarda: tipo (`in`/`out`), autor (quien anotó: nombre de quien acompaña, o «Tú»), fecha ISO, monto con signo, motivo (`reasonId` + `reasonDetail` para «Otra cosa»; el texto visible sale del catálogo), meta (id + nombre) y, **solo en entradas, quién envía** (`senderId` ∈ `mama, papa, abuela, abuelo, tio, otro` + `senderName` libre, obligatorio con `otro`). |
| Quién envía vs. quién anotó | Son datos distintos: la abuela puede enviar y mamá anotar. En listas de entradas se muestra quién envía; el detalle muestra ambos («Le envió» / «Lo hizo»). Con el chanchito conectado, él dice en voz alta el nombre de quien envía. |
| Recordar lo último | `last.in` / `last.out` guardan monto, motivo, meta y quién envía. Al empezar un flujo se precargan (la meta solo si sigue disponible). |
| Borrador | Cualquier cambio en el flujo marca el borrador `active`. Abrir el mismo flujo lo retoma; Alcancía ofrece «Seguir» o «Descartar». Confirmar o descartar lo limpia. |
| Corregir | Se recalcula como «deshacer el movimiento y aplicarlo con los datos nuevos». Si el saldo o alguna meta quedaría negativa, no se guarda y se avisa (`movimientos.editarNegativo`). |
| Borrar | Igual validación (`movimientos.borrarNoSePuede`). Confirmación previa y «Deshacer» durante 6 s, que restaura el estado completo. |

## Metas (`lib/money.ts` → `percent`, `screens/Goal.tsx`)

- **Avance** = guardado / objetivo, redondeado a entero, máximo 100 %. La barra nunca va sola: siempre con «S/ X de S/ Y» y el %.
- **Lograda** cuando guardado ≥ objetivo; queda marcada (`achieved`) aunque después se use la plata. Tarjeta menta, «¡Logrado!», sin botón de agregar.
- **Usar esta plata** (meta lograda con plata): abre Sacar plata con la meta, su monto y «Se compró algo» puestos. Cuando queda en 0 se muestra «Ya la usaron» y deja de ofrecerse para agregar.
- **Sus metas**: «En camino» arriba y «Logradas» aparte. En Alcancía no se muestran las ya usadas.
- **Editar** nombre y costo; **borrar** no borra plata (los movimientos quedan sin meta y conservan el nombre).
- **Aviso de meta alcanzada** solo en la confirmación que la completa (antes < objetivo y después ≥ objetivo).
- **Orden** estable (de creación). En Alcancía, máximo 2 + «Ver todas (N)». No reordenar por porcentaje.
- No hace falta tener una meta para agregar plata («Ninguna meta en especial» es válido).

## Fechas (`lib/dates.ts`)

- «hoy», «ayer» o «1 oct» (día + mes abreviado en minúsculas). Fecha inválida → no se muestra (nunca inventar fechas).
- «Esta semana: +S/ X» = suma de entradas de los últimos 7 días. «Lo que entró y salió» se agrupa por mes («octubre») con «Entró S/ X · Salió S/ Y».

## Aprender y actividades (`screens/Learn.tsx`, `screens/Actividad.tsx`, `lib/content.ts`)

- Hay una actividad por tema (`06-datos/contenido.json` → `actividades`), con 2 o 3 pasos que apuntan a un cuento, misión, juego o acción («Crear la meta juntos»).
- **Abrir no empieza.** Solo «Empezar» marca el tema como empezado (`startedTopics`) y lo deja activo (`activeTopic`).
- **Paso actual** por tema (`activityStep`). «Ya hicimos este paso» avanza uno (sin pasar del último).
- Aprender muestra «PARA EMPEZAR» si no hay actividad activa (propone Ahorrar) o «EN CURSO» con la activa.
- Ceja «PASO N DE M» en cuentos, misiones y juegos solo cuando se abren desde una actividad.
- **Terminar**: en el último paso, «Ya terminamos» → `finishedTopics`, deja de estar activa, celebración sin puntaje y sugerencia de la siguiente no terminada.
- **Duración** por paso: minutos del cuento, misión o juego (acciones: 2 min).
- **Cuentos**: versión completa y **versión de 1 minuto** (`short`). «Leer en voz alta» usa el TTS del sistema (`es-PE`, velocidad 0.95) y se dice que es la voz del celular; si no hay TTS, mensaje `cuento.vozNoDisponible`.
- **Idea de 1 minuto**: una por día (`IDEAS`, rota por día). «Ya lo hicimos» suma una conversación.

## Progreso (`screens/Momentos.tsx`)

- **Momento destacado**: el más reciente con fecha válida. Ceja «ESTA SEMANA» si tiene menos de 7 días; si no, «LO ÚLTIMO QUE CONTARON». Título: el que puso la persona o «Un momento de {nombre}».
- **Conteos**: cosas anotadas y conversaciones, con plural. No sumarlos como puntos.
- **Temas**: orden fijo Ahorrar, Gastar bien, Compartir, Ganar. Estado «Ya empezaron» solo si se tocó «Empezar». Nunca «domina», «aprendió» ni porcentajes.
- **Siguiente actividad**: la del primer tema que todavía no empiezan; si ya empezaron todos, invitar a la Biblioteca.
- **Conversaciones**: se suman solo con «Ya lo conversamos» (guía o juego). Abrir la guía no cuenta.
- **Felicitar** es voluntario y no cambia ningún estado.

## Chanchito (`lib/device.ts`)

- Un solo estado de conexión para toda la app (`deviceOnline`). Sin hardware: «Sin conexión». En la demo de **una semana** se asume conectado (verde, «Conectado», batería «Ahora», volumen editable, el cuento del chanchito suena en él); con hardware real lo decide la respuesta del dispositivo. Si **nunca** se conectó (`devicePaired = false`), en vez de «Sin conexión» se invita a «Conectar chanchito».
- Reintento: un intento a la vez; «Conectado» solo con respuesta real del dispositivo.
- Batería, WiFi y volumen: «lo último que sabemos»; mostrar fecha de lectura solo si existe.
- Cambios de configuración: pendientes hasta que el chanchito confirme.

## Datos de la persona

- Una persona por cuenta en esta versión. El nombre es un dato (nunca «Sofía» fijo en el código).
- Lo que entró y salió va a la persona visible arriba; cambiar de persona nunca cambia una operación en curso.
- **Quién acompaña** (`caregiver`: nombre + relación): firma lo anotado, llena «¿Quién lo vio?» y marca «Administra la cuenta» en «¿Quién le envía?». Si no existe, se toma del primer momento anotado.
- **Recordatorio de propina** (`propinaDay` 0–6 o null): se ofrece tras anotar «Su propina de la semana». Ese día, si todavía no anotaron una, Alcancía muestra el aviso. En nativo, además, notificación local ese día (ver `plataformas.md`).
- Estados de ejemplo para desarrollo y QA: `06-datos/semillas/` (`vacio`, `ejemplo`, `semana`).
