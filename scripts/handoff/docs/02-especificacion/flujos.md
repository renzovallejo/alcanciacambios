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
  A --> L[Todo lo anotado] --> LD[Detalle]
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
  A & B & C --> PS[Selector de persona] --> PE
```

`[ ]` = pantalla con barra inferior · `([ ])` = tarea enfocada, sin barra inferior.

## Agregar plata / Sacar plata

```mermaid
stateDiagram-v2
  [*] --> Cuanto: Agregar plata / Sacar plata / Agregar a esta meta
  Cuanto --> Cuanto: monto inválido (error junto al campo, Continuar deshabilitado)
  Cuanto --> DeDonde: Continuar (monto válido)
  Cuanto --> [*]: ✕ (confirma si ya eligió algo)
  DeDonde --> Cuanto: ← (conserva el borrador)
  DeDonde --> Revisar: Continuar (opción elegida; «Otra cosa» con texto)
  Revisar --> DeDonde: ←
  Revisar --> Listo: Sí, anotar (un solo envío)
  Listo --> [*]: Volver a Alcancía (sin poder volver atrás)
```

- El **saldo cambia solo al confirmar** en «¿Todo bien?». Antes, «Así quedaría» es una proyección.
- Sacar plata valida en el paso 1 y vuelve a validar en el 2/3: no más que lo ahorrado ni más que lo que tiene la meta de origen («No le alcanza…», «Para «Meta» solo tiene…»).
- Si la persona vuelve al paso 1 con un monto que ya no es válido, los pasos 2 y 3 regresan solos al paso 1.

## Actividad

```mermaid
stateDiagram-v2
  [*] --> SinEmpezar
  SinEmpezar --> SinEmpezar: abrir detalle / abrir un paso (no cambia nada)
  SinEmpezar --> Empezada: Empezar → abre el paso 1
  Empezada --> Empezada: Ya hicimos este paso (avanza el paso actual)
  Empezada --> UltimoPaso: llega al último paso
  UltimoPaso --> UltimoPaso: puede repetir cualquier paso
```

- Empezar marca el tema como «Ya empezaron» y lo deja como actividad «EN CURSO» en Aprender.
- No hay «terminada» ni puntaje: el último paso solo invita a ver otro tema.

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
  [*] --> SinConexion
  SinConexion --> Conectando: Intentar otra vez
  Conectando --> Conectando: (ignora toques repetidos)
  Conectando --> Conectado: el dispositivo responde
  Conectando --> Error: no responde / tiempo agotado
  Error --> Conectando: Intentar otra vez
```

- Nunca anunciar «Conectado» sin respuesta del dispositivo. Batería, WiFi y volumen muestran el último dato conocido y lo dicen.
- Un ajuste (WiFi, volumen) queda «pendiente» hasta que el chanchito confirme.
