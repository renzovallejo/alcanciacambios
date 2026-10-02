# Pantallas

Cada pantalla indica su **ruta en el prototipo** (para abrirla directo), el **archivo de código** de referencia en `08-prototipo-web/src/screens/`, la **captura** en `07-referencias/pantallas/` y el **prefijo de textos** en `05-textos/claves.md`.

**Estructura general**

- **Con barra inferior** (pestañas Alcancía · Aprender · Progreso): Alcancía, Sus metas, Detalle de meta, Lo que entró y salió, Aprender, Biblioteca, Progreso, Tema, Todo lo que han contado (Progreso), Selector de persona. La pestaña activa sigue a la sección: Biblioteca → Aprender; Tema → Progreso; Metas → Alcancía.
- **Tareas enfocadas** (sin barra inferior, con «←» o «✕» arriba): flujos de plata, poner meta, cuento, guía, misión, juego, actividad, momento, anotar, felicitar, chanchito y sus ajustes, sesión. Acción principal fija al pie, por encima del teclado y del área segura.
- Margen lateral 24 dp, contenido con scroll vertical, sin alturas fijas.
- El encabezado de las pantallas principales tiene el botón ⚙️ (44 × 44 dp) que abre **El chanchito**.
- Bajo el título, la fila de contexto muestra el nombre del niño (abre el selector de persona) y el estado del chanchito (abre ajustes).

---

## Alcancía

### Alcancía (inicio) · `/` · `Home.tsx` · capturas 01, 08, 09, 13, 58 · `alcancia.*`
- **Contenido**: encabezado → contexto → tarjeta de saldo en azul claro (fondo `FondoAzul`, sin borde; mascota 64 dp, «LLEVA AHORRADO» en texto secundario, monto 36 sp en `Principal`) → acciones → «Sus metas» (máx. 2, orden estable) → «Lo último que entró y salió» (máx. 2).
- **Acciones**: «Agregar plata» → Agregar plata · «Sacar plata» → Sacar plata · «Ver todas (N)» → Sus metas · tarjeta de meta → Detalle de meta · «Ver todos» → Lo que entró y salió · fila → Detalle.
- **Estados**:
  - *Primer día* (saldo 0, sin metas ni movimientos): un solo botón «Guardar su primera plata»; tarjeta crema «¿Para qué quiere ahorrar {nombre}?» con «Poner su primera meta». **No** mostrar «Sacar plata» ni la sección «Lo último que entró y salió» (vacía).
  - *Con datos*: dos botones lado a lado («Sacar plata» solo si hay saldo).
  - *Saldo*: bajo el monto, «Esta semana: +S/ X» si entró plata en 7 días.
  - *Borrador*: aviso crema «Dejaron a medias: S/ X» con «Descartar» y «Seguir».
  - *Día de la propina* (sin anotarla aún): aviso «Hoy es {día}, día de su propina. ¿Ya la guardó?» con «Guardar su propina».
  - *Idea de 1 minuto*: tarjeta lavanda al final con «Ya lo hicimos».
  - *Chanchito nunca conectado*: en el contexto, «Conectar chanchito» en vez de «Sin conexión».
  - *Meta lograda*: tarjeta en menta, icono ✓ y «¡Logrado!» en lugar del %.
  - *Volviendo de anotar*: el saldo cuenta desde el valor anterior y el movimiento nuevo se resalta (ver animaciones).

### Sus metas · `/metas` · `Lists.tsx` · 14, 12 · `meta.lista*`
- «En camino» en orden de creación (no reordenar por %) → «Poner otra meta» → «Logradas» aparte (con «¡Logrado!» o «Ya la usaron»).

### Detalle de meta · `/meta/:id` · `Goal.tsx` · 15, 10 · `meta.*`
- Icono + nombre (título) → tarjeta: «S/ 6.00 de S/ 30.00», barra, «Va 20% · Le faltan S/ 24.00» → «Agregar plata a esta meta» → «Lo que han guardado para esta meta» (movimientos con esa meta).
- *Lograda*: tarjeta menta, «¡Lo lograron! Conversen juntos qué hacer ahora.» y **sin** botón de agregar.
- «Agregar plata a esta meta» abre el flujo de agregar con esa meta ya elegida en el paso 2.
- *Lograda con plata*: «Usar esta plata» → Sacar plata con meta, monto y «Se compró algo» puestos. *Usada*: «Ya usaron esta plata…».
- Al pie: «Editar meta» (→ `/meta/:id/editar`, 20, mismo formulario que Poner meta con «Guardar cambios») y «Borrar meta» (confirma; la plata no se borra; aviso con «Deshacer»).

### Poner meta · `/meta/nueva` · `NuevaMeta.tsx` · 04 · `nuevaMeta.*`
- Título de barra «Su primera meta» u «Otra meta». Campos: «¿Qué quiere?» (máx. 40), «¿Cuánto cuesta más o menos? (S/)» (misma validación de monto). Botón «Guardar meta».
- Al guardar: si vino de una actividad (`?volver=`), vuelve a la actividad; si era la primera, a Alcancía; si no, a Sus metas.

### Lo que entró y salió / Detalle · `/movimientos`, `/movimiento/:id` · `Lists.tsx` · 16, 17, 18 · `movimientos.*`
- Agrupado por mes («octubre», con «Entró S/ X · Salió S/ Y»), más reciente primero. Fila: icono ↑ verde (entró) o ↓ crema (salió), **título = motivo** («Propina de la semana»), debajo solo **quién envió · cuándo** («Abuela · ayer»; en salidas, solo cuándo), monto con signo **+ / −**.
- Detalle: «Entró/Salió» + monto, **Le envió** (entradas), Por qué, Meta, Cuándo, Lo hizo → «Corregir» y «Borrar» (confirma; si dejaría plata en negativo, avisa y no borra; aviso con «Deshacer»).

## Flujo de plata (agregar y sacar)

**Agregar plata: 4 pasos** (Cuánto · De dónde salió · Quién envía · Listo). **Sacar plata: 3 pasos** (Cuánto · En qué · Listo). Indicador «Paso N de M · Etiqueta» con M segmentos. Rutas `/saldo/*` (agregar) y `/salida/*` (sacar). Mismo componente, textos `flujo.in.*` / `flujo.out.*`. Motivo, meta y quién envía vienen marcados de la última vez.

### Paso 1 · Cuánto · `/saldo/importe` · `Saldo.tsx` · 53, 07, 59, 06
- Barra: «✕» + título. «✕» con datos elegidos pide confirmar: «Si sales ahora, no cambia nada. ¿Quieres salir?».
- Pregunta → campo de monto grande (36 sp, prefijo «S/», teclado decimal; **al tocarlo se selecciona todo** para escribir encima; su etiqueta «Cuánto» solo la lee el lector de pantalla) → error si lo hay → S/ 5 · S/ 10 · S/ 20 → «Así quedaría S/ Y».
- Pie: «Continuar» (deshabilitado si el monto no es válido). Sin ayudas permanentes.

### Paso 2 · ¿De dónde salió? / ¿En qué la va a usar? · `/saldo/motivo`, `/salida/motivo` · 54, 60
- Barra «←» (conserva lo escrito).
- Motivos: grilla de 2 columnas, selección única con icono ✓ + borde + fondo. «Otra cosa» pide «Cuéntanos qué fue» (máx. 60).
- «¿Es para alguna meta?» / «¿Sale de alguna meta?»: **tarjetas a la vista** (no desplegable) con «Ninguna meta en especial» (sin subtítulo) + metas con «S/ X de S/ Y». En agregar no aparecen metas ya usadas; en sacar, solo metas con plata.
- Agregar: pie «Continuar». Sacar: «Así quedaría S/ X» + «Sí, sacar» en este mismo paso.

### Paso 3 (agregar) · ¿Quién le envía? · `/saldo/quien` · 55 · `quien.*`
- Lista de tarjetas con radio: Mamá, Papá, Abuela, Abuelo, Tío o tía, Otro pariente. La relación de quien acompaña lleva el subtítulo «Administra la cuenta». «Otro pariente» pide «¿Quién es?» (máx. 30, obligatorio).
- «Así quedaría S/ X» (lo elegido ya se vio en los pasos anteriores: no se repite en un resumen).
- Pie: «Sí, guardar». Un solo envío: «Un ratito…» y bloqueado.

### Último paso · ¡Listo! · `/saldo/listo`, `/salida/listo` · 56, 57
- Check grande con rebote, «¡Listo, ya se guardó!», «Ahora Sofía lleva ahorrado S/ X.» y, si se completó una meta, «¡Ya juntaron todo para «Meta»!».
- Agregar: «¿Y si Sofía mete la moneda? Que toque el chanchito.» → al tocar, la moneda cae y el chanchito salta («¡Clin! Adentro.»). Opcional.
- Si el motivo fue «Propina de la semana» y no hay recordatorio: «¿Te recordamos los {día} guardar su propina?» · «Sí, recuérdame» / «Ahora no».
- Pie: «Volver a Alcancía». **No** se puede volver atrás (reemplazar la pila).

### Corregir · `/movimiento/:id/editar` · `Lists.tsx` · 19
- Monto, motivo, quién envía (solo entradas) y meta en una pantalla. «Guardar cambios» valida que nada quede en negativo. Al guardar, aviso con «Deshacer».

## Aprender

### Aprender · `/aprender` · `Learn.tsx` · 02, 21 · `aprender.*`
- *Para empezar* (ninguna actividad empezada): tarjeta lavanda «PARA EMPEZAR · AHORRAR», «Fijar una meta de ahorro», mascota, «Ver de qué se trata» → «Otras formas de acompañar» (Biblioteca, Contar algo que pasó, Felicitar).
- *En curso*: tarjeta «EN CURSO · {TEMA}», título de la actividad activa, fila «Ahora: {paso actual}» (borde naranja), «Seguir con la actividad» → «Otras cosas que pueden hacer» (Anotar, Felicitar, Biblioteca).

### Biblioteca · `/biblioteca` · 22–24 · `biblioteca.*`
- Volver «Aprender». Título + subtítulo por formato. Segmentado de 3 (Cuentos · Misiones · Juegos) con píldora azul deslizante.
- Tarjeta destacada por formato (lavanda / menta / crema) con su botón. «Más para ver» con filtro «Todos los temas ▾» y lista.
- El tema filtrado **se conserva** al cambiar de formato. Sin resultados: «Todavía no hay {formato} de este tema.».

### Cuento · `/cuento/:id` · `Content.tsx` · 25, 50, 51 · `cuento.*`
- Barra «Aprender juntos». Ceja «GASTAR BIEN · PASO 1 DE 3» (el paso solo si viene de una actividad) → título → «Un cuento para escuchar juntos.» → tarjeta lavanda con el texto → «Escuchar en este celular» / «Escuchar en el chanchito» → barra de progreso + tiempos → controles −10 s · ▶/❚❚ · +10 s → «Después, conversen: {primera pregunta}».
- Pie: «Ver preguntas para conversar» + «Seguir otro día» (sale sin penalizar).
- **Sin audio automático.** Estados: detenido, cargando, reproduciendo, pausado, terminado, error. Sin archivo o sin chanchito: error recuperable (crema) y el texto sigue legible.

### Para conversar · `/guia/:id` · 26 · `guia.*`
- Preguntas (tarjetas lavanda) + «Unos consejos para ti» (3) + «Ya lo conversamos» (registra una conversación; luego queda «¡Listo!» deshabilitado). Ver la guía **no** completa nada.

### Misión · `/mision/:id` · 27 · `mision.*` · Juego · `/juego/:id` · 28 · `juego.*`
- Misión: tarjeta menta (ceja, título, resumen) → «Van a necesitar» → «Cómo se hace» con casillas (ayuda visual, no se guardan ni evalúan) → «Contar cómo les fue» (abre Anotar con el tema elegido).
- Juego: tarjeta crema → «Quién hace qué» → «Para conversar después» → «Ya lo conversamos».

### Actividad · `/actividad/:tema` · `Actividad.tsx` · 29, 30, 45 · `actividad.*`
- Tarjeta lavanda (estado + tema, título, mascota, descripción) → «Lo que van a hacer» → pasos numerados (actual en azul + «Toca ahora»; anteriores con ✓) → «Ya hicimos este paso» (secundario) → en el último paso, aviso con enlace «ver otro tema».
- Sin empezar: nota «Mirar esto no la empieza…» y pie «Empezar» (marca el tema como empezado y abre el paso 1). Empezada: pie «Seguir con la actividad» (abre el paso actual).

## Progreso

### Progreso · `/progreso` · `Momentos.tsx` · 31, 03 · `progreso.*`
- Contexto (solo el nombre) → tarjeta menta del momento destacado (ceja, título, relato, «Lo contó Mamá · ayer», «Ver más →») → resumen «3 cosas contadas · 3 conversaciones» + «Ver todo →» (no se muestra si todo está en 0) → «Lo que va descubriendo»: 4 temas en 2 columnas (orden fijo Ahorrar, Gastar bien, Compartir, Ganar; «Ya empezaron» en azul suave; los no empezados sin etiqueta) → «¿Qué pueden hacer ahora?» + título de la siguiente actividad + «Ver la actividad».
- *Sin momentos*: la tarjeta invita («Cuenten lo que vean» + «Contar algo que pasó»). Sin temas por empezar: texto + «Abrir Biblioteca».
- Con texto grande o pantalla de 320 dp: temas en 1 columna.

### Tema · `/tema/:tema` · 32 · `tema.*`
- Icono 48 dp + nombre + estado → «Lo que han contado» (tarjetas menta) → «Contar algo que pasó» → tarjeta de su actividad.

### Lo que pasó · `/momento/:id` · 33 · `momento.*` · Anotar · `/momento/nuevo` · 35 · `nuevoMomento.*`
- Detalle: tarjeta menta (tema, título, relato, autor y fecha) + «Es lo que vio alguien de la familia, no una nota.» + mensajitos recibidos + «Mandarle un mensajito».
- Anotar: «¿Qué pasó?» (obligatorio, máx. 280), «Título (opcional)» (máx. 40), «¿Quién lo vio?» (obligatorio, máx. 30, ejemplo «Mamá, papá, la abuela, el tío…»), «Tema (opcional)». Guarda con la fecha de hoy y abre el detalle.

### Felicitar · `/celebrar` · 36 · `felicitar.*` · Lo que entró y salió · `/avances` · 34 · `avances.*`
- Felicitar: 4 frases + «Escribir el mío» (selección única, máx. 100). Al guardar: icono con rebote «¡Mensajito guardado!». Es voluntario y no cambia ningún estado.
- Lo que entró y salió: «Cosas que pasaron», «Conversaciones», «Mensajitos», cada sección con su vacío.

## El chanchito y la cuenta

### El chanchito · `/chanchito` · `Chanchito.tsx` · 37, 52, 05 · `chanchito.*`
- Tarjeta crema de estado (mascota, «Sin conexión», instrucción, «Intentar otra vez») → «El chanchito» (Batería, Red WiFi, Volumen, Conectar este celular) → «Familia» (Perfil) → «Cerrar sesión» y versión.
- «Intentar otra vez»: «Conectando…» (botón «Un ratito…», mascota se balancea, un intento a la vez) → conectado **solo** si el dispositivo responde; si no, error recuperable.
- Los botones «Reiniciar la demo» / «Empezar desde cero» son **solo del prototipo**: no van en la app.

### Batería · WiFi · Volumen · Conectar este celular · Perfil · 38–42
- Muestran «lo último que sabemos» y avisan cuando no está al día. Sin conexión, cambiar WiFi o volumen está bloqueado. Un cambio solo se da por hecho cuando el chanchito lo confirma.
- Conectar este celular: 3 pasos + «Buscar chanchito» (pide permisos de Bluetooth / ubicación según la plataforma).
- Perfil: editar el nombre (obligatorio, máx. 30); se refleja en toda la app.

### Selector de persona · `/perfiles` · 46 · Cerrar sesión · `/sesion/*` · 47, 48
- Selector: la persona actual con ✓ + «Editar perfil». Cerrar sesión: confirmación «¿Cerrar sesión?» → conectar con el cierre de sesión real de la app (la pantalla 35 es solo del prototipo).

## Nuevas en la revisión por tipos de usuario

### Recordatorio de propina · `/chanchito/recordatorio` · 44 · `recordatorio.*`
- «¿Qué día le dan su propina?»: lunes a domingo + «Sin recordatorio». En la fila de ajustes: «Los viernes» o «Sin recordatorio».

### Editar momento · `/momento/:id/editar` · `Momentos.tsx`
- Mismo formulario que Anotar, con «Guardar cambios». En el detalle del momento: «Editar» y «Borrar» (borra también sus mensajitos; aviso con «Deshacer»).
- En Contar, «¿Quién lo vio?» viene con el nombre de quien usa el celular.

### Cuento · versión de 1 minuto y voz · 51
- Debajo del texto: «Cuento completo» / «Versión de 1 minuto» (cambia el texto) y «Leer en voz alta» (TTS del sistema) con «Con la voz de este celular.». Mientras habla, el botón dice «Detener».

### Actividad terminada · 45
- En el último paso: «Ya terminamos». Después: ceja «YA LA HICIERON · TEMA», tarjeta menta «¡Terminaron «Actividad»!» y «Ver «Siguiente»». Cada paso muestra «N min».

### El chanchito · conectado (semilla semana)
- Tarjeta menta «Conectado». Batería «52% · Ahora», WiFi «Conectado a…», volumen editable. Sin avisos de «lo último que sabemos».

### El chanchito · nunca conectado · 05
- Tarjeta «Conecten su chanchito» + «Conectar el chanchito» (→ Conectar este celular). Sin «Intentar otra vez» ni «Sin conexión».

## Menos texto (auditoría por carga visual)

Regla general (ver `03-diseno/sistema-de-diseno/documentacion/lenguaje.md`, principio 5): cada pantalla muestra título, datos y acciones. Se quitaron:

- **Subtítulos que repiten el título**: «Lo que Sofía va a meter a su chanchito», «Sofía va a guardar S/ 10.00», «Un cuento para escuchar juntos», «Escojan lo que quieran…», «Aprendan a ahorrar juntos…».
- **Ayudas permanentes al pie**: «Todavía no cambia nada», «Recién cambia cuando toques el botón», «Lo verás en Alcancía», «Se guarda con la fecha de hoy».
- **Frases para tranquilizar**: «No es tarea», «Es opcional», «No es una nota para nadie», «Sin notas ni comparar con nadie».
- **Resúmenes que repiten lo elegido**: antes de confirmar queda solo «Así quedaría S/ X».
- **Descripciones de filas obvias**: «Cuentos, misiones y juegos», «Su nombre», «Para manejar el chanchito desde aquí».
- **Secciones vacías**: sin movimientos no aparece «Lo último que entró y salió»; con todo en 0 no aparece el conteo de Progreso.
- **Reproductor sin audio**: los cuentos del celular se leen con «Leer en voz alta»; el reproductor queda solo para el cuento que suena en el chanchito.
- **Datos que no existen**: si el chanchito nunca se conectó, Batería, WiFi y Volumen no muestran valores; invitan a conectarlo.

Se mantienen: los errores junto al campo, las confirmaciones antes de borrar o salir, y lo que cambia lo que la persona decide.
