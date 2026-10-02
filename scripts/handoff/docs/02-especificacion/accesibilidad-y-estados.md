# Accesibilidad y estados

## Accesibilidad (mínimos para aprobar)

| Tema | Regla |
|---|---|
| Objetivo táctil | ≥ 44 × 44 dp en todo lo tocable (incluye «Ver más →», chevrons, iconos sueltos). Botones de 48 dp. |
| Contraste | Texto normal ≥ 4.5:1; texto grande e indicadores ≥ 3:1. Blanco sobre azul o violeta; texto oscuro sobre naranja; **nunca** blanco sobre naranja. |
| Estado sin color | Selección = ✓ / radio + borde + texto, no solo color. Montos con signo + / − además del color. |
| Lector de pantalla | Cada pantalla anuncia su título al abrir (el prototipo mueve el foco al `h1`). Iconos solos con nombre: ⚙️ «Ajustes del chanchito», ✕ «Cerrar», ← «Volver», ▶ «Reproducir» / «Pausar», «Retroceder / Adelantar 10 segundos». |
| Grupos | Motivos y frases de felicitar = grupo de radio (`selectableGroup` / `accessibilityElement(children: .contain)` con rasgo seleccionado). Formatos de Biblioteca = pestañas. |
| Contexto | El nombre de la persona se anuncia como «Estás viendo a Sofía. Cambiar». El estado del chanchito como «Chanchito: sin conexión. Ver ajustes». |
| Saldo animado | El lector recibe el valor final de inmediato (no los números intermedios del conteo). |
| Errores | El mensaje se anuncia al aparecer (`liveRegion` / `accessibilityNotification`) y queda junto al campo. |
| Barras de avance | Rol barra de progreso con valor («Avance de Libro: 40 %»). |
| Texto grande | Hasta 200 % sin cortes ni superposiciones. Ver `plataformas.md`. |
| Movimiento | Respetar «reducir movimiento». Ver `animaciones.md`. |

## Estados que no se deben confundir

| Estado | Cómo se ve | No confundir con |
|---|---|---|
| **Cero** (primer día) | «S/ 0.00» + «Anotar su primera plata» | Cargando o error: **no** mostrar S/ 0.00 si todavía no se sabe el saldo |
| **Vacío** | Icono + «Todavía no…» + qué aparecerá ahí | Error. Nunca filas de ejemplo ni gráficos vacíos |
| **Cargando** (cuando haya backend) | Esqueleto o indicador; sin números | Cero |
| **Error de datos** (cuando haya backend) | Rosa + causa + «Intentar otra vez»; conservar lo escrito | Vacío |
| **Sin conexión con el chanchito** | Crema + «Sin conexión» + instrucción | Saldo perdido o batería agotada: el saldo sigue disponible |
| **Dato viejo** | «lo último que sabemos»; fecha solo si existe | Dato en vivo |
| **Monto inválido** | Campo rosa + mensaje debajo + «Continuar» deshabilitado | Error del sistema |
| **Enviando** | Botón «Un ratito…», mismo tamaño, sin doble toque | Éxito: solo mostrar «¡Listo!» con la confirmación real |
| **Actividad abierta pero no empezada** | «PARA EMPEZAR» + «Empezar» | Empezada |
| **Sin momentos** | Invitación a anotar | Temas sin empezar: un tema puede estar empezado sin momentos |

## Matriz de pruebas mínima

| Área | Probar |
|---|---|
| Dinero | Vacío, 0, negativo, letras, 3 decimales, coma y punto, S/ 1,000.01, monto válido, doble toque en «Sí, anotar», sacar más de lo ahorrado, sacar más de lo de la meta |
| Flujo | Volver del paso 2 al 1 conserva todo; «✕» con cambios pide confirmar; «Otra cosa» sin texto no deja continuar; motivo largo crece en alto; sin metas solo muestra «Ninguna meta en especial» |
| Metas | Completar una meta (aviso + «¡Logrado!»); meta lograda sin botón de agregar; más de 2 metas en Alcancía |
| Actividades | Abrir sin empezar no cambia Progreso; «Empezar» sí; avanzar hasta el último paso |
| Progreso | Sin momentos; momento de hace más de 7 días; plural 1 / varios |
| Chanchito | Reintento (un intento a la vez); datos viejos; permisos negados |
| Tamaños | 320 / 360 / 402 / 430 dp; texto 200 %; teclado abierto |

Los estados `vacio` y `semana` de `06-datos/semillas/` sirven para preparar cada caso.
