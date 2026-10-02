package pe.alcancia.ui.i18n

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ProvidableCompositionLocal
import androidx.compose.runtime.staticCompositionLocalOf

/**
 * Textos: misma clave que es.json / Localizable.strings (p. ej. "alcancia.agregarPlata").
 * Las variables se pasan por nombre y el kit las ordena como en strings.xml:
 *   t("flujo.in.ahora", "nombre" to "Sofía", "monto" to "S/ 25.00")
 */
interface Textos {
    fun texto(clave: String, args: List<Any>): String
    fun plural(clave: String, cantidad: Int): String
}

val LocalTextos: ProvidableCompositionLocal<Textos> = staticCompositionLocalOf { error("Envuelve tu UI en AlcanciaTheme { }") }

@Composable
fun t(clave: String, vararg args: Pair<String, Any>): String {
    val porNombre = args.toMap()
    val orden = TEXTO_ARGS[clave].orEmpty()
    return LocalTextos.current.texto(clave, orden.map { porNombre[it] ?: "" })
}

/** Plurales: "progreso.cosas" + cantidad → «1 cosa contada» / «3 cosas contadas». */
@Composable
fun tn(clave: String, cantidad: Int): String = LocalTextos.current.plural(clave, cantidad)

/** Reemplaza %1$s, %2$s… (o %1$d) por los argumentos: lo usan las implementaciones de Textos. */
fun formatear(plantilla: String, args: List<Any>): String {
    var r = plantilla
    args.forEachIndexed { i, a -> r = r.replace("%${i + 1}\$s", a.toString()).replace("%${i + 1}\$d", a.toString()) }
    return r.replace("%%", "%")
}
