package pe.alcancia.ui.componentes

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutLinearInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import pe.alcancia.ui.tema.LocalReducirMovimiento
import pe.alcancia.ui.tema.duracion
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaDimen
import pe.alcancia.ui.theme.AlcanciaType

/** Aviso crema con acciones debajo a la derecha (borrador a medias, día de la propina). */
@Composable
fun Banner(icono: String, texto: String, modifier: Modifier = Modifier, acciones: @Composable () -> Unit) {
    Column(
        modifier.fillMaxWidth().clip(RoundedCornerShape(AlcanciaDimen.Radius14)).background(AlcanciaColor.FondoNaranja).padding(AlcanciaDimen.Space12),
        verticalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8),
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space12), verticalAlignment = Alignment.CenterVertically) {
            Icono(icono, tamano = 20.dp)
            Text(texto, style = AlcanciaType.secundario, modifier = Modifier.weight(1f))
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8, Alignment.End)) { acciones() }
    }
}

/** Aviso flotante oscuro con «Deshacer» (6 s). Úsalo dentro de un SnackbarHost o en tu propio contenedor al pie. */
@Composable
fun AvisoDeshacer(mensaje: String, accion: String, onAccion: () -> Unit, onCerrar: () -> Unit, cerrarDescripcion: String, modifier: Modifier = Modifier) {
    Row(
        modifier.fillMaxWidth().clip(RoundedCornerShape(AlcanciaDimen.Radius12)).background(AlcanciaColor.Texto).padding(start = AlcanciaDimen.Space16),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(mensaje, style = AlcanciaType.secundario, color = AlcanciaColor.Base, modifier = Modifier.weight(1f))
        Text(accion, style = AlcanciaType.secundario.copy(fontWeight = FontWeight.SemiBold, textDecoration = TextDecoration.Underline), color = AlcanciaColor.Base,
            modifier = Modifier.clickable(role = Role.Button, onClick = onAccion).padding(horizontal = 8.dp, vertical = 14.dp))
        Box(Modifier.size(44.dp).clickable(role = Role.Button, onClick = onCerrar).semantics { contentDescription = cerrarDescripcion }, contentAlignment = Alignment.Center) {
            Icono(Ic.X, tamano = 18.dp, color = AlcanciaColor.Base)
        }
    }
}

/** Check de éxito de 72 dp: aparece con rebote (0.4 → 1.12 → 1, 450 ms) y un anillo que se expande (1 s). */
@Composable
fun IconoExito(modifier: Modifier = Modifier, icono: String = Ic.CircleCheck, fondo: Color = AlcanciaColor.FondoVerde) {
    val reducir = LocalReducirMovimiento.current
    val escala = remember { Animatable(if (reducir) 1f else .4f) }
    val anillo = remember { Animatable(if (reducir) 1f else 0f) }
    LaunchedEffect(Unit) {
        if (reducir) return@LaunchedEffect
        launch { escala.animateTo(1f, tween(450, easing = { x -> rebote(x) })) }
        launch { anillo.animateTo(1f, tween(1000, delayMillis = 350)) }
    }
    Box(modifier.size(72.dp), contentAlignment = Alignment.Center) {
        Box(Modifier.size(72.dp).drawBehind {
            val k = anillo.value
            if (k in 0.001f..0.999f) drawCircle(AlcanciaColor.Principal.copy(alpha = .25f * (1 - k)), radius = size.minDimension / 2 * (1 + .35f * k))
        })
        Box(
            Modifier.size(72.dp).graphicsLayer { scaleX = escala.value; scaleY = escala.value }.clip(CircleShape).background(fondo),
            contentAlignment = Alignment.Center,
        ) { Icono(icono, tamano = 40.dp, color = AlcanciaColor.Principal) }
    }
}
/** 0.4 → 1.12 → 1 (overshoot del DS). */
private fun rebote(x: Float): Float = if (x < .7f) (x / .7f).let { 1.12f * (1 - (1 - it) * (1 - it)) } else 1.12f - .12f * ((x - .7f) / .3f)

/**
 * «¿Y si Sofía mete la moneda?»: al tocar, la moneda cae dentro del chanchito y este salta. Opcional, no bloquea nada.
 * [onMetida] se llama al tocar (para anunciar «¡Clin! Adentro.»).
 */
@Composable
fun MonedaAlChanchito(descripcion: String, onMetida: () -> Unit, modifier: Modifier = Modifier) {
    val reducir = LocalReducirMovimiento.current
    var metida by remember { mutableStateOf(false) }
    var saltos by remember { mutableStateOf(0) }
    val caida = remember { Animatable(0f) }
    LaunchedEffect(metida) {
        if (!metida) return@LaunchedEffect
        if (!reducir) caida.animateTo(1f, tween(600, easing = FastOutLinearInEasing)) else caida.snapTo(1f)
        saltos++
    }
    Box(
        modifier.size(112.dp).clip(CircleShape).background(AlcanciaColor.FondoAzul)
            .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null, role = Role.Button) { if (!metida) { metida = true; onMetida() } }
            .semantics { contentDescription = descripcion },
        contentAlignment = Alignment.BottomCenter,
    ) {
        Mascota(Modifier.padding(bottom = 12.dp), tamano = 72.dp, saltos = saltos)
        val k = caida.value
        Box(
            Modifier.align(Alignment.TopCenter).offset(y = (6 + 46 * k).dp).size(30.dp)
                .graphicsLayer { val s = 1 - .4f * k; scaleX = s; scaleY = s; alpha = if (k >= .99f) 0f else 1f }
                .clip(CircleShape).background(Color(0xFFF5B83D)).border(1.dp, Color(0x26000000), CircleShape),
            contentAlignment = Alignment.Center,
        ) { Text("S/", style = AlcanciaType.etiqueta.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold), color = Color(0xFF6B4A00)) }
    }
}

/** Idea de 1 minuto: tarjeta lavanda con «Ya lo hicimos» → «¡Listo! …». */
@Composable
fun TarjetaIdea(ceja: String, idea: String, boton: String, hecho: Boolean, textoHecho: String, onHecho: () -> Unit, modifier: Modifier = Modifier) {
    Tarjeta(modifier, tono = Tono.Violeta) {
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
            Icono(Ic.Lightbulb, tamano = 16.dp, color = AlcanciaColor.Secundario)
            Text(ceja, style = AlcanciaType.etiqueta, color = AlcanciaColor.Secundario)
        }
        Text(idea, style = AlcanciaType.relato)
        if (hecho) Aviso(textoHecho, ok = true) else Boton(boton, onHecho, Modifier.fillMaxWidth(), Variante.Secundario)
    }
}

@Composable
internal fun Espacio(alto: androidx.compose.ui.unit.Dp) = Spacer(Modifier.size(alto))
