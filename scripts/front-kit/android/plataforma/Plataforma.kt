package pe.alcancia.ui.plataforma

import android.content.Context
import android.provider.Settings
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import pe.alcancia.ui.i18n.Textos
import pe.alcancia.ui.i18n.TEXTO_ARGS
import pe.alcancia.ui.i18n.androidName

/*
 * Lo único que depende de Android. Ajusta `R` al paquete de tu app (import tu.paquete.R).
 * Recursos que espera: res/font/inter_*.ttf, res/drawable-xxhdpi/mascota.png (y demás densidades), res/drawable/ic_<icono>.xml,
 * res/values/strings.xml (todos vienen en el kit, carpeta android/res).
 */
import pe.alcancia.R

/** Inter en 3 pesos fijos (400/500/600): res/font/inter_regular.ttf, inter_medium.ttf, inter_semibold.ttf. */
fun interFontFamily(): FontFamily = FontFamily(
    Font(R.font.inter_regular, FontWeight.Normal),
    Font(R.font.inter_medium, FontWeight.Medium),
    Font(R.font.inter_semibold, FontWeight.SemiBold),
)

/** "arrow-left" → R.drawable.ic_arrow_left (búsqueda por nombre, igual que en iOS y la web). */
@Composable
fun iconoPainter(nombre: String): Painter {
    val ctx = LocalContext.current
    val id = remember(nombre) { ctx.resources.getIdentifier("ic_" + nombre.replace('-', '_'), "drawable", ctx.packageName) }
    require(id != 0) { "Falta el icono ic_${nombre.replace('-', '_')} en res/drawable" }
    return painterResource(id)
}

@Composable
fun mascotaPainter(): Painter = painterResource(R.drawable.mascota)

@Composable
fun reducirMovimientoDelSistema(): Boolean {
    val ctx = LocalContext.current
    return remember { Settings.Global.getFloat(ctx.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f }
}

/** Lee strings.xml por la misma clave que es.json: "alcancia.agregarPlata" → R.string.alcancia_agregar_plata. */
@Composable
fun textosDelSistema(): Textos {
    val ctx = LocalContext.current
    return remember(ctx) { TextosAndroid(ctx) }
}

private class TextosAndroid(private val ctx: Context) : Textos {
    private val cache = HashMap<String, Int>()
    private fun id(clave: String, tipo: String) = cache.getOrPut("$tipo:$clave") {
        ctx.resources.getIdentifier(androidName(clave), tipo, ctx.packageName).also { require(it != 0) { "Falta el texto «$clave» en $tipo" } }
    }
    override fun texto(clave: String, args: List<Any>): String =
        if (args.isEmpty() && TEXTO_ARGS[clave].isNullOrEmpty()) ctx.getString(id(clave, "string"))
        else ctx.getString(id(clave, "string"), *args.toTypedArray()) // Int para %d, texto para %s
    override fun plural(clave: String, cantidad: Int): String = ctx.resources.getQuantityString(id(clave, "plurals"), cantidad, cantidad)
}
