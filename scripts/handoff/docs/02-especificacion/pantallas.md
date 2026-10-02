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

### Alcancía (inicio) · `/` · `Home.tsx` · capturas 01, 08, 09, 13, 58 · `alcancia.*`
- **Contenido**: encabezado → contexto → tarjeta de saldo (mascota 64 dp, «LLEVA AHORRADO», monto 36 sp) → acciones → «Sus metas» (máx. 2, orden estable) → «Lo último que anotaron» (máx. 2).
- **Acciones**: «Agregar plata» → Agregar plata · «Sacar plata» → Sacar plata · «Ver todas (N)» → Sus metas · tarjeta de meta → Detalle de meta · «Ver todos» → Todo lo anotado · fila → Detalle.
- **Estados**:
  - *Primer día* (saldo 0, sin metas ni movimientos): línea «Aquí anotan la plata que {nombre} mete o saca…»; un solo botón «Anotar su primera plata»; tarjeta crema «¿Para qué quiere ahorrar {nombre}?» con «Poner su primera meta»; vacío de movimientos con icono. **No** mostrar «Sacar plata».
  - *Con datos*: dos botones lado a lado («Sacar plata» solo si hay saldo).
  - *Saldo*: bajo el monto, «Esta semana: +S/ X» si entró plata en 7 días.
  - *Borrador*: aviso crema «Dejaron a medias: S/ X» con «Descartar» y «Seguir».
  - *Día de la propina* (sin anotarla aún): aviso «Hoy es {día}, día de su propina. ¿Ya la anotaron?» con «Anotar su propina».
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

### Todo lo anotado / Detalle · `/movimientos`, `/movimiento/:id` · `Lists.tsx` · 16, 17, 18 · `movimientos.*`
- Agrupado por mes («octubre», con «Entró S/ X · Salió S/ Y»), más reciente primero. Fila: icono ↑ verde (entró) o ↓ crema (salió), «Guardó plata / Sacó plata», «Abuela · hoy · Por su cumple» (en entradas, **quién envió**; en salidas, quién anotó), monto con signo **+ / −**.
- Detalle: «Entró/Salió» + monto, **Le envió** (entradas), Por qué, Meta, Cuándo, Lo anotó → «Corregir» y «Borrar» (confirma; si dejaría plata en negativo, avisa y no borra; aviso con «Deshacer»).

## Flujo de plata (agregar y sacar)

**Agregar plata: 4 pasos** (Cuánto · De dónde salió · Quién envía · Listo). **Sacar plata: 3 pasos** (Cuánto · En qué · Listo). Indicador «Paso N de M · Etiqueta» con M segmentos. Rutas `/saldo/*` (agregar) y `/salida/*` (sacar). Mismo componente, textos `flujo.in.*` / `flujo.out.*`. Motivo, meta y quién envía vienen marcados de la última vez.

### Paso 1 · Cuánto · `/saldo/importe` · `Saldo.tsx` · 53, 07, 59, 06
- Barra: «✕» + título. «✕» con datos elegidos pide confirmar: «Si sales ahora, no se anotará nada. ¿Quieres salir?».
- Pregunta → caja «Ahora tiene ahorrado S/ X» → campo de monto grande (36 sp, prefijo «S/», teclado decimal; **al tocarlo se selecciona todo** para escribir encima) → ayuda o error → «O escoge uno rápido» (S/ 5 · S/ 10 · S/ 20) → «Así quedaría S/ Y».
- Pie: «Continuar» (deshabilitado si el monto no es válido) + «Todavía no se anota nada.»

### Paso 2 · ¿De dónde salió? / ¿En qué la va a usar? · `/saldo/motivo`, `/salida/motivo` · 54, 60
- Barra «←» (conserva lo escrito). Resumen «Sofía va a guardar S/ 10.00.».
- Motivos: grilla de 2 columnas, selección única con icono ✓ + borde + fondo. «Otra cosa» pide «Cuéntanos qué fue» (máx. 60).
- «¿Es para alguna meta?» / «¿Sale de alguna meta?»: **tarjetas a la vista** (no desplegable) con «Ninguna meta en especial» + metas con «S/ X de S/ Y». En agregar no aparecen metas ya usadas; en sacar, solo metas con plata.
- Agregar: pie «Continuar». Sacar: «Resumen» + «Sí, anotar» en este mismo paso.

### Paso 3 (agregar) · ¿Quién le envía? · `/saldo/quien` · 55 · `quien.*`
- Texto: «Abuelos y tíos también pueden mandarle plata. Cuando el chanchito está conectado, dice su nombre en voz alta.»
- Lista de tarjetas con radio: Mamá, Papá, Abuela, Abuelo, Tío o tía, Otro pariente. La relación de quien acompaña lleva el subtítulo «Administra la cuenta». «Otro pariente» pide «¿Quién es?» (máx. 30, obligatorio).
- «Resumen»: Cuánto · Por qué · Quién envía · Meta · **Así quedaría**.
- Pie: «Sí, anotar» + «Recién se anota cuando toques el botón.». Un solo envío: «Un ratito…» y bloqueado.

### Último paso · ¡Listo! · `/saldo/listo`, `/salida/listo` · 56, 57
- Check grande con rebote, «¡Listo, ya está anotado!», «Ahora Sofía lleva ahorrado S/ X.» y, si se completó una meta, «¡Ya juntaron todo para «Meta»!».
- Agregar: «¿Y si Sofía mete la moneda? Que toque el chanchito.» → al tocar, la moneda cae y el chanchito salta («¡Clin! Adentro.»). Opcional.
- Si el motivo fue «Su propina de la semana» y no hay recordatorio: «¿Te recordamos los {día} anotar su propina?» · «Sí, recuérdame» / «Ahora no».
- Pie: «Volver a Alcancía». **No** se puede volver atrás (reemplazar la pila).

### Corregir lo anotado · `/movimiento/:id/editar` · `Lists.tsx` · 19
- Monto, motivo, quién envía (solo entradas) y meta en una pantalla. «Guardar cambios» valida que nada quede en negativo. Al guardar, aviso con «Deshacer».

## Aprender

### Aprender · `/aprender` · `Learn.tsx` · 02, 21 · `aprender.*`
- *Para empezar* (ninguna actividad empezada): «Aprendan a ahorrar juntos» + texto → tarjeta lavanda «PARA EMPEZAR · AHORRAR», «Fijar una meta de ahorro», mascota, «Ver de qué se trata» → «Otras formas de acompañar» (Biblioteca, Anotar algo que pasó, Felicitar).
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
- Preguntas (tarjetas lavanda) + «Unos consejos para ti» (3) + «Ya lo conversamos» (registra una conversación; luego queda «¡Anotado!» deshabilitado). Ver la guía **no** completa nada.

### Misión · `/mision/:id` · 27 · `mision.*` · Juego · `/juego/:id` · 28 · `juego.*`
- Misión: tarjeta menta (ceja, título, resumen) → «Van a necesitar» → «Cómo se hace» con casillas (ayuda visual, no se guardan ni evalúan) → «Anotar cómo les fue» (abre Anotar con el tema elegido).
- Juego: tarjeta crema → «Quién hace qué» → «Para conversar después» → «Ya lo conversamos».

### Actividad · `/actividad/:tema` · `Actividad.tsx` · 29, 30, 45 · `actividad.*`
- Tarjeta lavanda (estado + tema, título, mascota, descripción) → «Lo que van a hacer» → pasos numerados (actual en azul + «Toca ahora»; anteriores con ✓) → «Ya hicimos este paso» (secundario) → en el último paso, aviso con enlace «ver otro tema».
- Sin empezar: nota «Mirar esto no la empieza…» y pie «Empezar» (marca el tema como empezado y abre el paso 1). Empezada: pie «Seguir con la actividad» (abre el paso actual).

## Progreso

### Progreso · `/progreso` · `Momentos.tsx` · 31, 03 · `progreso.*`
- Contexto con «Sin notas ni comparar con nadie» → tarjeta menta del momento destacado (ceja, título, relato, «Lo contó Mamá · ayer», «Ver más →») → resumen «3 cosas anotadas · 3 conversaciones» + «Ver todo →» → «Lo que va descubriendo»: 4 temas en 2 columnas (orden fijo Ahorrar, Gastar bien, Compartir, Ganar; «Ya empezaron» en azul suave o «Todavía no empiezan») → «¿Qué pueden hacer ahora?» + siguiente actividad sugerida + «Ver la actividad».
- *Sin momentos*: la tarjeta invita («Cuenten lo que vean» + «Anotar algo que pasó»). Sin temas por empezar: texto + «Abrir Biblioteca».
- Con texto grande o pantalla de 320 dp: temas en 1 columna.

### Tema · `/tema/:tema` · 32 · `tema.*`
- Icono 48 dp + nombre + estado → «Lo que han anotado» (tarjetas menta) → «Anotar algo que pasó» → tarjeta de su actividad.

### Lo que pasó · `/momento/:id` · 33 · `momento.*` · Anotar · `/momento/nuevo` · 35 · `nuevoMomento.*`
- Detalle: tarjeta menta (tema, título, relato, autor y fecha) + «Es lo que vio alguien de la familia, no una nota.» + mensajitos recibidos + «Mandarle un mensajito».
- Anotar: «¿Qué pasó?» (obligatorio, máx. 280), «Título (opcional)» (máx. 40), «¿Quién lo vio?» (obligatorio, máx. 30, ejemplo «Mamá, papá, la abuela, el tío…»), «Tema (opcional)». Guarda con la fecha de hoy y abre el detalle.

### Felicitar · `/celebrar` · 36 · `felicitar.*` · Todo lo anotado · `/avances` · 34 · `avances.*`
- Felicitar: 4 frases + «Escribir el mío» (selección única, máx. 100). Al guardar: icono con rebote «¡Mensajito guardado!». Es voluntario y no cambia ningún estado.
- Todo lo anotado: «Cosas que pasaron», «Conversaciones», «Mensajitos», cada sección con su vacío.

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

### Quién acompaña · `/chanchito/acompana` · `Chanchito.tsx` · 43 · `acompana.*`
- «¿Quién acompaña a {nombre}?», campo «Tu nombre», relación (Mamá, Papá, Abuela, Abuelo, Tío o tía). Se usa para firmar, para «¿Quién lo vio?» y para «Administra la cuenta».

### Recordatorio de propina · `/chanchito/recordatorio` · 44 · `recordatorio.*`
- «¿Qué día le dan su propina?»: lunes a domingo + «Sin recordatorio». En la fila de ajustes: «Los viernes» o «Sin recordatorio».

### Editar momento · `/momento/:id/editar` · `Momentos.tsx`
- Mismo formulario que Anotar, con «Guardar cambios». En el detalle del momento: «Editar» y «Borrar» (borra también sus mensajitos; aviso con «Deshacer»).
- En Anotar, «¿Quién lo vio?» viene con el nombre de quien acompaña.

### Cuento · versión de 1 minuto y voz · 51
- Debajo del texto: «Cuento completo» / «Versión de 1 minuto» (cambia el texto) y «Leer en voz alta» (TTS del sistema) con «Con la voz de este celular.». Mientras habla, el botón dice «Detener».

### Actividad terminada · 45
- En el último paso: «Ya terminamos». Después: ceja «YA LA HICIERON · TEMA», tarjeta menta «¡Terminaron «Actividad»!» y «Ver «Siguiente»». Cada paso muestra «N min».

### El chanchito · conectado (semilla semana)
- Tarjeta menta «Conectado» + «Todo bien: está prendido y conectado al WiFi de la casa.». Batería «52% · Ahora», WiFi «Conectado a…», volumen editable. Sin avisos de «lo último que sabemos».

### El chanchito · nunca conectado · 05
- Tarjeta «Conecten su chanchito» + «Mientras tanto, pueden anotar la plata aquí…» + «Conectar el chanchito» (→ Conectar este celular). Sin «Intentar otra vez» ni «Sin conexión».
