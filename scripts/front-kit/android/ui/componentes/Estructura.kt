package pe.alcancia.ui.componentes

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import pe.alcancia.ui.i18n.t
import pe.alcancia.ui.modelo.Conexion
import pe.alcancia.ui.tema.duracion
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaDimen
import pe.alcancia.ui.theme.AlcanciaMotion
import pe.alcancia.ui.theme.AlcanciaType

/** Título de pestaña (26 sp) + botón ⚙️ que abre los ajustes del chanchito. */
@Composable
fun EncabezadoPantalla(titulo: String, onAjustes: (() -> Unit)?, modifier: Modifier = Modifier) {
    Row(modifier.fillMaxWidth().defaultMinSize(minHeight = 44.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(titulo, style = AlcanciaType.tituloPantalla, modifier = Modifier.weight(1f).semantics { heading() })
        if (onAjustes != null) BotonIcono(Ic.Settings, t("comun.ajustesChanchito"), onAjustes)
    }
}

/** Fila de contexto: nombre del niño (abre el selector) y estado del chanchito (abre sus ajustes). */
@Composable
fun FilaContexto(nombre: String, conexion: Conexion, onPersona: () -> Unit, onConexion: () -> Unit, modifier: Modifier = Modifier) {
    Row(modifier.fillMaxWidth().defaultMinSize(minHeight = 44.dp), verticalAlignment = Alignment.CenterVertically) {
        Row(
            Modifier.clickable(role = Role.Button, onClick = onPersona).defaultMinSize(minHeight = 44.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(nombre, style = AlcanciaType.seccion)
            Icono(Ic.ChevronDown, tamano = 16.dp)
        }
        Spacer(Modifier.weight(1f))
        EstadoConexion(conexion, onConexion)
    }
}

/** Un solo estado para toda la app. Si nunca se conectó, se invita («Conectar chanchito»), no se alarma. */
@Composable
fun EstadoConexion(conexion: Conexion, onClick: () -> Unit) {
    val (texto, color, peso) = when (conexion) {
        Conexion.Conectado -> Triple(t("conexion.conectado"), AlcanciaColor.TextoSecundario, FontWeight.Normal)
        Conexion.SinConexion -> Triple(t("conexion.sinConexion"), AlcanciaColor.TextoSecundario, FontWeight.Normal)
        Conexion.NuncaConectado -> Triple(t("conexion.conectar"), AlcanciaColor.Principal, FontWeight.SemiBold)
    }
    Row(
        Modifier.clickable(role = Role.Button, onClick = onClick).defaultMinSize(minHeight = 44.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically,
    ) {
        Icono(Ic.Wifi, tamano = 16.dp, color = color)
        Text(texto, style = AlcanciaType.etiqueta.copy(fontWeight = peso), color = color)
    }
}

/** «Sus metas ··· Ver todas (2)». */
@Composable
fun EncabezadoSeccion(titulo: String, modifier: Modifier = Modifier, accion: String? = null, onAccion: () -> Unit = {}) {
    Row(modifier.fillMaxWidth().defaultMinSize(minHeight = 44.dp).padding(top = AlcanciaDimen.Space12), verticalAlignment = Alignment.CenterVertically) {
        Text(titulo, style = AlcanciaType.seccion, modifier = Modifier.weight(1f).semantics { heading() })
        if (accion != null) Text(accion, style = AlcanciaType.secundario.copy(fontWeight = FontWeight.SemiBold), color = AlcanciaColor.Principal,
            modifier = Modifier.clickable(role = Role.Button, onClick = onAccion).padding(vertical = 12.dp))
    }
}

/** Pantalla de pestaña: margen 24, scroll, espacio para la barra inferior. */
@Composable
fun PantallaPestana(modifier: Modifier = Modifier, contenido: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier.fillMaxSize().background(AlcanciaColor.Base).verticalScroll(rememberScrollState())
            .padding(horizontal = AlcanciaDimen.PageMargin, vertical = AlcanciaDimen.Space24),
        verticalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space12),
        content = contenido,
    )
}

/**
 * Tarea enfocada (flujos de plata, formularios): barra con ← o ✕, contenido con scroll y
 * acción principal fija al pie (sobre el teclado y el área segura) con una ayuda corta.
 */
@Composable
fun PantallaTarea(
    titulo: String,
    onAtras: (() -> Unit)?,
    modifier: Modifier = Modifier,
    cerrar: Boolean = false,
    ayudaPie: String? = null,
    pie: (@Composable ColumnScope.() -> Unit)? = null,
    contenido: @Composable ColumnScope.() -> Unit,
) {
    Column(modifier.fillMaxSize().background(AlcanciaColor.Base)) {
        Column(
            Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = AlcanciaDimen.PageMargin, vertical = AlcanciaDimen.Space16),
            verticalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space12),
        ) {
            if (onAtras != null) Row(Modifier.offset(x = (-10).dp), horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space12), verticalAlignment = Alignment.CenterVertically) {
                BotonIcono(if (cerrar) Ic.X else Ic.ArrowLeft, t(if (cerrar) "comun.cerrar" else "comun.volver"), onAtras, conFondo = false)
                Text(titulo, style = AlcanciaType.seccion)
            }
            contenido()
        }
        if (pie != null) {
            Separador()
            Column(Modifier.fillMaxWidth().padding(horizontal = AlcanciaDimen.PageMargin, vertical = AlcanciaDimen.Space16), verticalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8)) {
                pie()
                if (ayudaPie != null) Text(ayudaPie, style = AlcanciaType.secundario, color = AlcanciaColor.TextoSecundario, modifier = Modifier.align(Alignment.CenterHorizontally))
            }
        }
    }
}

/** «Paso 2 de 4 · De dónde salió» + segmentos que se pintan al avanzar. */
@Composable
fun IndicadorPasos(actual: Int, etiquetas: List<String>, modifier: Modifier = Modifier) {
    Column(modifier.padding(bottom = AlcanciaDimen.Space8), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(t("flujo.paso", "actual" to actual, "total" to etiquetas.size, "etiqueta" to etiquetas[actual - 1]), style = AlcanciaType.secundario, color = AlcanciaColor.TextoSecundario)
        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            etiquetas.indices.forEach { i ->
                val c by animateColorAsState(if (i < actual) AlcanciaColor.Principal else AlcanciaColor.Borde, tween(duracion(350)), label = "paso")
                Box(Modifier.weight(1f).height(4.dp).clip(RoundedCornerShape(2.dp)).background(c))
            }
        }
    }
}

/** Barra inferior: Alcancía · Aprender · Progreso. La píldora azul se desliza a la pestaña elegida (280 ms). */
@Composable
fun BarraPestanas(elegida: Int, onElegir: (Int) -> Unit, modifier: Modifier = Modifier) {
    val pestanas = listOf(Ic.PiggyBank to "nav.alcancia", Ic.BookOpen to "nav.aprender", Ic.ChartNoAxesCombined to "nav.progreso")
    Column(modifier.fillMaxWidth().background(AlcanciaColor.Base)) {
        Separador()
        BoxWithConstraints(Modifier.fillMaxWidth().padding(AlcanciaDimen.Space8)) {
            val ancho = (maxWidth - 16.dp) / 3
            val x by animateDpAsState((ancho + 8.dp) * elegida, tween(duracion(AlcanciaMotion.PildoraMs)), label = "pildora")
            Box(Modifier.offset(x = x).width(ancho).height(52.dp).clip(RoundedCornerShape(AlcanciaDimen.Radius14)).background(AlcanciaColor.FondoAzul))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                pestanas.forEachIndexed { i, (icono, clave) ->
                    val on = i == elegida
                    val color = if (on) AlcanciaColor.Principal else AlcanciaColor.TextoSecundario
                    Column(
                        Modifier.width(ancho).height(52.dp).clip(RoundedCornerShape(AlcanciaDimen.Radius14)).clickable(role = Role.Tab) { onElegir(i) },
                        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
                    ) {
                        Icono(icono, tamano = 22.dp, color = color)
                        Text(t(clave), style = AlcanciaType.etiqueta.copy(fontWeight = if (on) FontWeight.SemiBold else FontWeight.Normal), color = color)
                    }
                }
            }
        }
    }
}
