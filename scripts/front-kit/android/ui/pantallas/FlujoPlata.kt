package pe.alcancia.ui.pantallas

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import pe.alcancia.ui.componentes.*
import pe.alcancia.ui.dinero.Monto
import pe.alcancia.ui.dinero.formatoSoles
import pe.alcancia.ui.dinero.validarMonto
import pe.alcancia.ui.i18n.t
import pe.alcancia.ui.modelo.Catalogo
import pe.alcancia.ui.modelo.Flujo
import pe.alcancia.ui.modelo.MetaUi
import pe.alcancia.ui.theme.AlcanciaColor
import pe.alcancia.ui.theme.AlcanciaDimen
import pe.alcancia.ui.theme.AlcanciaType

/*
 * Flujo de plata.
 *  Agregar: Cuánto → ¿De dónde salió? → ¿Quién le envía? (+ resumen y «Sí, guardar») → ¡Listo!   (4 pasos)
 *  Sacar:   Cuánto → ¿En qué la va a usar? (+ resumen y «Sí, sacar») → ¡Listo!                   (3 pasos)
 * Pantallas sin estado propio de negocio: reciben el borrador y avisan cambios. Ver DemoFlujoPlata para cablearlas.
 */

private val Flujo.k get() = if (this == Flujo.Entrada) "in" else "out"
@Composable private fun tf(flujo: Flujo, clave: String, vararg a: Pair<String, Any>) = t("flujo.${flujo.k}.$clave", *a)
@Composable private fun pasos(flujo: Flujo) = (if (flujo == Flujo.Entrada) Catalogo.PASOS_ENTRADA else Catalogo.PASOS_SALIDA).map { t(it) }

@Composable
private fun Titulo(texto: String) = Text(texto, style = AlcanciaType.tituloPantalla, modifier = Modifier.semantics { heading() })

/** Valida el texto del monto. En salidas no puede pasar lo ahorrado ni lo que tiene la meta de origen. */
@Composable
fun errorDeMonto(texto: String, flujo: Flujo, saldo: Int, metaOrigen: MetaUi? = null): String? = when (val m = validarMonto(texto)) {
    is Monto.Error -> t(m.clave, *m.args.toTypedArray())
    is Monto.Ok -> when {
        flujo == Flujo.Salida && m.centimos > saldo -> t("dinero.errorNoAlcanza", "monto" to formatoSoles(saldo))
        flujo == Flujo.Salida && metaOrigen != null && m.centimos > metaOrigen.guardado -> t("dinero.errorMetaNoAlcanza", "meta" to metaOrigen.nombre, "monto" to formatoSoles(metaOrigen.guardado))
        else -> null
    }
}

/** Paso 1 · Cuánto · /saldo/importe · capturas 53 (agregar), 59 (sacar, no alcanza), 07 (error). */
@Composable
fun CuantoPantalla(flujo: Flujo, nombre: String, saldo: Int, monto: String, onMonto: (String) -> Unit, onCerrar: () -> Unit, onContinuar: () -> Unit, metaOrigen: MetaUi? = null) {
    var tocado by remember { mutableStateOf(false) }
    val error = errorDeMonto(monto, flujo, saldo, metaOrigen)
    val centimos = (validarMonto(monto) as? Monto.Ok)?.centimos
    PantallaTarea(
        tf(flujo, "titulo"), onCerrar, cerrar = true, ayudaPie = t("flujo.pieCuanto"),
        pie = { Boton(t("comun.continuar"), { tocado = true; if (error == null) onContinuar() }, Modifier.fillMaxWidth(), habilitado = error == null) },
    ) {
        IndicadorPasos(1, pasos(flujo))
        Titulo(tf(flujo, "pregunta"))
        Text(tf(flujo, "sub", "nombre" to nombre), style = AlcanciaType.cuerpo, color = AlcanciaColor.TextoSecundario)
        CajaDato(t("flujo.ahoraTieneAhorrado"), formatoSoles(saldo))
        CampoMonto(monto, { tocado = true; onMonto(it) }, t("flujo.cuanto"), t("flujo.tocaMonto"), if (tocado) error else null)
        Text(t("flujo.rapido"), style = AlcanciaType.cuerpo, color = AlcanciaColor.TextoSecundario)
        MontosRapidos(Catalogo.MONTOS_RAPIDOS, centimos, { tocado = false; onMonto("%d.%02d".format(it / 100, it % 100)) })
        if (centimos != null && error == null) {
            val despues = saldo + if (flujo == Flujo.Entrada) centimos else -centimos
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text(t("flujo.asiQuedaria"), style = AlcanciaType.cuerpo, color = AlcanciaColor.TextoSecundario, modifier = Modifier.weight(1f))
                Text(formatoSoles(despues), style = AlcanciaType.seccion, color = AlcanciaColor.Principal)
            }
        }
    }
}

/** Metas como tarjetas a la vista (no desplegable). En salidas, solo metas con plata; en entradas, no las ya usadas. */
@Composable
fun EleccionMeta(flujo: Flujo, metas: List<MetaUi>, elegida: String?, onElegir: (String?) -> Unit) {
    Text(tf(flujo, "paraMeta"), style = AlcanciaType.seccion, modifier = Modifier.semantics { heading() })
    Column(Modifier.selectableGroup(), verticalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8)) {
        OpcionFila(t("flujo.ningunaMeta"), Ic.Wallet, elegida == null, { onElegir(null) }, subtitulo = tf(flujo, "sinMeta"), conRadio = false)
        metas.filter { if (flujo == Flujo.Entrada) !it.usada else it.guardado > 0 }.forEach { g ->
            OpcionFila(g.nombre, g.icono, elegida == g.id, { onElegir(g.id) }, subtitulo = t("meta.deObjetivo", "guardado" to formatoSoles(g.guardado), "objetivo" to formatoSoles(g.objetivo)), conRadio = false)
        }
    }
}

/** Paso 2 · ¿De dónde salió? / ¿En qué la va a usar? · /saldo/motivo · capturas 54, 60. En salidas aquí mismo se confirma. */
@Composable
fun MotivoPantalla(
    flujo: Flujo, nombre: String, centimos: Int, saldo: Int,
    motivo: String?, detalle: String, onMotivo: (String) -> Unit, onDetalle: (String) -> Unit,
    metas: List<MetaUi>, meta: String?, onMeta: (String?) -> Unit,
    onAtras: () -> Unit, onContinuar: () -> Unit, enviando: Boolean = false,
) {
    val valido = motivo != null && (motivo != "otro" || detalle.isNotBlank())
    val entrada = flujo == Flujo.Entrada
    PantallaTarea(
        tf(flujo, "titulo"), onAtras, ayudaPie = t(if (entrada) "flujo.pieDeDonde" else "flujo.pieRevisar"),
        pie = { Boton(if (entrada) t("comun.continuar") else tf(flujo, "confirmar"), onContinuar, Modifier.fillMaxWidth(), habilitado = valido, cargando = enviando) },
    ) {
        IndicadorPasos(2, pasos(flujo))
        Titulo(tf(flujo, "deDonde"))
        Text(tf(flujo, "resumen", "monto" to formatoSoles(centimos), "nombre" to nombre), style = AlcanciaType.cuerpo, color = AlcanciaColor.TextoSecundario)
        GrillaOpciones(if (entrada) Catalogo.MOTIVOS_ENTRADA else Catalogo.MOTIVOS_SALIDA, motivo, { t("motivos.${it.id}") }, { onMotivo(it.id) })
        if (motivo == "otro") CampoTexto(detalle, onDetalle, t("flujo.otroCampo"))
        EleccionMeta(flujo, metas, meta, onMeta)
        if (!entrada && valido) {
            Text(t("flujo.resumen"), style = AlcanciaType.seccion)
            ListaResumen(resumen(flujo, centimos, saldo, t("motivos.$motivo").takeIf { motivo != "otro" } ?: detalle, null, metas.find { it.id == meta }?.nombre))
        }
    }
}

@Composable
private fun resumen(flujo: Flujo, c: Int, saldo: Int, motivo: String, quien: String?, meta: String?) = buildList {
    add(t("flujo.revisarCuanto") to formatoSoles(c))
    add(t("flujo.revisarPorQue") to motivo)
    if (quien != null) add(t("flujo.revisarQuien") to quien)
    add(t("flujo.revisarMeta") to (meta ?: t("comun.ninguna")))
    add(t("flujo.asiQuedaria") to formatoSoles(saldo + if (flujo == Flujo.Entrada) c else -c))
}

/**
 * Paso 3 (solo agregar) · ¿Quién le envía? · /saldo/quien · captura 55.
 * [relacionAdmin]: relación de quien administra la cuenta (sale «Administra la cuenta» debajo).
 */
@Composable
fun QuienPantalla(
    centimos: Int, saldo: Int, motivoTexto: String, metaNombre: String?,
    quien: String?, nombreOtro: String, onQuien: (String) -> Unit, onNombreOtro: (String) -> Unit,
    onAtras: () -> Unit, onConfirmar: () -> Unit, relacionAdmin: String? = null, enviando: Boolean = false,
) {
    val valido = quien != null && (quien != "otro" || nombreOtro.isNotBlank())
    PantallaTarea(
        t("flujo.in.titulo"), onAtras, ayudaPie = t("flujo.pieRevisar"),
        pie = { Boton(t("flujo.in.confirmar"), onConfirmar, Modifier.fillMaxWidth(), habilitado = valido, cargando = enviando) },
    ) {
        IndicadorPasos(3, pasos(Flujo.Entrada))
        Titulo(t("quien.titulo"))
        Text(t("quien.sub"), style = AlcanciaType.cuerpo, color = AlcanciaColor.TextoSecundario)
        Column(Modifier.selectableGroup(), verticalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space8)) {
            Catalogo.QUIEN_ENVIA.forEach { p ->
                OpcionFila(t("quien.${p.id}"), p.icono, quien == p.id, { onQuien(p.id) }, subtitulo = if (relacionAdmin == p.id) t("quien.admin") else null)
            }
        }
        if (quien == "otro") CampoTexto(nombreOtro, onNombreOtro, t("quien.otroCampo"), ejemplo = t("quien.otroEjemplo"), maximo = 30)
        if (valido) {
            Text(t("flujo.resumen"), style = AlcanciaType.seccion)
            ListaResumen(resumen(Flujo.Entrada, centimos, saldo, motivoTexto, if (quien == "otro") nombreOtro else t("quien.$quien"), metaNombre))
        }
    }
}

/**
 * Último paso · ¡Listo! · /saldo/listo · capturas 56, 57.
 * [metaLograda]: nombre de la meta que se completó con esta plata. [diaRecordatorio]: ofrece el recordatorio de propina.
 * No se puede volver atrás: al salir, reemplaza la pila de navegación.
 */
@Composable
fun ListoPantalla(
    flujo: Flujo, nombre: String, saldo: Int, onVolver: () -> Unit,
    metaLograda: String? = null, diaRecordatorio: String? = null, onRecordar: (Boolean) -> Unit = {},
) {
    var moneda by remember { mutableStateOf(false) }
    var recordatorio by remember { mutableStateOf(if (diaRecordatorio != null) 0 else -1) } // 0 = pregunta, 1 = sí, -1 = nada
    PantallaTarea(tf(flujo, "titulo"), onAtras = null, ayudaPie = t("flujo.pieListo"), pie = { Boton(t("flujo.volverAlcancia"), onVolver, Modifier.fillMaxWidth()) }) {
        val p = pasos(flujo)
        IndicadorPasos(p.size, p)
        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(AlcanciaDimen.Space12)) {
            Spacer(Modifier.height(24.dp))
            IconoExito()
            Text(tf(flujo, "listo"), style = AlcanciaType.tituloPantalla, textAlign = TextAlign.Center, modifier = Modifier.semantics { heading() })
            Text(tf(flujo, "ahora", "nombre" to nombre, "monto" to formatoSoles(saldo)), style = AlcanciaType.cuerpo, color = AlcanciaColor.TextoSecundario, textAlign = TextAlign.Center)
            if (metaLograda != null) Aviso(t("flujo.metaAlcanzada", "meta" to metaLograda), ok = true, icono = Ic.PartyPopper)
            if (flujo == Flujo.Entrada) {
                Text(t("flujo.nino", "nombre" to nombre), style = AlcanciaType.secundario, color = AlcanciaColor.TextoSecundario, textAlign = TextAlign.Center)
                MonedaAlChanchito(t("flujo.ninoBoton"), { moneda = true })
                if (moneda) Text(t("flujo.ninoListo"), style = AlcanciaType.secundario)
            }
            if (diaRecordatorio != null && recordatorio == 0) {
                Tarjeta(tono = Tono.Crema) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icono(Ic.Bell, tamano = 18.dp)
                        Text(t("flujo.recordarTitulo", "dia" to diaRecordatorio), style = AlcanciaType.cuerpo)
                    }
                    ParDeBotones {
                        Boton(t("flujo.recordarSi"), { recordatorio = 1; onRecordar(true) }, Modifier.weight(1f), Variante.Secundario, compacto = true)
                        Boton(t("flujo.recordarNo"), { recordatorio = -1; onRecordar(false) }, Modifier.weight(1f), Variante.Terciario, compacto = true)
                    }
                }
            }
            if (diaRecordatorio != null && recordatorio == 1) Aviso(t("flujo.recordarListo", "dia" to diaRecordatorio), ok = true)
        }
    }
}
