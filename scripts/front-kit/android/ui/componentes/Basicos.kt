package pe.alcancia.ui.componentes

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.alcancia.ui.i18n.t
import pe.alcancia.ui.plataforma.iconoPainter
import pe.alcancia.ui.plataforma.mascotaPainter
import pe.alcancia.ui.tema.LocalReducirMovimiento
import pe.alcancia.ui.tema.duracion
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaDimen
import pe.alcancia.ui.theme.AlcanciaMotion
import pe.alcancia.ui.theme.AlcanciaType

/** Icono Lucide por nombre (ver Ic.*). Decorativo salvo que pases [descripcion]. */
@Composable
fun Icono(nombre: String, modifier: Modifier = Modifier, tamano: Dp = 24.dp, color: Color = LocalContentColor.current, descripcion: String? = null) {
    Icon(painter = iconoPainter(nombre), contentDescription = descripcion, modifier = modifier.size(tamano), tint = color)
}

/**
 * Mascota (chanchito). Cada vez que [saltos] cambia, da un salto: −10 dp y ±4° en 700 ms.
 * Para que salte al tocarlo: var saltos by remember { mutableStateOf(0) } … Mascota(saltos = saltos, modifier = Modifier.clickable { saltos++ })
 */
@Composable
fun Mascota(modifier: Modifier = Modifier, tamano: Dp = 64.dp, saltos: Int = 0, retardoMs: Int = 0) {
    val reducir = LocalReducirMovimiento.current
    val p = remember { Animatable(1f) }
    LaunchedEffect(saltos) {
        if (saltos > 0 && !reducir) { p.snapTo(0f); p.animateTo(1f, tween(700, delayMillis = retardoMs, easing = LinearEasing)) }
    }
    Image(
        painter = mascotaPainter(), contentDescription = null,
        modifier = modifier.size(tamano).graphicsLayer {
            val (dy, rot) = salto(p.value)
            translationY = dy * density; rotationZ = rot
        },
    )
}

/** Curva del salto (igual a @keyframes hop de la web): 35 % arriba e inclinado, 65 % abajo, 100 % quieto. */
internal fun salto(t: Float): Pair<Float, Float> {
    fun lerp(a: Float, b: Float, k: Float) = a + (b - a) * k
    fun ease(k: Float) = if (k < .5f) 2 * k * k else 1 - (-2 * k + 2).let { it * it } / 2
    return when {
        t < .35f -> ease(t / .35f).let { lerp(0f, -10f, it) to lerp(0f, -4f, it) }
        t < .65f -> ease((t - .35f) / .3f).let { lerp(-10f, 0f, it) to lerp(-4f, 2f, it) }
        else -> ease((t - .65f) / .35f).let { 0f to lerp(2f, 0f, it) }
    }
}

enum class Variante { Primario, Secundario, Terciario }

/**
 * Botón del DS: píldora de 48 dp (terciario 44 dp), escala 0.98 al presionar.
 * [cargando] muestra «Un ratito…» con spinner y bloquea toques repetidos (un solo envío).
 */
@Composable
fun Boton(
    texto: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variante: Variante = Variante.Primario,
    habilitado: Boolean = true,
    cargando: Boolean = false,
    icono: String? = null,
    /** true dentro de ParDeBotones: relleno lateral 8 dp para que el texto quepa en una línea. */
    compacto: Boolean = false,
) {
    val activo = habilitado && !cargando
    val interaccion = remember { MutableInteractionSource() }
    val presionado by interaccion.collectIsPressedAsState()
    val escala by animateFloatAsState(if (presionado && activo) .98f else 1f, tween(duracion(AlcanciaMotion.RapidaMs)), label = "escala")
    val (fondo, texto_, borde) = when {
        !habilitado -> Triple(AlcanciaColor.Borde, AlcanciaColor.TextoSecundario, Color.Transparent)
        variante == Variante.Primario -> Triple(AlcanciaColor.Principal, AlcanciaColor.Base, Color.Transparent)
        variante == Variante.Secundario -> Triple(AlcanciaColor.Base, AlcanciaColor.Principal, AlcanciaColor.Principal)
        else -> Triple(Color.Transparent, AlcanciaColor.Principal, Color.Transparent)
    }
    val alto = if (variante == Variante.Terciario) AlcanciaDimen.TouchMin else AlcanciaDimen.ControlHeight
    Row(
        modifier = modifier
            .graphicsLayer { scaleX = escala; scaleY = escala }
            .defaultMinSize(minHeight = alto)
            .clip(RoundedCornerShape(50))
            .background(fondo)
            .border(BorderStroke(AlcanciaDimen.BorderWidth, borde), RoundedCornerShape(50))
            .clickable(interactionSource = interaccion, indication = null, enabled = activo, role = Role.Button, onClick = onClick)
            .padding(horizontal = if (variante == Variante.Terciario || compacto) AlcanciaDimen.Space8 else AlcanciaDimen.Space24),
        horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8, Alignment.CenterHorizontally),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (cargando) {
            CircularProgressIndicator(Modifier.size(16.dp), color = texto_, strokeWidth = 2.dp)
            Text(t("comun.unRatito"), style = AlcanciaType.boton, color = texto_)
        } else {
            if (icono != null) Icono(icono, tamano = 20.dp, color = texto_)
            Text(texto, style = if (variante == Variante.Terciario) AlcanciaType.boton.copy(fontSize = 14.sp) else AlcanciaType.boton, color = texto_, textAlign = TextAlign.Center)
        }
    }
}

/** Dos botones del mismo ancho, lado a lado (Agregar plata / Sacar plata). */
@Composable
fun ParDeBotones(modifier: Modifier = Modifier, contenido: @Composable RowScope.() -> Unit) {
    Row(modifier, horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space12), content = contenido)
}

/** Botón redondo de 44 dp solo con icono (ajustes, volver, cerrar). [descripcion] es obligatoria: la lee el lector de pantalla. */
@Composable
fun BotonIcono(icono: String, descripcion: String, onClick: () -> Unit, modifier: Modifier = Modifier, conFondo: Boolean = true) {
    Box(
        modifier
            .size(AlcanciaDimen.TouchMin)
            .clip(CircleShape)
            .background(if (conFondo) AlcanciaColor.FondoAzul else Color.Transparent)
            .clickable(role = Role.Button, onClick = onClick)
            .semantics { contentDescription = descripcion },
        contentAlignment = Alignment.Center,
    ) { Icono(icono, tamano = 22.dp, color = AlcanciaColor.Principal) }
}
