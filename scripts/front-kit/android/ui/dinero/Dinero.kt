package pe.alcancia.ui.dinero

/**
 * Regla de montos, idéntica a src/lib/money.ts. Probar con 06-datos/casos-de-prueba/dinero.json.
 * Nunca Double/Float: céntimos enteros.
 */
const val MAXIMO_CENTIMOS = 100_000 // S/ 1,000.00 (provisional de producto)

/** 1050 → «S/ 10.50»; -500 → «-S/ 5.00». */
fun formatoSoles(centimos: Int): String {
    val signo = if (centimos < 0) "-" else ""
    val abs = kotlin.math.abs(centimos)
    return "${signo}S/ ${abs / 100}.${(abs % 100).toString().padStart(2, '0')}"
}

/** Montos rápidos sin decimales: 500 → «S/ 5». */
fun formatoCorto(centimos: Int): String = formatoSoles(centimos).removeSuffix(".00")

sealed interface Monto {
    data class Ok(val centimos: Int) : Monto
    /** clave = texto de error en es.json (dinero.errorVacio…); args = variables del texto. */
    data class Error(val clave: String, val args: List<Pair<String, Any>> = emptyList()) : Monto
}

fun validarMonto(entrada: String): Monto {
    val texto = entrada.trim().replace(Regex("^S/\\s*", RegexOption.IGNORE_CASE), "")
    if (texto.isEmpty()) return Monto.Error("dinero.errorVacio")
    if (texto.contains(',') && texto.contains('.')) return Monto.Error("dinero.errorSeparador")
    val n = texto.replace(',', '.')
    if (!Regex("^\\d+(\\.\\d{0,2})?$").matches(n)) {
        return if (Regex("^\\d+\\.\\d{3,}$").matches(n)) Monto.Error("dinero.errorDecimales") else Monto.Error("dinero.errorFormato")
    }
    val partes = n.split('.')
    val entero = partes[0].toLongOrNull() ?: return Monto.Error("dinero.errorMaximo", listOf("monto" to formatoSoles(MAXIMO_CENTIMOS)))
    val frac = partes.getOrElse(1) { "" }.padEnd(2, '0').toLong()
    val c = entero * 100 + frac
    if (c <= 0) return Monto.Error("dinero.errorCero")
    if (c > MAXIMO_CENTIMOS) return Monto.Error("dinero.errorMaximo", listOf("monto" to formatoSoles(MAXIMO_CENTIMOS)))
    return Monto.Ok(c.toInt())
}
