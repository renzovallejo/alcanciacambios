# Flujos

Los diagramas usan Mermaid (GitHub, GitLab, Notion y VS Code los muestran como gráfico).

## Mapa de navegación

```mermaid
flowchart LR
  subgraph Pestañas
    A[Alcancía] --- B[Aprender] --- C[Progreso]
  end
  A --> M[Sus metas] --> MD[Detalle de meta]
  A --> MD
  A --> L[Todo lo anotado] --> LD[Detalle] --> LE([Corregir])
  MD --> ME([Editar meta])
  MD -->|Usar esta plata| F2
  A --> F1([Agregar plata])
  A --> F2([Sacar plata])
  MD --> F1
  A & M --> NM([Poner meta])
  B --> BI[Biblioteca] --> CU([Cuento]) & MI([Misión]) & JU([Juego])
  B --> AC([Actividad]) --> CU & MI & JU & NM
  CU --> GU([Para conversar])
  B & C --> AN([Anotar algo que pasó]) --> MO([Lo que pasó]) --> FE([Felicitar])
  B --> FE
  C --> TE[Tema] --> AC
  C --> AV[Todo lo anotado · Progreso]
  C --> AC
  A & B & C --> CH([El chanchito]) --> BA([Batería]) & WI([WiFi]) & VO([Volumen]) & EM([Conectar celular]) & PE([Perfil]) & SE([Cerrar sesión])
  CH --> QA([Quién acompaña]) & RE([Recordatorio de propina])
  MO --> NE([Editar momento])
  A & B & C --> PS[Selector de persona] --> PE
```

`[ ]` = pantalla con barra inferior · `([ ])` = tarea enfocada, sin barra inferior.

## Agregar plata / Sacar plata

**Agregar plata (4 pasos):** Cuánto → ¿De dónde salió? (motivo + meta) → **¿Quién le envía?** (+ resumen y «Sí, anotar») → ¡Listo!
**Sacar plata (3 pasos):** Cuánto → ¿En qué la va a usar? (motivo + meta de origen + resumen y «Sí, anotar») → ¡Listo!

```mermaid
stateDiagram-v2
  [*] --> Cuanto: Agregar plata / Sacar plata / Agregar a esta meta / Usar esta plata
  Cuanto --> Cuanto: monto inválido (error junto al campo, Continuar deshabilitado)
  Cuanto --> DeDonde: Continuar (monto válido)
  Cuanto --> [*]: ✕ (confirma si ya eligió algo)
  DeDonde --> Cuanto: ← (conserva el borrador)
  DeDonde --> Quien: Continuar · solo agregar
  DeDonde --> Listo: Sí, anotar · solo sacar
  Quien --> DeDonde: ←
  Quien --> Listo: Sí, anotar (un solo envío; «Otro pariente» exige nombre)
  Listo --> [*]: Volver a Alcancía (sin poder volver atrás)
```

- **Lo que se recuerda:** al empezar, motivo, meta (si sigue disponible) y quién envía vienen de la última vez (`last`). Sin historial, «quién envía» es la relación de quien acompaña. Todo se puede cambiar.
- **Borrador:** si salen sin anotar, el borrador queda `active` y Alcancía muestra «Dejaron a medias: S/ X · Seguir / Descartar». Volver a abrir el mismo flujo lo retoma en vez de reiniciarlo.
- El **saldo cambia solo al confirmar**. Antes, «Así quedaría» es una proyección.
- Sacar plata no permite más que lo ahorrado ni más que lo que tiene la meta de origen («No le alcanza…», «Para «Meta» solo tiene…»).
- Si la persona vuelve al paso 1 con un monto que ya no es válido, los pasos siguientes regresan solos al paso 1.
- **¡Listo!** (agregar): moneda opcional para que el niño la «meta» al chanchito; si el motivo fue «Su propina de la semana» y no hay recordatorio, ofrece «¿Te recordamos los {día}…?».

## Corregir y borrar

```mermaid
flowchart LR
  D[Detalle de movimiento] -->|Corregir| E([Monto, motivo, quién envía, meta])
  E -->|Guardar cambios| V{¿Queda algo en negativo?}
  V -->|No| OK[Guardado + Deshacer 6 s]
  V -->|Sí| AV[Aviso, no se guarda]
  D -->|Borrar| V2{¿Queda algo en negativo?}
  V2 -->|No| C{Confirmar} --> B[Borrado + Deshacer 6 s]
  V2 -->|Sí| AV2[«No se puede borrar…»]
```

- Igual para metas (borrar no borra plata: los movimientos quedan sin meta y conservan su nombre) y momentos (borrar quita también sus mensajitos).
- «Deshacer» restaura el estado completo de antes.

## Actividad

```mermaid
stateDiagram-v2
  [*] --> SinEmpezar
  SinEmpezar --> SinEmpezar: abrir detalle / abrir un paso (no cambia nada)
  SinEmpezar --> Empezada: Empezar → abre el paso 1
  Empezada --> Empezada: Ya hicimos este paso (avanza el paso actual)
  Empezada --> UltimoPaso: llega al último paso
  UltimoPaso --> UltimoPaso: puede repetir cualquier paso
  UltimoPaso --> Terminada: Ya terminamos
  Terminada --> [*]: sugiere la siguiente que no hayan terminado
```

- Empezar marca el tema como «Ya empezaron» y lo deja como actividad «EN CURSO» en Aprender.
- «Ya terminamos» la saca de «en curso», la agrega a `finishedTopics` y celebra **sin puntaje**. Aprender propone la siguiente.
- Cada paso muestra su duración aproximada («5 min»).

## Anotar y felicitar

```mermaid
flowchart LR
  X[Aprender / Tema / Misión / Progreso vacío] --> N([Anotar algo que pasó])
  N -->|Guardar| D([Lo que pasó])
  D -->|Mandarle un mensajito| F([Felicitar])
  F -->|Guardar| OK[¡Mensajito guardado!] -->|Volver| D
  G([Para conversar / Juego]) -->|Ya lo conversamos| C[+1 conversación]
```

## Chanchito

```mermaid
stateDiagram-v2
  [*] --> NuncaConectado: devicePaired = false
  NuncaConectado --> Conectando: Conectar el chanchito
  [*] --> SinConexion: devicePaired = true
  SinConexion --> Conectando: Intentar otra vez
  Conectando --> Conectando: (ignora toques repetidos)
  Conectando --> Conectado: el dispositivo responde
  Conectando --> Error: no responde / tiempo agotado
  Error --> Conectando: Intentar otra vez
```

- **Nunca conectado** (cuenta nueva): no se dice «Sin conexión»; se invita a «Conectar chanchito». No es un error.
- Nunca anunciar «Conectado» sin respuesta del dispositivo. Batería, WiFi y volumen muestran el último dato conocido y lo dicen.
- Un ajuste (WiFi, volumen) queda «pendiente» hasta que el chanchito confirme.
