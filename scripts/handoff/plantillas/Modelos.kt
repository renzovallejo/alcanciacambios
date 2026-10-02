// Modelos de Alcancía (DS v3.4). Equivalen a src/lib/store.tsx, src/lib/content.ts y contratos/dominio.ts.
// Nombres de campo iguales al JSON de 06-datos/semillas: se pueden leer con kotlinx.serialization tal cual.
package pe.alcancia.modelo

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Dinero SIEMPRE en céntimos (Int). S/ 10.00 = 1000. Nunca Double/Float. */
typealias Centimos = Int

@Serializable enum class Tema {
    @SerialName("ahorrar") AHORRAR,
    @SerialName("gastar-bien") GASTAR_BIEN,
    @SerialName("compartir") COMPARTIR,
    @SerialName("ganar") GANAR,
}

@Serializable enum class TipoFlujo { @SerialName("in") ENTRADA, @SerialName("out") SALIDA }

/** Ids estables de motivo. El texto visible está en strings: motivos_<id>. */
object Motivo {
    val ENTRADA = listOf("mesada", "ayuda-en-casa", "cumpleanos", "propina", "buen-comportamiento", "otro")
    val SALIDA = listOf("compra", "regalo", "compartir", "otro")
}

/** Quién le envía la plata (solo entradas), en el orden de la pantalla. Texto: quien_<id>. «otro» exige senderName. */
object QuienEnvia {
    val TODOS = listOf("mama", "papa", "abuela", "abuelo", "tio", "otro")
}

@Serializable data class MotivoElegido(val reason: String, val detail: String? = null)

@Serializable data class Meta(
    val id: String,
    val name: String,
    /** "book-open" | "puzzle" | "target" (iconos Lucide). */
    val icon: String,
    val savedMinor: Centimos,
    val targetMinor: Centimos,
    /** Llegó al objetivo alguna vez; no se pierde aunque se use la plata. */
    val achieved: Boolean = false,
) {
    /** Avance = acumulado / objetivo, entero 0–100. Nunca extrapolar a aprendizaje. */
    val porcentaje: Int get() = if (targetMinor <= 0) 0 else minOf(100, Math.round(savedMinor * 100f / targetMinor))
    val lograda: Boolean get() = achieved || savedMinor >= targetMinor
    /** Lograda y ya sin plata: «Ya la usaron». No se ofrece para agregar. */
    val usada: Boolean get() = lograda && savedMinor == 0
}

@Serializable data class Movimiento(
    val id: String,
    val kind: TipoFlujo,
    /** Texto ya resuelto en el prototipo; en la app nativa derivarlo de kind (movimientos_in / movimientos_out). */
    val label: String,
    val author: String,
    /** ISO-8601. Mostrar «hoy», «ayer» o «1 oct». */
    val at: String,
    /** Positivo en entradas, negativo en salidas. */
    val amountMinor: Centimos,
    /** Texto visible guardado (compatibilidad). Mostrar desde reasonId: motivos_<id>, o reasonDetail si es «otro». */
    val reason: String? = null,
    val reasonId: String? = null,
    val reasonDetail: String? = null,
    val goalId: String? = null,
    val goalName: String? = null,
    /** De quién viene la plata (solo entradas): ver QuienEnvia. */
    val senderId: String? = null,
    /** Nombre propio («Tía Rosa»). Si existe, se muestra en lugar de la relación. */
    val senderName: String? = null,
)

/** Quien usa el celular. relation = id de QuienEnvia (sin «otro»). */
@Serializable data class Acompanante(val name: String, val relation: String? = null)

/** Lo último anotado por tipo: se precarga al empezar y alimenta «Repetir». */
@Serializable data class UltimoRegistro(
    val amountMinor: Centimos,
    val reason: MotivoElegido,
    val goalId: String? = null,
    val senderId: String? = null,
    val senderName: String? = null,
)

@Serializable data class Momento(
    val id: String,
    val title: String? = null,
    val childId: String,
    val narrative: String,
    val authorId: String,
    val authorDisplayName: String,
    val recordedAt: String,
    val topic: Tema? = null,
)

@Serializable data class Conversacion(val id: String, val title: String, val recordedAt: String)
@Serializable data class Felicitacion(val id: String, val message: String, val observationId: String? = null, val recordedAt: String)

@Serializable data class Borrador(
    val kind: TipoFlujo = TipoFlujo.ENTRADA,
    /** Texto tal como lo escribe la persona; se valida con validarMonto(). */
    val amountInput: String = "10.00",
    val reason: MotivoElegido? = null,
    val goalId: String? = null,
    val senderId: String? = null,
    val senderName: String? = null,
    /** true = empezó a anotar y no terminó: ofrecer «Seguir / Descartar». */
    val active: Boolean = false,
)

/** Estado completo de la app (una persona). */
@Serializable data class EstadoApp(
    val childName: String,
    val balanceMinor: Centimos,
    val goals: List<Meta>,
    val movements: List<Movimiento>,
    val draft: Borrador = Borrador(),
    val observations: List<Momento>,
    val conversations: List<Conversacion>,
    val celebrations: List<Felicitacion>,
    val startedTopics: List<Tema>,
    val activeTopic: Tema? = null,
    /** Paso actual por tema (índice desde 0). */
    val activityStep: Map<Tema, Int> = emptyMap(),
    /** Actividades recorridas hasta el final (sin puntaje). */
    val finishedTopics: List<Tema> = emptyList(),
    val caregiver: Acompanante? = null,
    /** 0 = domingo … 6 = sábado; null = sin recordatorio. */
    val propinaDay: Int? = null,
    /** El chanchito se conectó alguna vez. Si no, invitar a conectarlo en vez de «Sin conexión». */
    val devicePaired: Boolean = false,
    /** Ya vio el aviso completo de honestidad. */
    val seenHonesty: Boolean = false,
    /** Claves "in" / "out". */
    val last: Map<String, UltimoRegistro> = emptyMap(),
)

/* --------------------------------------------------------------- contenido */

@Serializable data class Cuento(val id: String, val title: String, val topic: Tema, val minutes: Int, val output: String, val text: String, val short: String, val questions: List<String>)
@Serializable data class Mision(val id: String, val title: String, val topic: Tema, val minutes: Int, val summary: String, val materials: List<String>, val steps: List<String>)
@Serializable data class Juego(val id: String, val title: String, val topic: Tema, val minutes: Int, val players: String, val scenario: String, val roles: List<String>, val questions: List<String>)
@Serializable data class PasoActividad(val kind: String, val id: String, val title: String, val to: String? = null)
@Serializable data class Actividad(val topic: Tema, val title: String, val blurb: String, val steps: List<PasoActividad>)

/* ------------------------------------------------------------ dinero (regla) */

sealed interface ResultadoMonto {
    data class Ok(val centimos: Centimos) : ResultadoMonto
    /** clave de string: dinero_error_vacio, dinero_error_separador, dinero_error_decimales, dinero_error_formato, dinero_error_cero, dinero_error_maximo */
    data class Error(val clave: String) : ResultadoMonto
}

const val MAXIMO_CENTIMOS: Centimos = 100_000 // S/ 1,000.00 (provisional de producto)

/** Misma regla que src/lib/money.ts (ver 02-especificacion/reglas-de-negocio.md). */
fun validarMonto(input: String): ResultadoMonto {
    val text = input.trim().removePrefix("S/").trim()
    if (text.isEmpty()) return ResultadoMonto.Error("dinero_error_vacio")
    if (text.contains(',') && text.contains('.')) return ResultadoMonto.Error("dinero_error_separador")
    val n = text.replace(',', '.')
    if (!Regex("""^\d+(\.\d{0,2})?$""").matches(n)) {
        return ResultadoMonto.Error(if (Regex("""^\d+\.\d{3,}$""").matches(n)) "dinero_error_decimales" else "dinero_error_formato")
    }
    val partes = n.split('.')
    // Long + límite antes de convertir: un número enorme no debe desbordar.
    val enteros = partes[0].toLongOrNull() ?: return ResultadoMonto.Error("dinero_error_maximo")
    val centimos = enteros * 100 + partes.getOrElse(1) { "" }.padEnd(2, '0').toLong()
    if (centimos <= 0) return ResultadoMonto.Error("dinero_error_cero")
    if (centimos > MAXIMO_CENTIMOS) return ResultadoMonto.Error("dinero_error_maximo")
    return ResultadoMonto.Ok(centimos.toInt())
}

/** «S/ 10.00». */
fun formatoSoles(c: Centimos): String {
    val signo = if (c < 0) "-" else ""
    val a = Math.abs(c)
    return "${signo}S/ ${a / 100}.${(a % 100).toString().padStart(2, '0')}"
}
