package pe.alcancia.ui.componentes

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaDimen
import pe.alcancia.ui.theme.AlcanciaType

/** Fondos con significado. Blanca lleva borde; las de color, no. */
enum class Tono(val fondo: Color) {
    Blanca(AlcanciaColor.Base), Crema(AlcanciaColor.FondoNaranja), Violeta(AlcanciaColor.FondoVioleta),
    Menta(AlcanciaColor.FondoVerde), Azul(AlcanciaColor.FondoAzul),
}

/** Tarjeta del DS: radio 16, padding 16. Con [onClick] toda la tarjeta es tocable. */
@Composable
fun Tarjeta(
    modifier: Modifier = Modifier,
    tono: Tono = Tono.Blanca,
    relleno: PaddingValues = PaddingValues(AlcanciaDimen.Space16),
    espacio: Dp = AlcanciaDimen.Space12,
    onClick: (() -> Unit)? = null,
    contenido: @Composable ColumnScope.() -> Unit,
) {
    val forma = RoundedCornerShape(AlcanciaDimen.Radius16)
    Column(
        modifier
            .fillMaxWidth()
            .clip(forma)
            .background(tono.fondo)
            .then(if (tono == Tono.Blanca) Modifier.border(AlcanciaDimen.BorderWidth, AlcanciaColor.Borde, forma) else Modifier)
            .then(if (onClick != null) Modifier.clickable(role = Role.Button, onClick = onClick) else Modifier)
            .padding(relleno),
        verticalArrangement = Arrangement.spacedBy(espacio),
        content = contenido,
    )
}

enum class TonoTile(val fondo: Color, val icono: Color) {
    Azul(AlcanciaColor.FondoAzul, AlcanciaColor.Principal), Violeta(AlcanciaColor.FondoVioleta, AlcanciaColor.Secundario),
    Naranja(AlcanciaColor.FondoNaranja, AlcanciaColor.Principal), Verde(AlcanciaColor.FondoVerde, AlcanciaColor.Principal),
    Acento(AlcanciaColor.Acento, AlcanciaColor.Texto),
}

/** Cuadrito con icono (40 dp, radio 10). */
@Composable
fun IconTile(icono: String, tono: TonoTile, modifier: Modifier = Modifier, tamano: Dp = 40.dp) {
    Box(modifier.size(tamano).clip(RoundedCornerShape(AlcanciaDimen.Radius10)).background(tono.fondo), contentAlignment = Alignment.Center) {
        Icono(icono, tamano = 20.dp, color = tono.icono)
    }
}

/** Caja azul suave «Ahora tiene ahorrado · S/ 15.00». */
@Composable
fun CajaDato(etiqueta: String, valor: String, modifier: Modifier = Modifier) {
    Row(
        modifier.fillMaxWidth().clip(RoundedCornerShape(AlcanciaDimen.Radius14)).background(AlcanciaColor.FondoAzul).padding(AlcanciaDimen.Space16),
        horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(etiqueta, style = AlcanciaType.secundario, color = AlcanciaColor.TextoSecundario)
        Text(valor, style = AlcanciaType.boton, color = AlcanciaColor.Principal)
    }
}

/** Aviso en línea: crema (informa) o menta [ok] (algo salió bien). */
@Composable
fun Aviso(texto: String, modifier: Modifier = Modifier, ok: Boolean = false, icono: String? = null) {
    Row(
        modifier.fillMaxWidth().clip(RoundedCornerShape(AlcanciaDimen.Radius12)).background(if (ok) AlcanciaColor.FondoVerde else AlcanciaColor.FondoNaranja).padding(AlcanciaDimen.Space12),
        horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8), verticalAlignment = Alignment.CenterVertically,
    ) {
        if (icono != null) Icono(icono, tamano = 20.dp)
        Text(texto, style = AlcanciaType.secundario, modifier = Modifier.weight(1f))
    }
}

/** Línea Resumen: «Cuánto · S/ 10.00». [destacada] pinta el valor en azul (Así quedaría). */
@Composable
fun ListaResumen(filas: List<Pair<String, String>>, modifier: Modifier = Modifier, destacarUltima: Boolean = true) {
    Column(modifier.fillMaxWidth()) {
        Separador()
        filas.forEachIndexed { i, (k, v) ->
            Row(Modifier.fillMaxWidth().padding(vertical = AlcanciaDimen.Space12), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(k, style = AlcanciaType.cuerpo, color = AlcanciaColor.TextoSecundario, modifier = Modifier.weight(1f))
                Text(v, style = AlcanciaType.cuerpo.copy(fontWeight = FontWeight.SemiBold), color = if (destacarUltima && i == filas.lastIndex) AlcanciaColor.Principal else AlcanciaColor.Texto)
            }
            Separador()
        }
    }
}

@Composable
fun Separador(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxWidth().height(AlcanciaDimen.BorderWidth).background(AlcanciaColor.Borde))
}
