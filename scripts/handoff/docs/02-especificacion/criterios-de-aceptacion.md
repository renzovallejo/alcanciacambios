# Criterios de aceptación

Formato **Dado / Cuando / Entonces**. Salen del comportamiento del prototipo: la mayoría están cubiertos por sus 64 comprobaciones automáticas de punta a punta, y todos se pueden ver en el prototipo publicado. Los datos de partida son las semillas de `06-datos/semillas/`: **ejemplo** (S/ 15.00, metas Libro ilustrado S/ 6 de S/ 30 y Rompecabezas S/ 4 de S/ 40) y **semana**.

## A. Agregar plata

- **A1.** Dado *ejemplo*, cuando toco «Agregar plata», elijo «Su propina de la semana», escojo la meta «Libro ilustrado» y confirmo con S/ 10, entonces veo «¡Listo, ya está anotado!», el saldo pasa a S/ 25.00 y la meta muestra «S/ 16.00 de S/ 30.00».
- **A2.** Dado el paso 1, cuando escribo «abc», entonces veo «Escribe un monto como 10 o 10.50.» junto al campo y «Continuar» está deshabilitado.
- **A3.** Dado el paso 1, cuando toco «S/ 20», entonces el campo muestra 20.00, el botón tiene ✓ y «Así quedaría» muestra saldo + 20.
- **A4.** Dado el paso 2 con «Otra cosa» elegida y sin texto, entonces «Continuar» está deshabilitado.
- **A5.** Dado el paso 2, cuando vuelvo al paso 1, entonces el monto escrito sigue ahí.
- **A6.** Dado el paso 1 con un motivo ya elegido, cuando toco «✕», entonces me pregunta «Si sales ahora, no se anotará nada. ¿Quieres salir?».
- **A7.** Dado el paso 3, cuando toco «Sí, anotar» dos veces seguidas, entonces se anota **una sola vez**.
- **A8.** Dado que el saldo no cambió antes del paso 3, cuando estoy en los pasos 1 o 2, entonces el saldo de Alcancía sigue igual.
- **A9.** Dado *semana* (Pelota de fútbol S/ 10 de S/ 20), cuando agrego S/ 10 a esa meta, entonces el paso 4 muestra «¡Ya juntaron todo para «Pelota de fútbol»!» y en Alcancía la tarjeta dice «¡Logrado!».
- **A10.** Dado que acabo de anotar, cuando vuelvo a Alcancía, entonces el movimiento nuevo aparece primero y resaltado y el saldo cuenta hasta el valor nuevo.

## B. Sacar plata

- **B1.** Dado *ejemplo* (S/ 15.00), cuando toco «Sacar plata» y escribo 99, entonces veo «No le alcanza: ahora tiene S/ 15.00.».
- **B2.** Dado *ejemplo*, cuando saco S/ 5 por «Se compró algo», entonces el paso 3 dice «Así quedaría S/ 10.00» y, al confirmar, Alcancía muestra «Sacó plata» con «−S/ 5.00».
- **B3.** Dado un movimiento de salida, cuando lo abro, entonces veo «Salió», el monto, quién lo anotó, cuándo, «Se compró algo» y la meta.
- **B4.** Dado el primer día (saldo 0), entonces no se muestra «Sacar plata».

## C. Metas

- **C1.** Dado *ejemplo*, cuando toco «Libro ilustrado», entonces veo «Va 20% · Le faltan S/ 24.00» y la plata guardada para esa meta.
- **C2.** Dado el detalle de una meta, cuando toco «Agregar plata a esta meta», entonces el paso 2 ya tiene esa meta elegida.
- **C3.** Dado el primer día, cuando pongo la meta «Muñeca» de S/ 20, entonces aparece en Alcancía.
- **C4.** Dado que llegué a «Poner meta» desde la actividad «Fijar una meta de ahorro», cuando guardo, entonces vuelvo a la actividad.

## D. Aprender, Biblioteca y contenido

- **D1.** Dado el primer día, entonces Aprender muestra «PARA EMPEZAR · AHORRAR» y «Ver de qué se trata».
- **D2.** Dado una actividad sin empezar, cuando la abro, entonces sigue sin empezar (no aparece «Seguir con la actividad») y Progreso no cambia.
- **D3.** Dado la actividad de Gastar bien, cuando toco «Empezar», entonces abre el cuento con «PASO 1 DE 3», el tema pasa a «Ya empezaron» y Aprender muestra «EN CURSO».
- **D4.** Dado la Biblioteca, cuando abro cada cuento, misión y juego, entonces muestran su contenido (texto del cuento, «Cómo se hace», «Quién hace qué»).
- **D5.** Dado la Biblioteca con un tema filtrado, cuando cambio de formato, entonces el filtro se conserva.
- **D6.** Dado un cuento sin audio, cuando toco ▶, entonces veo «El audio todavía no está listo. Pero pueden leer el cuento juntos.» y el texto sigue visible.
- **D7.** Dado «Cómo nació tu alcancía» (se escucha en el chanchito) y sin conexión, cuando toco ▶, entonces veo «El chanchito no está conectado…».
- **D8.** Dado «Para conversar», cuando toco «Ya lo conversamos», entonces cambia a «¡Anotado!» y Progreso suma una conversación.

## E. Progreso, momentos y felicitar

- **E1.** Dado el primer día, entonces Progreso muestra «TODAVÍA NO HAN ANOTADO NADA» y «0 cosas anotadas · 0 conversaciones».
- **E2.** Dado «Anotar algo que pasó» vacío, cuando toco «Guardar», entonces veo «Cuéntanos qué pasó.».
- **E3.** Dado que anoto «Contó sus monedas» visto por «Papá», cuando guardo, entonces se abre el detalle y Progreso lo muestra como momento destacado.
- **E4.** Dado que entro a anotar desde un tema, entonces ese tema viene elegido.
- **E5.** Dado el detalle de un momento, cuando mando «¡Qué orgullo, lo hiciste muy bien!», entonces veo «¡Mensajito guardado!» y el mensaje aparece en el detalle.
- **E6.** Dado «Ver todo», entonces veo las secciones «Cosas que pasaron», «Conversaciones» y «Mensajitos».

## F. Chanchito y cuenta

- **F1.** Dado cualquier pantalla principal, entonces el estado del chanchito es el mismo que en sus ajustes («Sin conexión»).
- **F2.** Dado ajustes, cuando abro Batería, Red WiFi, Volumen, Conectar este celular y Perfil, entonces cada uno abre su pantalla.
- **F3.** Dado Perfil, cuando cambio el nombre a «Lucía», entonces toda la app dice «Lucía».
- **F4.** Dado «Intentar otra vez», cuando lo toco varias veces, entonces hay un solo intento en curso y, sin respuesta, termina en error recuperable (nunca «Conectado»).
- **F5.** Dado «Cerrar sesión», entonces primero pide confirmar.
- **F6.** Dado el nombre del niño arriba, cuando lo toco, entonces abre el selector de persona.

## G. Generales

- **G1.** Al cambiar de pantalla, la nueva empieza arriba y el lector de pantalla anuncia su título.
- **G2.** Ningún texto de la app está fuera de `strings.xml` / `Localizable.strings`.
- **G3.** Las 20 entradas de `06-datos/casos-de-prueba/dinero.json` dan el mismo resultado en Android, iOS y web.
- **G4.** Con «reducir movimiento» activado, no hay animaciones.
- **G5.** A 320 dp y con texto al 200 %, nada se corta ni se superpone.
