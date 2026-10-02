package pe.alcancia.ui.componentes

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import pe.alcancia.ui.tema.AlcanciaExtra
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaDimen
import pe.alcancia.ui.theme.AlcanciaType

/**
 * Campo de monto grande (36 sp, prefijo «S/», teclado decimal).
 * Al enfocarlo se selecciona todo: se escribe encima sin borrar a mano.
 * [error] aparece debajo, junto al campo; si es null se muestra [ayuda].
 */
@Composable
fun CampoMonto(valor: String, onCambio: (String) -> Unit, etiqueta: String, ayuda: String, error: String?, modifier: Modifier = Modifier) {
    var campo by remember { mutableStateOf(TextFieldValue(valor)) }
    if (campo.text != valor) campo = TextFieldValue(valor, TextRange(valor.length))
    val forma = RoundedCornerShape(AlcanciaDimen.Radius14)
    val color = if (error != null) AlcanciaExtra.Error else AlcanciaColor.Principal
    Column(modifier, verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(etiqueta, style = AlcanciaType.boton)
        Row(
            Modifier.fillMaxWidth().defaultMinSize(minHeight = 72.dp).clip(forma)
                .background(if (error != null) AlcanciaColor.FondoRojo else AlcanciaColor.Base)
                .border(1.5.dp, color, forma).padding(horizontal = AlcanciaDimen.Space16),
            horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("S/", style = AlcanciaType.importe)
            BasicTextField(
                value = campo,
                onValueChange = { campo = it; onCambio(it.text) },
                textStyle = AlcanciaType.importe.copy(color = AlcanciaColor.Texto),
                singleLine = true,
                cursorBrush = SolidColor(AlcanciaColor.Principal),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                modifier = Modifier.weight(1f)
                    .onFocusChanged { if (it.isFocused) campo = campo.copy(selection = TextRange(0, campo.text.length)) }
                    .semantics { contentDescription = etiqueta; if (error != null) error(error) },
            )
        }
        Text(error ?: ayuda, style = AlcanciaType.secundario, color = if (error != null) AlcanciaExtra.Error else AlcanciaColor.TextoSecundario)
    }
}

/** Campo de texto simple con etiqueta arriba y error debajo. */
@Composable
fun CampoTexto(valor: String, onCambio: (String) -> Unit, etiqueta: String, modifier: Modifier = Modifier, ejemplo: String? = null, error: String? = null, maximo: Int = 60) {
    val forma = RoundedCornerShape(AlcanciaDimen.Radius12)
    Column(modifier, verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(etiqueta, style = AlcanciaType.boton)
        Box(
            Modifier.fillMaxWidth().defaultMinSize(minHeight = AlcanciaDimen.ControlHeight).clip(forma)
                .border(AlcanciaDimen.BorderWidth, if (error != null) AlcanciaExtra.Error else AlcanciaColor.TextoSecundario, forma)
                .padding(horizontal = AlcanciaDimen.Space16),
            contentAlignment = Alignment.CenterStart,
        ) {
            if (valor.isEmpty() && ejemplo != null) Text(ejemplo, style = AlcanciaType.relato, color = AlcanciaColor.TextoSecundario)
            BasicTextField(
                value = valor, onValueChange = { if (it.length <= maximo) onCambio(it) }, singleLine = true,
                textStyle = AlcanciaType.relato.copy(color = AlcanciaColor.Texto), cursorBrush = SolidColor(AlcanciaColor.Principal),
                modifier = Modifier.fillMaxWidth().semantics { contentDescription = etiqueta; if (error != null) error(error) },
            )
        }
        if (error != null) Text(error, style = AlcanciaType.secundario, color = AlcanciaExtra.Error)
    }
}
