package pe.alcancia.ui.componentes

import androidx.compose.animation.Animatable as AnimatableColor
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import pe.alcancia.ui.dinero.formatoSoles
import pe.alcancia.ui.i18n.t
import pe.alcancia.ui.modelo.Flujo
import pe.alcancia.ui.modelo.MetaUi
import pe.alcancia.ui.modelo.MovimientoUi
import pe.alcancia.ui.tema.LocalReducirMovimiento
import pe.alcancia.ui.tema.duracion
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaDimen
import pe.alcancia.ui.theme.AlcanciaEasing
import pe.alcancia.ui.theme.AlcanciaMotion
import pe.alcancia.ui.theme.AlcanciaType

private val EaseOutCubic = CubicBezierEasing(0.33f, 1f, 0.68f, 1f)

/**
 * Tarjeta del saldo: mascota (tócala y salta), «LLEVA AHORRADO», monto que cuenta desde [saldoAnterior]
 * hasta [saldo] (700 ms) y «Esta semana: +S/ X». El lector de pantalla recibe el valor final de inmediato.
 */
@Composable
fun TarjetaSaldo(nombre: String, saldo: Int, modifier: Modifier = Modifier, saldoAnterior: Int = saldo, estaSemana: Int = 0, saltos: Int = 0, onTocarChanchito: () -> Unit = {}) {
    val reducir = LocalReducirMovimiento.current
    val mostrado = remember { Animatable(saldoAnterior.toFloat()) }
    LaunchedEffect(saldo) { if (reducir) mostrado.snapTo(saldo.toFloat()) else mostrado.animateTo(saldo.toFloat(), tween(AlcanciaMotion.ConteoMs, easing = EaseOutCubic)) }
    val cambio = saldoAnterior != saldo
    Row(
        modifier.fillMaxWidth().clip(RoundedCornerShape(AlcanciaDimen.Radius16)).background(AlcanciaColor.FondoAzul).padding(AlcanciaDimen.Space20)
            .semantics(mergeDescendants = true) { contentDescription = t0(nombre, saldo); liveRegion = LiveRegionMode.Polite },
        horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space16), verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.clickable(interactionSource = remember { MutableInteractionSource() }, indication = null, role = Role.Button, onClick = onTocarChanchito)) {
            Mascota(tamano = 64.dp, saltos = saltos + if (cambio) 1 else 0, retardoMs = if (cambio && saltos == 0) 150 else 0)
        }
        Column(Modifier.clearAndSetSemantics { }) {
            Text(t("alcancia.llevaAhorrado"), style = AlcanciaType.etiqueta, color = AlcanciaColor.TextoSecundario)
            Text(formatoSoles(Math.round(mostrado.value)), style = AlcanciaType.importe, color = AlcanciaColor.Principal)
            if (estaSemana > 0) Text(t("alcancia.estaSemana", "monto" to formatoSoles(estaSemana)), style = AlcanciaType.etiqueta.copy(fontWeight = FontWeight.Normal), color = AlcanciaColor.TextoSecundario)
        }
    }
}
private fun t0(nombre: String, saldo: Int) = "$nombre: ${formatoSoles(saldo)}"

/** Barra de avance: crece de 0 al valor al aparecer (700 ms). Siempre acompañada de «S/ X de S/ Y». */
@Composable
fun BarraAvance(porcentaje: Int, descripcion: String, modifier: Modifier = Modifier, alto: Dp = 6.dp) {
    val p = remember { Animatable(0f) }
    val d = duracion(AlcanciaMotion.ConteoMs)
    LaunchedEffect(porcentaje) { p.animateTo(porcentaje / 100f, tween(d, easing = AlcanciaEasing.Emphasized)) }
    Box(
        modifier.fillMaxWidth().height(alto).clip(RoundedCornerShape(alto / 2)).background(AlcanciaColor.Borde)
            .semantics { contentDescription = descripcion; progressBarRangeInfo = ProgressBarRangeInfo(porcentaje / 100f, 0f..1f) },
    ) { Box(Modifier.fillMaxHeight().fillMaxWidth(p.value).clip(RoundedCornerShape(alto / 2)).background(AlcanciaColor.Principal)) }
}

/** Tarjeta de meta: icono, nombre, «S/ 12.00 de S/ 30.00», % (o «¡Logrado!» / «Ya la usaron») y barra. */
@Composable
fun TarjetaMeta(meta: MetaUi, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val forma = RoundedCornerShape(AlcanciaDimen.Radius14)
    Column(
        modifier.fillMaxWidth().clip(forma)
            .background(if (meta.lograda) AlcanciaColor.FondoVerde else AlcanciaColor.Base)
            .then(if (meta.lograda) Modifier else Modifier.border(AlcanciaDimen.BorderWidth, AlcanciaColor.Borde, forma))
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = AlcanciaDimen.Space16, vertical = AlcanciaDimen.Space12),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space12), verticalAlignment = Alignment.CenterVertically) {
            IconTile(if (meta.lograda) Ic.CircleCheck else meta.icono, if (meta.lograda) TonoTile.Verde else if (meta.icono == "puzzle") TonoTile.Naranja else TonoTile.Azul, tamano = 36.dp)
            Column(Modifier.weight(1f)) {
                Text(meta.nombre, style = AlcanciaType.elemento.copy(fontWeight = FontWeight.SemiBold))
                Text(t("meta.deObjetivo", "guardado" to formatoSoles(meta.guardado), "objetivo" to formatoSoles(meta.objetivo)), style = AlcanciaType.metadatos, color = AlcanciaColor.TextoSecundario)
            }
            Text(
                when { meta.usada -> t("meta.usada"); meta.lograda -> t("meta.logrado"); else -> "${meta.porcentaje}%" },
                style = AlcanciaType.metadatos.copy(fontWeight = FontWeight.SemiBold), color = AlcanciaColor.Principal,
            )
            Icono(Ic.ChevronRight, tamano = 16.dp, color = AlcanciaColor.TextoSecundario)
        }
        BarraAvance(meta.porcentaje, t("meta.avance", "meta" to meta.nombre, "porcentaje" to meta.porcentaje))
    }
}

/**
 * Fila de movimiento: título = motivo («Se portó bien»), debajo quién envió (solo entradas) y cuándo («Abuela · ayer»), y el monto.
 * «Guardó/Sacó plata» lo dicen la flecha y el signo (y se anuncia al lector de pantalla); quién lo hizo va en el detalle.
 * [nuevo] la resalta en menta y se desvanece (1.6 s), para el que se acaba de guardar.
 */
@Composable
fun FilaMovimiento(m: MovimientoUi, onClick: () -> Unit, modifier: Modifier = Modifier, nuevo: Boolean = false) {
    val salida = m.flujo == Flujo.Salida
    val tipo = t(if (salida) "movimientos.out" else "movimientos.in")
    val fondo = remember { AnimatableColor(if (nuevo) AlcanciaColor.FondoVerde else Color.Transparent) }
    val d = duracion(1600)
    LaunchedEffect(nuevo) { if (nuevo) fondo.animateTo(Color.Transparent, tween(d, delayMillis = if (d == 0) 0 else 300)) }
    Row(
        modifier.fillMaxWidth().clip(RoundedCornerShape(AlcanciaDimen.Radius12)).background(fondo.value)
            .clickable(role = Role.Button, onClick = onClick).defaultMinSize(minHeight = 56.dp).padding(vertical = AlcanciaDimen.Space12)
            .semantics(mergeDescendants = true) { stateDescription = tipo },
        horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space12), verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.graphicsLayer { rotationZ = if (salida) 180f else 0f }) { IconTile(Ic.ArrowUp, if (salida) TonoTile.Naranja else TonoTile.Verde) }
        Column(Modifier.weight(1f)) {
            Text(m.motivo.ifBlank { tipo }, style = AlcanciaType.elemento)
            Text(listOf(if (salida) "" else m.quien, m.cuando).filter { it.isNotBlank() }.joinToString(" · "), style = AlcanciaType.secundario, color = AlcanciaColor.TextoSecundario)
        }
        Text((if (salida) "−" else "+") + formatoSoles(m.centimos), style = AlcanciaType.cuerpo.copy(fontWeight = FontWeight.SemiBold), color = AlcanciaColor.Principal)
    }
}
