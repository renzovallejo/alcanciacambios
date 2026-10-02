// Generado por scripts/front-kit/generar.ts. No editar a mano: cambia la fuente (src/) y vuelve a generar.
package pe.alcancia.ui.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/** Colores del DS v3.4. Blanco siempre como fondo de página; fondos suaves solo en bloques con significado. */
object AlcanciaColor {
    val Acento = Color(0xFFFF7F32)
    val Base = Color(0xFFFFFFFF)
    val Borde = Color(0xFFE4E5EC)
    val FondoAzul = Color(0xFFF5F7FE)
    val FondoNaranja = Color(0xFFFFF8F3)
    val FondoRojo = Color(0xFFFFF4F4)
    val FondoVerde = Color(0xFFF1FBF6)
    val FondoVioleta = Color(0xFFFAF6FF)
    val Principal = Color(0xFF141C7A)
    val Secundario = Color(0xFF7B24C5)
    val Texto = Color(0xFF0A0D29)
    val TextoSecundario = Color(0xFF5B6080)
}

/** Dimensiones a 1× (dp). Objetivo táctil mínimo: TouchMin. */
object AlcanciaDimen {
    val BorderWidth = 1.dp
    val ContentWidth = 354.dp
    val ControlHeight = 48.dp
    val FocusWidth = 2.dp
    val PageMargin = 24.dp
    val Radius10 = 10.dp
    val Radius12 = 12.dp
    val Radius14 = 14.dp
    val Radius16 = 16.dp
    val Space10 = 10.dp
    val Space12 = 12.dp
    val Space14 = 14.dp
    val Space16 = 16.dp
    val Space18 = 18.dp
    val Space20 = 20.dp
    val Space24 = 24.dp
    val Space32 = 32.dp
    val Space4 = 4.dp
    val Space6 = 6.dp
    val Space7 = 7.dp
    val Space8 = 8.dp
    val TouchMin = 44.dp
}

/** Inter: la carga cada plataforma (ver plataforma/Plataforma.kt). */
val Inter: FontFamily get() = pe.alcancia.ui.plataforma.interFontFamily()

/** Roles tipográficos. Usar sp: respetan el tamaño de texto del sistema. */
object AlcanciaType {
    /** 36/44 · 600 · S/ 15.00 */
    val importe = TextStyle(fontFamily = Inter, fontSize = 36.sp, lineHeight = 44.sp, fontWeight = FontWeight(600))
    /** 26/34 · 600 · Alcancía, Aprender, ¿Cuánto va a guardar? */
    val tituloPantalla = TextStyle(fontFamily = Inter, fontSize = 26.sp, lineHeight = 34.sp, fontWeight = FontWeight(600))
    /** 22/30 · 600 · Fijar una meta de ahorro */
    val destacado = TextStyle(fontFamily = Inter, fontSize = 22.sp, lineHeight = 30.sp, fontWeight = FontWeight(600))
    /** 20/28 · 600 · Aprendan a ahorrar juntos, título de momento */
    val bienvenida = TextStyle(fontFamily = Inter, fontSize = 20.sp, lineHeight = 28.sp, fontWeight = FontWeight(600))
    /** 18/26 · 600 · Sus metas */
    val seccion = TextStyle(fontFamily = Inter, fontSize = 18.sp, lineHeight = 26.sp, fontWeight = FontWeight(600))
    /** 16/24 · 600 · Agregar plata */
    val boton = TextStyle(fontFamily = Inter, fontSize = 16.sp, lineHeight = 24.sp, fontWeight = FontWeight(600))
    /** 16/24 · 500 · Libro de dinosaurios */
    val elemento = TextStyle(fontFamily = Inter, fontSize = 16.sp, lineHeight = 24.sp, fontWeight = FontWeight(500))
    /** 16/24 · 400 · Texto del cuento */
    val relato = TextStyle(fontFamily = Inter, fontSize = 16.sp, lineHeight = 24.sp, fontWeight = FontWeight(400))
    /** 15/22 · 400 · Explicaciones y ayudas */
    val cuerpo = TextStyle(fontFamily = Inter, fontSize = 15.sp, lineHeight = 22.sp, fontWeight = FontWeight(400))
    /** 14/20 · 400 · Descripciones cortas */
    val secundario = TextStyle(fontFamily = Inter, fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight(400))
    /** 13/18 · 400 · Ahorrar · 5 min */
    val metadatos = TextStyle(fontFamily = Inter, fontSize = 13.sp, lineHeight = 18.sp, fontWeight = FontWeight(400))
    /** 12/16 · 600 · LLEVA AHORRADO, navegación */
    val etiqueta = TextStyle(fontFamily = Inter, fontSize = 12.sp, lineHeight = 16.sp, fontWeight = FontWeight(600))
}

/** Duraciones (ms) y curvas. Si el sistema pide reducir animaciones, usar 0 ms. */
object AlcanciaMotion {
    /** Respuesta táctil (escala 0.98) */
    const val RapidaMs = 120
    /** Aparición de contenido, cambio de formato */
    const val CortaMs = 200
    /** Entrada de pantallas y subpantallas */
    const val PantallaMs = 240
    /** Indicador de pestaña / formato que se desliza */
    const val PildoraMs = 280
    /** Icono de éxito con rebote */
    const val ConfirmacionMs = 450
    /** Conteo del saldo y barras de avance */
    const val ConteoMs = 700
}

object AlcanciaEasing {
    val Standard = CubicBezierEasing(0.2f, 0f, 0f, 1f)
    val Decelerate = CubicBezierEasing(0f, 0f, 0.2f, 1f)
    val Emphasized = CubicBezierEasing(0.2f, 0.8f, 0.2f, 1f)
    val Overshoot = CubicBezierEasing(0.2f, 0.9f, 0.3f, 1.3f)
}
