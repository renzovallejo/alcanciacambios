package pe.alcancia.ui.pantallas

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import pe.alcancia.ui.componentes.FilaMovimiento
import pe.alcancia.ui.componentes.PantallaTarea
import pe.alcancia.ui.componentes.Separador
import pe.alcancia.ui.dinero.formatoSoles
import pe.alcancia.ui.i18n.t
import pe.alcancia.ui.modelo.MesUi
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaDimen
import pe.alcancia.ui.theme.AlcanciaType

/** Lo que entró y salió · /movimientos · captura 16. Agrupado por mes con «Entró S/ X · Salió S/ Y». */
@Composable
fun MovimientosPantalla(meses: List<MesUi>, onAtras: () -> Unit, onMovimiento: (String) -> Unit) {
    PantallaTarea(t("nav.alcancia"), onAtras) {
        Text(t("movimientos.titulo"), style = AlcanciaType.tituloPantalla, modifier = Modifier.semantics { heading() })
        if (meses.isEmpty()) Text(t("movimientos.vacio"), style = AlcanciaType.cuerpo, color = AlcanciaColor.TextoSecundario)
        meses.forEach { mes ->
            Column {
                Row(Modifier.fillMaxWidth().padding(top = AlcanciaDimen.Space16), horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8), verticalAlignment = Alignment.Bottom) {
                    Text(mes.titulo.replaceFirstChar { it.uppercase() }, style = AlcanciaType.elemento.copy(fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold), modifier = Modifier.weight(1f).semantics { heading() })
                    Text(t("movimientos.mesTotales", "entro" to formatoSoles(mes.entro), "salio" to formatoSoles(mes.salio)), style = AlcanciaType.secundario, color = AlcanciaColor.TextoSecundario)
                }
                mes.movimientos.forEachIndexed { i, m -> if (i > 0) Separador(); FilaMovimiento(m, { onMovimiento(m.id) }) }
                Separador()
            }
        }
    }
}
