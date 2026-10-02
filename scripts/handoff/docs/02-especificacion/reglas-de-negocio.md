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
| Movimiento | Guarda: tipo (`in`/`out`), autor («Tú» en el celular; en la app real, el nombre de quien está con sesión), fecha ISO, monto con signo, motivo (texto visible) y meta (id + nombre). |

## Metas (`lib/money.ts` → `percent`, `screens/Goal.tsx`)

- **Avance** = guardado / objetivo, redondeado a entero, máximo 100 %. La barra nunca va sola: siempre con «S/ X de S/ Y» y el %.
- **Lograda** cuando guardado ≥ objetivo: tarjeta menta, «¡Logrado!», sin botón de agregar.
- **Aviso de meta alcanzada** solo en la confirmación que la completa (antes < objetivo y después ≥ objetivo).
- **Orden** estable (de creación). En Alcancía, máximo 2 + «Ver todas (N)». No reordenar por porcentaje.
- No hace falta tener una meta para agregar plata («Ninguna meta en especial» es válido).

## Fechas (`lib/dates.ts`)

- «hoy», «ayer» o «1 oct» (día + mes abreviado en minúsculas). Fecha inválida → no se muestra (nunca inventar fechas).

## Aprender y actividades (`screens/Learn.tsx`, `screens/Actividad.tsx`, `lib/content.ts`)

- Hay una actividad por tema (`06-datos/contenido.json` → `actividades`), con 2 o 3 pasos que apuntan a un cuento, misión, juego o acción («Crear la meta juntos»).
- **Abrir no empieza.** Solo «Empezar» marca el tema como empezado (`startedTopics`) y lo deja activo (`activeTopic`).
- **Paso actual** por tema (`activityStep`). «Ya hicimos este paso» avanza uno (sin pasar del último).
- Aprender muestra «PARA EMPEZAR» si no hay actividad activa (propone Ahorrar) o «EN CURSO» con la activa.
- Ceja «PASO N DE M» en cuentos, misiones y juegos solo cuando se abren desde una actividad.

## Progreso (`screens/Momentos.tsx`)

- **Momento destacado**: el más reciente con fecha válida. Ceja «ESTA SEMANA» si tiene menos de 7 días; si no, «LO ÚLTIMO QUE ANOTARON». Título: el que puso la persona o «Un momento de {nombre}».
- **Conteos**: cosas anotadas y conversaciones, con plural. No sumarlos como puntos.
- **Temas**: orden fijo Ahorrar, Gastar bien, Compartir, Ganar. Estado «Ya empezaron» solo si se tocó «Empezar». Nunca «domina», «aprendió» ni porcentajes.
- **Siguiente actividad**: la del primer tema que todavía no empiezan; si ya empezaron todos, invitar a la Biblioteca.
- **Conversaciones**: se suman solo con «Ya lo conversamos» (guía o juego). Abrir la guía no cuenta.
- **Felicitar** es voluntario y no cambia ningún estado.

## Chanchito (`lib/device.ts`)

- Un solo estado de conexión para toda la app. Sin hardware: «Sin conexión».
- Reintento: un intento a la vez; «Conectado» solo con respuesta real del dispositivo.
- Batería, WiFi y volumen: «lo último que sabemos»; mostrar fecha de lectura solo si existe.
- Cambios de configuración: pendientes hasta que el chanchito confirme.

## Datos de la persona

- Una persona por cuenta en esta versión. El nombre es un dato (nunca «Sofía» fijo en el código).
- Todo lo anotado va a la persona visible arriba; cambiar de persona nunca cambia una operación en curso.
- Estados de ejemplo para desarrollo y QA: `06-datos/semillas/` (`vacio`, `ejemplo`, `semana`).
