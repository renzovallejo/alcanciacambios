package pe.alcancia.ui.componentes

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import pe.alcancia.ui.dinero.formatoCorto
import pe.alcancia.ui.modelo.Opcion
import pe.alcancia.ui.tema.duracion
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaDimen
import pe.alcancia.ui.theme.AlcanciaType

/** El ✓ aparece con un rebote corto al elegir (280 ms). */
@Composable
private fun IconoEleccion(icono: String, elegida: Boolean, tamano: androidx.compose.ui.unit.Dp = 20.dp) {
    val e by animateFloatAsState(if (elegida) 1f else .999f, tween(duracion(280)), label = "eleccion")
    val k = if (elegida) 0.6f + 0.4f * e + 0.12f * kotlin.math.sin(e * Math.PI).toFloat() else 1f
    Icono(if (elegida) Ic.CircleCheck else icono, tamano = tamano, color = AlcanciaColor.Principal, modifier = Modifier.graphicsLayer { scaleX = k; scaleY = k })
}

/** Tarjeta de opción para grillas de 2 columnas (motivos). Selección = ✓ + borde + fondo, nunca solo color. */
@Composable
fun OpcionTarjeta(texto: String, icono: String, elegida: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val forma = RoundedCornerShape(AlcanciaDimen.Radius14)
    Row(
        modifier
            .defaultMinSize(minHeight = 56.dp)
            .clip(forma)
            .background(if (elegida) AlcanciaColor.FondoAzul else AlcanciaColor.Base)
            .border(if (elegida) 1.5.dp else AlcanciaDimen.BorderWidth, if (elegida) AlcanciaColor.Principal else AlcanciaColor.Borde, forma)
            .selectable(selected = elegida, role = Role.RadioButton, onClick = onClick)
            .padding(AlcanciaDimen.Space12),
        horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8), verticalAlignment = Alignment.CenterVertically,
    ) {
        IconoEleccion(icono, elegida)
        Text(
            texto, style = AlcanciaType.secundario.copy(fontWeight = if (elegida) FontWeight.SemiBold else FontWeight.Normal),
            color = if (elegida) AlcanciaColor.Principal else AlcanciaColor.Texto,
        )
    }
}

/** Grilla de 2 columnas de opciones (motivos de plata, quién envía en corregir). */
@Composable
fun GrillaOpciones(opciones: List<Opcion>, elegida: String?, texto: @Composable (Opcion) -> String, onElegir: (Opcion) -> Unit, modifier: Modifier = Modifier) {
    Column(modifier.selectableGroup(), verticalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8)) {
        opciones.chunked(2).forEach { fila ->
            Row(horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8)) {
                fila.forEach { o -> OpcionTarjeta(texto(o), o.icono, elegida == o.id, { onElegir(o) }, Modifier.weight(1f)) }
                if (fila.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

/** Opción a lo ancho con subtítulo opcional y radio a la derecha (¿Quién le envía?, metas, días). */
@Composable
fun OpcionFila(titulo: String, icono: String, elegida: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier, subtitulo: String? = null, conRadio: Boolean = true) {
    val forma = RoundedCornerShape(AlcanciaDimen.Radius14)
    Row(
        modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = 56.dp)
            .clip(forma)
            .background(if (elegida) AlcanciaColor.FondoAzul else AlcanciaColor.Base)
            .border(if (elegida) 1.5.dp else AlcanciaDimen.BorderWidth, if (elegida) AlcanciaColor.Principal else AlcanciaColor.Borde, forma)
            .selectable(selected = elegida, role = Role.RadioButton, onClick = onClick)
            .padding(AlcanciaDimen.Space12),
        horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8), verticalAlignment = Alignment.CenterVertically,
    ) {
        if (conRadio) Icono(icono, tamano = 22.dp, color = AlcanciaColor.Principal) else IconoEleccion(icono, elegida)
        Column(Modifier.weight(1f)) {
            Text(titulo, style = AlcanciaType.secundario.copy(fontWeight = FontWeight.SemiBold), color = if (elegida) AlcanciaColor.Principal else AlcanciaColor.Texto)
            if (subtitulo != null) Text(subtitulo, style = AlcanciaType.metadatos, color = if (elegida) AlcanciaColor.Principal else AlcanciaColor.TextoSecundario)
        }
        if (conRadio) PuntoRadio(elegida)
    }
}

@Composable
fun PuntoRadio(elegido: Boolean) {
    Box(
        Modifier.size(22.dp).clip(CircleShape).border(2.dp, if (elegido) AlcanciaColor.Principal else AlcanciaColor.Borde, CircleShape),
        contentAlignment = Alignment.Center,
    ) { if (elegido) Box(Modifier.size(10.dp).clip(CircleShape).background(AlcanciaColor.Principal)) }
}

/** S/ 5 · S/ 10 · S/ 20. El elegido va relleno y con ✓. */
@Composable
fun MontosRapidos(valores: List<Int>, elegido: Int?, onElegir: (Int) -> Unit, modifier: Modifier = Modifier) {
    Row(modifier.fillMaxWidth().selectableGroup(), horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space12)) {
        valores.forEach { v ->
            val on = v == elegido
            val forma = RoundedCornerShape(AlcanciaDimen.Radius14)
            Row(
                Modifier.weight(1f).height(52.dp).clip(forma)
                    .background(if (on) AlcanciaColor.Principal else AlcanciaColor.Base)
                    .border(AlcanciaDimen.BorderWidth, if (on) AlcanciaColor.Principal else AlcanciaColor.Borde, forma)
                    .selectable(selected = on, role = Role.RadioButton) { onElegir(v) },
                horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically,
            ) {
                if (on) Icono(Ic.Check, tamano = 16.dp, color = AlcanciaColor.Base)
                Text(formatoCorto(v), style = AlcanciaType.boton, color = if (on) AlcanciaColor.Base else AlcanciaColor.Principal)
            }
        }
    }
}

/** Chip de 44 dp (versión del cuento, filtros). [presionado] = elegido. */
@Composable
fun Chip(texto: String, onClick: () -> Unit, modifier: Modifier = Modifier, icono: String? = null, presionado: Boolean = false) {
    Row(
        modifier.height(AlcanciaDimen.TouchMin).clip(RoundedCornerShape(22.dp))
            .background(if (presionado) AlcanciaColor.Principal else AlcanciaColor.FondoAzul)
            .clickable(role = Role.Button, onClick = onClick).padding(horizontal = AlcanciaDimen.Space12),
        horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically,
    ) {
        val c = if (presionado) AlcanciaColor.Base else AlcanciaColor.Principal
        if (icono != null) Icono(icono, tamano = 16.dp, color = c)
        Text(texto, style = AlcanciaType.secundario.copy(fontWeight = FontWeight.SemiBold), color = c)
    }
}
