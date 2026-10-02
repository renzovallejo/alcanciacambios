package pe.alcancia.ui.pantallas

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import pe.alcancia.ui.componentes.*
import pe.alcancia.ui.dinero.formatoSoles
import pe.alcancia.ui.i18n.t
import pe.alcancia.ui.modelo.AlcanciaUi
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaDimen
import pe.alcancia.ui.theme.AlcanciaType

/** Todo lo que se puede tocar en Alcancía. Por defecto no hace nada: conecta solo lo que necesites. */
data class AccionesAlcancia(
    val onAjustes: () -> Unit = {}, val onPersona: () -> Unit = {}, val onConexion: () -> Unit = {},
    val onAgregar: () -> Unit = {}, val onSacar: () -> Unit = {},
    val onSeguirBorrador: () -> Unit = {}, val onDescartarBorrador: () -> Unit = {}, val onGuardarPropina: () -> Unit = {},
    val onVerMetas: () -> Unit = {}, val onMeta: (String) -> Unit = {}, val onPonerMeta: () -> Unit = {},
    val onVerMovimientos: () -> Unit = {}, val onMovimiento: (String) -> Unit = {},
    val onIdeaHecha: () -> Unit = {},
)

/**
 * Alcancía (inicio) · ruta web «/» · captura 01 (primer día) y 13 (semana).
 * [saldoAnterior]: pásale el saldo que vio la persona antes de guardar/sacar para que el monto cuente hasta el nuevo.
 * [nuevoId]: id del movimiento recién guardado (se resalta).
 */
@Composable
fun AlcanciaPantalla(estado: AlcanciaUi, acciones: AccionesAlcancia = AccionesAlcancia(), saldoAnterior: Int = estado.saldo, nuevoId: String? = null) {
    var saltos by remember { mutableStateOf(0) }
    PantallaPestana {
        EncabezadoPantalla(t("nav.alcancia"), acciones.onAjustes)
        FilaContexto(estado.nombre, estado.conexion, acciones.onPersona, acciones.onConexion)
        TarjetaSaldo(estado.nombre, estado.saldo, saldoAnterior = saldoAnterior, estaSemana = estado.estaSemana, saltos = saltos, onTocarChanchito = { saltos++ })

        when {
            estado.borrador != null -> Banner(Ic.Pause, t("alcancia.borrador", "monto" to formatoSoles(estado.borrador))) {
                Boton(t("alcancia.borradorDescartar"), acciones.onDescartarBorrador, variante = Variante.Terciario)
                Boton(t("alcancia.borradorSeguir"), acciones.onSeguirBorrador, variante = Variante.Secundario)
            }
            estado.diaPropina != null -> Banner(Ic.Bell, t("alcancia.recordatorio", "dia" to estado.diaPropina)) {
                Boton(t("alcancia.recordatorioBoton"), acciones.onGuardarPropina, variante = Variante.Secundario)
            }
        }

        if (estado.primerDia) {
            Boton(t("alcancia.primeraPlata"), acciones.onAgregar, Modifier.fillMaxWidth())
        } else {
            ParDeBotones {
                Boton(t("alcancia.agregarPlata"), acciones.onAgregar, Modifier.weight(1f), compacto = true)
                // Sin plata no se ofrece sacar.
                if (estado.saldo > 0) Boton(t("alcancia.sacarPlata"), acciones.onSacar, Modifier.weight(1f), Variante.Secundario, compacto = true)
            }
        }

        EncabezadoSeccion(t("alcancia.susMetas"), accion = if (estado.metas.isNotEmpty()) t("comun.verTodas", "count" to estado.metas.size) else null, onAccion = acciones.onVerMetas)
        if (estado.metas.isEmpty()) {
            Tarjeta(tono = Tono.Crema) {
                Row(horizontalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space12), verticalAlignment = Alignment.CenterVertically) {
                    IconTile(Ic.Target, TonoTile.Acento)
                    Text(t("alcancia.metaVaciaTitulo", "nombre" to estado.nombre), style = AlcanciaType.seccion)
                }
                Boton(t("alcancia.metaVaciaBoton"), acciones.onPonerMeta, Modifier.fillMaxWidth(), Variante.Secundario)
            }
        } else {
            // Orden estable (de creación); las ya usadas no ocupan lugar en la portada.
            Column(verticalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8)) {
                estado.metas.filter { !it.usada }.take(2).forEach { m -> TarjetaMeta(m, { acciones.onMeta(m.id) }) }
            }
        }

        // Sin movimientos no se muestra la sección: no hay nada que ver todavía.
        if (estado.movimientos.isNotEmpty()) {
            EncabezadoSeccion(t("alcancia.loUltimo"), accion = t("comun.verTodos"), onAccion = acciones.onVerMovimientos)
            Column {
                estado.movimientos.forEachIndexed { i, m ->
                    if (i > 0) Separador()
                    FilaMovimiento(m, { acciones.onMovimiento(m.id) }, nuevo = m.id == nuevoId)
                }
                Separador()
            }
        }
    }
}
