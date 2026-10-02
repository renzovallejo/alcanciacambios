# Pantallas

Cada pantalla indica su **ruta en el prototipo** (para abrirla directo), el **archivo de código** de referencia en `08-prototipo-web/src/screens/`, la **captura** en `07-referencias/pantallas/` y el **prefijo de textos** en `05-textos/claves.md`.

**Estructura general**

- **Con barra inferior** (pestañas Alcancía · Aprender · Progreso): Alcancía, Sus metas, Detalle de meta, Todo lo anotado, Aprender, Biblioteca, Progreso, Tema, Todo lo anotado (Progreso), Selector de persona. La pestaña activa sigue a la sección: Biblioteca → Aprender; Tema → Progreso; Metas → Alcancía.
- **Tareas enfocadas** (sin barra inferior, con «←» o «✕» arriba): flujos de plata, poner meta, cuento, guía, misión, juego, actividad, momento, anotar, felicitar, chanchito y sus ajustes, sesión. Acción principal fija al pie, por encima del teclado y del área segura.
- Margen lateral 24 dp, contenido con scroll vertical, sin alturas fijas.
- El encabezado de las pantallas principales tiene el botón ⚙️ (44 × 44 dp) que abre **El chanchito**.
- Bajo el título, la fila de contexto muestra el nombre del niño (abre el selector de persona) y el estado del chanchito (abre ajustes).

---

## Alcancía

### Alcancía (inicio) · `/` · `Home.tsx` · capturas 01, 06, 43 · `alcancia.*`
- **Contenido**: encabezado → contexto → tarjeta de saldo (mascota 64 dp, «LLEVA AHORRADO», monto 36 sp, «Según lo que han anotado») → acciones → «Sus metas» (máx. 2, orden estable) → «Lo último que anotaron» (máx. 2).
- **Acciones**: «Agregar plata» → Agregar plata · «Sacar plata» → Sacar plata · «Ver todas (N)» → Sus metas · tarjeta de meta → Detalle de meta · «Ver todos» → Todo lo anotado · fila → Detalle.
- **Estados**:
  - *Primer día* (saldo 0, sin metas ni movimientos): un solo botón «Anotar su primera plata»; tarjeta crema «¿Para qué quiere ahorrar {nombre}?» con «Poner su primera meta»; vacío de movimientos con icono. **No** mostrar «Sacar plata».
  - *Con datos*: dos botones lado a lado.
  - *Meta lograda*: tarjeta en menta, icono ✓ y «¡Logrado!» en lugar del %.
  - *Volviendo de anotar*: el saldo cuenta desde el valor anterior y el movimiento nuevo se resalta (ver animaciones).

### Sus metas · `/metas` · `Lists.tsx` · 07 · `meta.lista*`
- Todas las metas en orden de creación (no reordenar por %). Botón «Poner otra meta» → Poner meta.

### Detalle de meta · `/meta/:id` · `Goal.tsx` · 08 · `meta.*`
- Icono + nombre (título) → tarjeta: «S/ 6.00 de S/ 30.00», barra, «Va 20% · Le faltan S/ 24.00» → «Agregar plata a esta meta» → «Lo que han guardado para esta meta» (movimientos con esa meta) → aviso «Es solo para llevar la cuenta…».
- *Lograda*: tarjeta menta, «¡Lo lograron! Conversen juntos qué hacer ahora.» y **sin** botón de agregar.
- «Agregar plata a esta meta» abre el flujo de agregar con esa meta ya elegida en el paso 2.

### Poner meta · `/meta/nueva` · `NuevaMeta.tsx` · 04 · `nuevaMeta.*`
- Título de barra «Su primera meta» u «Otra meta». Campos: «¿Qué quiere?» (máx. 40), «¿Cuánto cuesta más o menos? (S/)» (misma validación de monto). Botón «Guardar meta».
- Al guardar: si vino de una actividad (`?volver=`), vuelve a la actividad; si era la primera, a Alcancía; si no, a Sus metas.

### Todo lo anotado / Detalle · `/movimientos`, `/movimiento/:id` · `Lists.tsx` · 09, 10 · `movimientos.*`
- Lista completa (más reciente primero). Fila: icono ↑ verde (entró) o ↓ crema (salió), «Guardó plata / Sacó plata», «Mamá · hoy · Su propina de la semana», monto con signo **+ / −** (el signo acompaña al color).
- Detalle: «Entró/Salió» + monto, Lo anotó, Cuándo, Por qué, Meta.

## Flujo de plata (agregar y sacar)

4 pasos con indicador «Paso N de 4 · Etiqueta» y 4 segmentos. Rutas `/saldo/*` (agregar) y `/salida/*` (sacar). Mismo componente, textos `flujo.in.*` / `flujo.out.*`.

### Paso 1 · Cuánto · `/saldo/importe` · `Saldo.tsx` · 39, 05, 44
- Barra: «✕» + título. «✕» con datos elegidos pide confirmar: «Si sales ahora, no se anotará nada. ¿Quieres salir?».
- Pregunta («¿Cuánto va a guardar?» / «¿Cuánto va a sacar?») → caja «Ahora tiene ahorrado S/ X» → campo de monto grande (36 sp, prefijo «S/», teclado decimal) → ayuda o error → «O escoge uno rápido» (S/ 5 · S/ 10 · S/ 20, el elegido con ✓ y relleno) → «Así quedaría S/ Y» (solo si el monto es válido) → aviso «Esto es solo para llevar la cuenta…».
- Pie: «Continuar» (deshabilitado si el monto no es válido) + «Todavía no se anota nada.»
- Montos rápidos y teclado editan **el mismo** valor. Valor inicial: 10.00 (agregar) / 5.00 (sacar).

### Paso 2 · De dónde viene · `/saldo/motivo` · 40, 45
- Barra «←» (vuelve al paso 1 **conservando** lo escrito). Resumen «Sofía va a guardar S/ 10.00.».
- «Escoge una opción»: grilla de 2 columnas, selección única con icono ✓ + borde + fondo (nunca solo color). Toda la tarjeta es tocable. Opciones en el orden de `Motivo.ENTRADA` / `Motivo.SALIDA`.
- «Otra cosa» muestra el campo «Cuéntanos qué fue» (máx. 60) y es obligatorio.
- «¿Es para alguna meta?» / «¿Sale de alguna meta?»: selector desplegable con «Ninguna meta en especial» + metas existentes (no inventar metas).
- Pie: «Continuar» (habilitado con una opción válida) + «Antes de anotar, podrás revisar todo.»

### Paso 3 · ¿Todo bien? · `/saldo/revisar` · 41
- Lista: Cuánto · Por qué · Meta · Ahora tiene · **Así quedaría** (en azul).
- Pie: «Sí, anotar» + «Recién se anota cuando toques el botón.». Un solo envío: el botón pasa a «Un ratito…» y se bloquea.

### Paso 4 · ¡Listo! · `/saldo/listo` · 42
- Check grande con rebote, «¡Listo, ya está anotado!», «Ahora Sofía lleva ahorrado S/ X.» y, si se completó una meta, aviso menta «¡Ya juntaron todo para «Meta»!».
- Pie: «Volver a Alcancía». **No** se puede volver atrás a pasos anteriores (reemplazar la pila de navegación).

## Aprender

### Aprender · `/aprender` · `Learn.tsx` · 02, 11 · `aprender.*`
- *Para empezar* (ninguna actividad empezada): «Aprendan a ahorrar juntos» + texto → tarjeta lavanda «PARA EMPEZAR · AHORRAR», «Fijar una meta de ahorro», mascota, «Ver de qué se trata» → «Otras formas de acompañar» (Biblioteca, Anotar algo que pasó, Felicitar).
- *En curso*: tarjeta «EN CURSO · {TEMA}», título de la actividad activa, fila «Ahora: {paso actual}» (borde naranja), «Seguir con la actividad» → «Otras cosas que pueden hacer» (Anotar, Felicitar, Biblioteca).

### Biblioteca · `/biblioteca` · 12–14 · `biblioteca.*`
- Volver «Aprender». Título + subtítulo por formato. Segmentado de 3 (Cuentos · Misiones · Juegos) con píldora azul deslizante.
- Tarjeta destacada por formato (lavanda / menta / crema) con su botón. «Más para ver» con filtro «Todos los temas ▾» y lista.
- El tema filtrado **se conserva** al cambiar de formato. Sin resultados: «Todavía no hay {formato} de este tema.».

### Cuento · `/cuento/:id` · `Content.tsx` · 15, 37 · `cuento.*`
- Barra «Aprender juntos». Ceja «GASTAR BIEN · PASO 1 DE 3» (el paso solo si viene de una actividad) → título → «Un cuento para escuchar juntos.» → tarjeta lavanda con el texto → «Escuchar en este celular» / «Escuchar en el chanchito» → barra de progreso + tiempos → controles −10 s · ▶/❚❚ · +10 s → «Después, conversen: {primera pregunta}».
- Pie: «Ver preguntas para conversar» + «Seguir otro día» (sale sin penalizar).
- **Sin audio automático.** Estados: detenido, cargando, reproduciendo, pausado, terminado, error. Sin archivo o sin chanchito: error recuperable (crema) y el texto sigue legible.

### Para conversar · `/guia/:id` · 16 · `guia.*`
- Preguntas (tarjetas lavanda) + «Unos consejos para ti» (3) + «Ya lo conversamos» (registra una conversación; luego queda «¡Anotado!» deshabilitado). Ver la guía **no** completa nada.

### Misión · `/mision/:id` · 17 · `mision.*` · Juego · `/juego/:id` · 18 · `juego.*`
- Misión: tarjeta menta (ceja, título, resumen) → «Van a necesitar» → «Cómo se hace» con casillas (ayuda visual, no se guardan ni evalúan) → «Anotar cómo les fue» (abre Anotar con el tema elegido).
- Juego: tarjeta crema → «Quién hace qué» → «Para conversar después» → «Ya lo conversamos».

### Actividad · `/actividad/:tema` · `Actividad.tsx` · 19, 20 · `actividad.*`
- Tarjeta lavanda (estado + tema, título, mascota, descripción) → «Lo que van a hacer» → pasos numerados (actual en azul + «Toca ahora»; anteriores con ✓) → «Ya hicimos este paso» (secundario) → en el último paso, aviso con enlace «ver otro tema».
- Sin empezar: nota «Mirar esto no la empieza…» y pie «Empezar» (marca el tema como empezado y abre el paso 1). Empezada: pie «Seguir con la actividad» (abre el paso actual).

## Progreso

### Progreso · `/progreso` · `Momentos.tsx` · 21, 03 · `progreso.*`
- Contexto con «Sin notas ni comparar con nadie» → tarjeta menta del momento destacado (ceja, título, relato, «Lo contó Mamá · ayer», «Ver más →») → resumen «3 cosas anotadas · 3 conversaciones» + «Ver todo →» → «Lo que va descubriendo»: 4 temas en 2 columnas (orden fijo Ahorrar, Gastar bien, Compartir, Ganar; «Ya empezaron» en azul suave o «Todavía no empiezan») → «¿Qué pueden hacer ahora?» + siguiente actividad sugerida + «Ver la actividad».
- *Sin momentos*: la tarjeta invita («Cuenten lo que vean» + «Anotar algo que pasó»). Sin temas por empezar: texto + «Abrir Biblioteca».
- Con texto grande o pantalla de 320 dp: temas en 1 columna.

### Tema · `/tema/:tema` · 22 · `tema.*`
- Icono 48 dp + nombre + estado → «Lo que han anotado» (tarjetas menta) → «Anotar algo que pasó» → tarjeta de su actividad.

### Lo que pasó · `/momento/:id` · 23 · `momento.*` · Anotar · `/momento/nuevo` · 25 · `nuevoMomento.*`
- Detalle: tarjeta menta (tema, título, relato, autor y fecha) + «Es lo que vio alguien de la familia, no una nota.» + mensajitos recibidos + «Mandarle un mensajito».
- Anotar: «¿Qué pasó?» (obligatorio, máx. 280), «Título (opcional)» (máx. 40), «¿Quién lo vio?» (obligatorio, máx. 30, ejemplo «Mamá, papá, la abuela, el tío…»), «Tema (opcional)». Guarda con la fecha de hoy y abre el detalle.

### Felicitar · `/celebrar` · 26 · `felicitar.*` · Todo lo anotado · `/avances` · 24 · `avances.*`
- Felicitar: 4 frases + «Escribir el mío» (selección única, máx. 100). Al guardar: icono con rebote «¡Mensajito guardado!». Es voluntario y no cambia ningún estado.
- Todo lo anotado: «Cosas que pasaron», «Conversaciones», «Mensajitos», cada sección con su vacío.

## El chanchito y la cuenta

### El chanchito · `/chanchito` · `Chanchito.tsx` · 27, 38 · `chanchito.*`
- Tarjeta crema de estado (mascota, «Sin conexión», instrucción, «Intentar otra vez») → «El chanchito» (Batería, Red WiFi, Volumen, Conectar este celular) → «Familia» (Perfil) → «Cerrar sesión» y versión.
- «Intentar otra vez»: «Conectando…» (botón «Un ratito…», mascota se balancea, un intento a la vez) → conectado **solo** si el dispositivo responde; si no, error recuperable.
- Los botones «Reiniciar la demo» / «Empezar desde cero» son **solo del prototipo**: no van en la app.

### Batería · WiFi · Volumen · Conectar este celular · Perfil · 28–32
- Muestran «lo último que sabemos» y avisan cuando no está al día. Sin conexión, cambiar WiFi o volumen está bloqueado. Un cambio solo se da por hecho cuando el chanchito lo confirma.
- Conectar este celular: 3 pasos + «Buscar chanchito» (pide permisos de Bluetooth / ubicación según la plataforma).
- Perfil: editar el nombre (obligatorio, máx. 30); se refleja en toda la app.

### Selector de persona · `/perfiles` · 33 · Cerrar sesión · `/sesion/*` · 34, 35
- Selector: la persona actual con ✓ + «Editar perfil». Cerrar sesión: confirmación «¿Cerrar sesión?» → conectar con el cierre de sesión real de la app (la pantalla 35 es solo del prototipo).
