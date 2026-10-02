package pe.alcancia.ui.plataforma

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.painter.BitmapPainter
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.loadImageBitmap
import androidx.compose.ui.res.loadSvgPainter
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.platform.Font
import pe.alcancia.ui.i18n.Textos
import pe.alcancia.ui.i18n.formatear
import java.io.File

/** Reemplazo de escritorio de android/plataforma/Plataforma.kt: solo para compilar y renderizar el kit aquí. */
private val RAIZ = File(System.getProperty("kit.raiz", "../../.."))

fun interFontFamily(): FontFamily {
    val f = { n: String -> File(RAIZ, "scripts/front-kit/fuentes/inter_$n.ttf") }
    return FontFamily(Font(f("regular"), FontWeight.Normal), Font(f("medium"), FontWeight.Medium), Font(f("semibold"), FontWeight.SemiBold))
}

@Composable
fun iconoPainter(nombre: String): Painter {
    val d = LocalDensity.current
    return remember(nombre) { File(RAIZ, "src/assets/iconos/$nombre.svg").inputStream().use { loadSvgPainter(it, d) } }
}

@Composable
fun mascotaPainter(): Painter = remember { BitmapPainter(File(RAIZ, "src/assets/mascota/mascota-3x.png").inputStream().use { loadImageBitmap(it) }) }

@Composable
fun reducirMovimientoDelSistema(): Boolean = false

@Composable
fun textosDelSistema(): Textos = remember { TextosEs }

private object TextosEs : Textos {
    // es.json usa {variable}; aquí se pasa a %1$s como en strings.xml para probar el mismo camino.
    private fun plantilla(clave: String): String {
        val v = TEXTOS_ES[clave] ?: error("Falta el texto «$clave»")
        var i = 0; val vistos = LinkedHashMap<String, Int>()
        return Regex("\\{(\\w+)\\}").replace(v) { m -> if (m.groupValues[1] == "count") "%1\$d" else "%${vistos.getOrPut(m.groupValues[1]) { ++i }}\$s" }
    }
    override fun texto(clave: String, args: List<Any>) = formatear(plantilla(clave), args)
    override fun plural(clave: String, cantidad: Int) = formatear(plantilla(clave + if (cantidad == 1) "_one" else "_other"), listOf(cantidad))
}
