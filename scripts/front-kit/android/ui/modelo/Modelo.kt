package pe.alcancia.ui.modelo

/**
 * Estado de UI: lo que cada pantalla necesita para dibujarse, con los textos dinámicos ya resueltos.
 * Tu ViewModel convierte el dominio (06-datos/modelos/Modelos.kt) a estas clases.
 * Dinero siempre en céntimos (Int). S/ 10.50 = 1050.
 */
enum class Flujo { Entrada, Salida }

/** Conectado · SinConexion (ya se conectó antes) · NuncaConectado (cuenta nueva: se invita a conectar, no es error). */
enum class Conexion { Conectado, SinConexion, NuncaConectado }

data class MetaUi(
    val id: String,
    val nombre: String,
    /** Icono Lucide: "book-open" | "puzzle" | "target". */
    val icono: String,
    val guardado: Int,
    val objetivo: Int,
    /** Llegó al objetivo alguna vez (no se pierde aunque se use la plata). */
    val lograda: Boolean = guardado >= objetivo,
    /** Lograda y ya sin plata. */
    val usada: Boolean = false,
) {
    /** 0–100, entero. La barra nunca va sola: siempre con «S/ X de S/ Y». */
    val porcentaje: Int get() = if (objetivo <= 0) 0 else minOf(100, Math.round(guardado * 100f / objetivo))
}

data class MovimientoUi(
    val id: String,
    val flujo: Flujo,
    /** Siempre positivo; el signo lo pone la UI según el flujo. */
    val centimos: Int,
    /** Entradas: quién envió (Abuela, Tío Jorge). Salidas: quién lo hizo. */
    val quien: String,
    /** «hoy», «ayer», «30 sep». */
    val cuando: String,
    val motivo: String,
    val meta: String? = null,
)

data class MesUi(val titulo: String, val entro: Int, val salio: Int, val movimientos: List<MovimientoUi>)

/** Pantalla Alcancía (inicio). */
data class AlcanciaUi(
    val nombre: String,
    val conexion: Conexion,
    val saldo: Int,
    /** Entradas de los últimos 7 días (0 = no se muestra la línea). */
    val estaSemana: Int = 0,
    val metas: List<MetaUi> = emptyList(),
    /** Los 2 últimos. */
    val movimientos: List<MovimientoUi> = emptyList(),
    /** Monto del borrador a medias (null = no hay). */
    val borrador: Int? = null,
    /** Nombre del día si hoy es día de propina y aún no la guardan (null = sin aviso). */
    val diaPropina: String? = null,
    /** Idea de 1 minuto del día. */
    val idea: String? = null,
) {
    val primerDia: Boolean get() = saldo == 0 && metas.isEmpty() && movimientos.isEmpty()
}

/** Una opción elegible (motivo, quién envía): id + icono; el texto sale de es.json. */
data class Opcion(val id: String, val icono: String)
