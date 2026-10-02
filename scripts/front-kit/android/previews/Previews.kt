package pe.alcancia.ui.previews

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import pe.alcancia.ui.ejemplos.Ejemplos
import pe.alcancia.ui.modelo.Flujo
import pe.alcancia.ui.pantallas.*
import pe.alcancia.ui.tema.AlcanciaTheme

/*
 * Previews de Android Studio con los datos reales del prototipo (Ejemplos.kt).
 * Cambia un componente y mira el resultado aquí sin correr la app.
 * Fuente grande: agrega fontScale = 2f a @Preview para revisar texto al 200 %.
 */
private const val ANCHO = 402

@Preview(name = "Alcancía · semana", widthDp = ANCHO, heightDp = 1500, showBackground = true)
@Composable fun PrevAlcancia() = AlcanciaTheme { AlcanciaPantalla(Ejemplos.semana) }

@Preview(name = "Alcancía · primer día", widthDp = ANCHO, heightDp = 1100, showBackground = true)
@Composable fun PrevPrimerDia() = AlcanciaTheme { AlcanciaPantalla(Ejemplos.primerDia) }

@Preview(name = "Alcancía · borrador", widthDp = ANCHO, heightDp = 900, showBackground = true)
@Composable fun PrevBorrador() = AlcanciaTheme { AlcanciaPantalla(Ejemplos.semana.copy(borrador = 700)) }

@Preview(name = "Alcancía · día de propina", widthDp = ANCHO, heightDp = 900, showBackground = true)
@Composable fun PrevPropina() = AlcanciaTheme { AlcanciaPantalla(Ejemplos.semana.copy(diaPropina = "viernes")) }

@Preview(name = "Agregar 1 · Cuánto", widthDp = ANCHO, heightDp = 874, showBackground = true)
@Composable fun PrevCuanto() = AlcanciaTheme { CuantoPantalla(Flujo.Entrada, "Sofía", 2500, "10.00", {}, {}, {}) }

@Preview(name = "Agregar 2 · De dónde", widthDp = ANCHO, heightDp = 1100, showBackground = true)
@Composable fun PrevMotivo() = AlcanciaTheme { MotivoPantalla(Flujo.Entrada, "Sofía", 1000, 2500, "mesada", "", {}, {}, Ejemplos.semana.metas, "g2", {}, {}, {}) }

@Preview(name = "Agregar 3 · Quién envía", widthDp = ANCHO, heightDp = 1250, showBackground = true)
@Composable fun PrevQuien() = AlcanciaTheme { QuienPantalla(1000, 2500, "Su propina de la semana", "Pelota de fútbol", "mama", "", {}, {}, {}, {}, relacionAdmin = "mama") }

@Preview(name = "Agregar 4 · Listo", widthDp = ANCHO, heightDp = 1100, showBackground = true)
@Composable fun PrevListo() = AlcanciaTheme { ListoPantalla(Flujo.Entrada, "Sofía", 3500, {}, metaLograda = "Pelota de fútbol", diaRecordatorio = "viernes") }

@Preview(name = "Sacar 2 · En qué", widthDp = ANCHO, heightDp = 1150, showBackground = true)
@Composable fun PrevSacar() = AlcanciaTheme { MotivoPantalla(Flujo.Salida, "Sofía", 500, 2500, "compra", "", {}, {}, Ejemplos.semana.metas, null, {}, {}, {}) }

@Preview(name = "Lo que entró y salió", widthDp = ANCHO, heightDp = 1300, showBackground = true)
@Composable fun PrevMovimientos() = AlcanciaTheme { MovimientosPantalla(Ejemplos.meses, {}, {}) }

/** Interactiva: en Android Studio usa «Start Interactive Mode» para recorrer el flujo entero. */
@Preview(name = "Demo interactiva", widthDp = ANCHO, heightDp = 874, showBackground = true)
@Composable fun PrevDemo() = AlcanciaTheme { DemoFlujoPlata(Ejemplos.semana) }
