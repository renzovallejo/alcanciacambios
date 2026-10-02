package pe.alcancia.ui.tema

import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import pe.alcancia.ui.i18n.LocalTextos
import pe.alcancia.ui.i18n.Textos
import pe.alcancia.ui.plataforma.reducirMovimientoDelSistema
import pe.alcancia.ui.plataforma.textosDelSistema
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaType

/** true si el sistema pide reducir animaciones: todas las animaciones del kit pasan a 0 ms. */
val LocalReducirMovimiento = staticCompositionLocalOf { false }

/**
 * Envuelve toda la UI (Activity.setContent { AlcanciaTheme { … } }).
 * Solo tema claro: el DS no tiene modo oscuro.
 */
@Composable
fun AlcanciaTheme(
    textos: Textos = textosDelSistema(),
    reducirMovimiento: Boolean = reducirMovimientoDelSistema(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = AlcanciaColor.Principal, onPrimary = AlcanciaColor.Base,
            secondary = AlcanciaColor.Secundario, background = AlcanciaColor.Base, surface = AlcanciaColor.Base,
            onBackground = AlcanciaColor.Texto, onSurface = AlcanciaColor.Texto, outline = AlcanciaColor.Borde,
        ),
    ) {
        CompositionLocalProvider(
            LocalTextos provides textos,
            LocalReducirMovimiento provides reducirMovimiento,
            LocalContentColor provides AlcanciaColor.Texto,
            LocalTextStyle provides AlcanciaType.cuerpo,
            content = content,
        )
    }
}

/** Duración de una animación respetando «reducir movimiento». */
@Composable
fun duracion(ms: Int): Int = if (LocalReducirMovimiento.current) 0 else ms

/** Colores de error (no son token del DS: mismos valores que la web). */
object AlcanciaExtra {
    val Error = androidx.compose.ui.graphics.Color(0xFFB3261E)
}
