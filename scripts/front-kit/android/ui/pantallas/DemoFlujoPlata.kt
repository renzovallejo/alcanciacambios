package pe.alcancia.ui.pantallas

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import pe.alcancia.ui.dinero.Monto
import pe.alcancia.ui.dinero.validarMonto
import pe.alcancia.ui.i18n.t
import pe.alcancia.ui.modelo.AlcanciaUi
import pe.alcancia.ui.modelo.Flujo
import pe.alcancia.ui.modelo.MovimientoUi

/**
 * Ejemplo completo y funcional de cómo cablear Alcancía + el flujo de plata con estado local.
 * En la app real este estado vive en tu ViewModel; las pantallas no cambian.
 * Úsalo en una Activity de prueba: setContent { AlcanciaTheme { DemoFlujoPlata(Ejemplos.semana) } }
 */
@Composable
fun DemoFlujoPlata(inicial: AlcanciaUi) {
    var estado by remember { mutableStateOf(inicial) }
    var paso by remember { mutableStateOf(0) } // 0 Alcancía · 1 Cuánto · 2 Motivo · 3 Quién · 4 Listo
    var flujo by remember { mutableStateOf(Flujo.Entrada) }
    var monto by remember { mutableStateOf("10.00") }
    var motivo by remember { mutableStateOf<String?>("mesada") }   // se recuerda de la última vez
    var detalle by remember { mutableStateOf("") }
    var meta by remember { mutableStateOf<String?>(null) }
    var quien by remember { mutableStateOf<String?>("mama") }      // por defecto, quien administra la cuenta
    var otro by remember { mutableStateOf("") }
    var saldoAntes by remember { mutableStateOf(estado.saldo) }
    var nuevo by remember { mutableStateOf<String?>(null) }
    var lograda by remember { mutableStateOf<String?>(null) }
    val centimos = (validarMonto(monto) as? Monto.Ok)?.centimos ?: 0
    val motivoTexto = if (motivo == "otro") detalle else motivo?.let { t("motivos.$it") } ?: ""
    val quienTexto = if (quien == "otro") otro else quien?.let { t("quien.$it") } ?: ""

    fun guardar() {
        val signo = if (flujo == Flujo.Entrada) 1 else -1
        val m = estado.metas.find { it.id == meta }
        lograda = if (flujo == Flujo.Entrada && m != null && m.guardado < m.objetivo && m.guardado + centimos >= m.objetivo) m.nombre else null
        val id = "n${System.nanoTime()}"
        saldoAntes = estado.saldo
        estado = estado.copy(
            saldo = estado.saldo + signo * centimos,
            metas = estado.metas.map { if (it.id == meta) it.copy(guardado = maxOf(0, it.guardado + signo * centimos)).let { g -> g.copy(lograda = g.lograda || g.guardado >= g.objetivo) } else it },
            movimientos = (listOf(MovimientoUi(id, flujo, centimos, quien = if (flujo == Flujo.Entrada) quienTexto else "Mamá", cuando = "hoy", motivo = motivoTexto, meta = m?.nombre)) + estado.movimientos).take(2),
        )
        nuevo = id
        paso = 4
    }

    when (paso) {
        0 -> AlcanciaPantalla(estado, AccionesAlcancia(
            onAgregar = { flujo = Flujo.Entrada; monto = "10.00"; paso = 1 },
            onSacar = { flujo = Flujo.Salida; monto = "5.00"; motivo = null; paso = 1 },
        ), saldoAnterior = saldoAntes, nuevoId = nuevo)
        1 -> CuantoPantalla(flujo, estado.nombre, estado.saldo, monto, { monto = it }, onCerrar = { paso = 0 }, onContinuar = { paso = 2 })
        2 -> MotivoPantalla(flujo, estado.nombre, centimos, estado.saldo, motivo, detalle, { motivo = it }, { detalle = it }, estado.metas, meta, { meta = it },
            onAtras = { paso = 1 }, onContinuar = { if (flujo == Flujo.Entrada) paso = 3 else guardar() })
        3 -> QuienPantalla(centimos, estado.saldo, motivoTexto, estado.metas.find { it.id == meta }?.nombre, quien, otro, { quien = it }, { otro = it },
            onAtras = { paso = 2 }, onConfirmar = { guardar() }, relacionAdmin = "mama")
        else -> ListoPantalla(flujo, estado.nombre, estado.saldo, onVolver = { paso = 0 }, metaLograda = lograda)
    }
}
