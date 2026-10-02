package pe.alcancia.verificar

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.ImageComposeScene
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import pe.alcancia.ui.componentes.*
import pe.alcancia.ui.ejemplos.Ejemplos
import pe.alcancia.ui.modelo.Flujo
import pe.alcancia.ui.pantallas.*
import pe.alcancia.ui.tema.AlcanciaTheme
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaType
import java.io.File

/** Renderiza cada pantalla y la galería de componentes del kit Compose a PNG (402 dp de ancho, 2×). */
fun main(args: Array<String>) {
    if (args.firstOrNull() == "prueba") { probarFlujo(); return }
    val out = File(args.getOrElse(0) { "build/capturas" }).apply { mkdirs() }
    fun png(nombre: String, alto: Int = 874, contenido: @Composable () -> Unit) {
        val scene = ImageComposeScene(402 * 2, alto * 2, Density(2f)) { AlcanciaTheme { Box(Modifier.fillMaxSize().background(AlcanciaColor.Base)) { contenido() } } }
        scene.render(0)
        val img = scene.render(4_000_000_000) // deja terminar las animaciones de entrada
        File(out, "$nombre.png").writeBytes(img.encodeToData()!!.bytes)
        scene.close()
        println("  $nombre.png")
    }
    val semana = Ejemplos.semana
    png("01-alcancia-semana", 1500) { AlcanciaPantalla(semana) }
    png("02-alcancia-primer-dia", 1100) { AlcanciaPantalla(Ejemplos.primerDia) }
    png("03-alcancia-borrador", 900) { AlcanciaPantalla(semana.copy(borrador = 700)) }
    png("04-alcancia-dia-de-propina", 900) { AlcanciaPantalla(semana.copy(diaPropina = "viernes")) }
    png("05-agregar-1-cuanto") { CuantoPantalla(Flujo.Entrada, "Sofía", semana.saldo, "10.00", {}, {}, {}) }
    png("06-agregar-2-de-donde", 1100) { MotivoPantalla(Flujo.Entrada, "Sofía", 1000, semana.saldo, "mesada", "", {}, {}, semana.metas, "g2", {}, {}, {}) }
    png("07-agregar-3-quien-envia", 1250) { QuienPantalla(1000, semana.saldo, "Propina de la semana", "Pelota de fútbol", "mama", "", {}, {}, {}, {}, relacionAdmin = "mama") }
    png("08-agregar-3-otro-pariente", 1100) { QuienPantalla(1000, semana.saldo, "Propina de la semana", null, "otro", "", {}, {}, {}, {}) }
    png("09-agregar-4-listo", 1100) { ListoPantalla(Flujo.Entrada, "Sofía", 3500, {}, metaLograda = "Pelota de fútbol", diaRecordatorio = "viernes") }
    png("10-sacar-1-cuanto") { CuantoPantalla(Flujo.Salida, "Sofía", semana.saldo, "5.00", {}, {}, {}) }
    png("11-sacar-2-en-que", 1150) { MotivoPantalla(Flujo.Salida, "Sofía", 500, semana.saldo, "compra", "", {}, {}, semana.metas, null, {}, {}, {}) }
    png("12-sacar-listo") { ListoPantalla(Flujo.Salida, "Sofía", 2000, {}) }
    png("13-lo-que-entro-y-salio", 1300) { MovimientosPantalla(Ejemplos.meses, {}, {}) }
    png("14-componentes", 1700) { Galeria() }
    probarFlujo()
}

@Composable
private fun Galeria() = Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
    Text("Botones", style = AlcanciaType.seccion)
    Boton("Primario", {}, Modifier.fillMaxWidth())
    Boton("Secundario", {}, Modifier.fillMaxWidth(), Variante.Secundario)
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { Boton("Terciario", {}, variante = Variante.Terciario); Boton("Deshabilitado", {}, habilitado = false); BotonIcono(Ic.Settings, "Ajustes", {}) }
    Boton("", {}, Modifier.fillMaxWidth(), cargando = true)
    Text("Opciones", style = AlcanciaType.seccion)
    MontosRapidos(listOf(500, 1000, 2000), 1000, {})
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { OpcionTarjeta("Por su cumple", Ic.Cake, true, {}, Modifier.weight(1f)); OpcionTarjeta("Ayudó en casa", Ic.House, false, {}, Modifier.weight(1f)) }
    OpcionFila("Abuela", Ic.PersonStanding, true, {}, subtitulo = "Administra la cuenta")
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { Chip("Cuento completo", {}, presionado = true); Chip("Versión de 1 minuto", {}) }
    Text("Avisos", style = AlcanciaType.seccion)
    Aviso("¡Ya juntaron todo para «Pelota de fútbol»!", ok = true, icono = Ic.PartyPopper)
    TarjetaIdea("IDEA DE 1 MINUTO", "Cuenten juntos las monedas de su chanchito.", "Ya lo hicimos", false, "", {})
    Banner(Ic.Bell, "Hoy es viernes, día de su propina. ¿Ya la guardó?") { Boton("Guardar su propina", {}, variante = Variante.Secundario) }
    AvisoDeshacer("Borrado", "Deshacer", {}, {}, "Cerrar")
    CampoMonto("abc", {}, "Cuánto", "Escribe un monto como 10 o 10.50.")
    Row(horizontalArrangement = Arrangement.spacedBy(24.dp)) { IconoExito(); MonedaAlChanchito("Meter la moneda", {}) }
    BarraPestanas(0, {})
}
