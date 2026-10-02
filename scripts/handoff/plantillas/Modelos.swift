// Modelos de Alcancía (DS v3.4). Equivalen a src/lib/store.tsx, src/lib/content.ts y contratos/dominio.ts.
// Nombres de campo iguales al JSON de 06-datos/semillas: se decodifican con JSONDecoder tal cual.
import Foundation

/// Dinero SIEMPRE en céntimos (Int). S/ 10.00 = 1000. Nunca Double.
typealias Centimos = Int

enum Tema: String, Codable, CaseIterable {
    case ahorrar, gastarBien = "gastar-bien", compartir, ganar
}

enum TipoFlujo: String, Codable { case entrada = "in", salida = "out" }

/// Ids estables de motivo. El texto visible está en Localizable: "motivos.<id>".
enum Motivo {
    static let entrada = ["mesada", "ayuda-en-casa", "cumpleanos", "propina", "buen-comportamiento", "otro"]
    static let salida = ["compra", "regalo", "compartir", "otro"]
}

struct MotivoElegido: Codable, Equatable { var reason: String; var detail: String? }

struct Meta: Codable, Identifiable, Equatable {
    let id: String
    var name: String
    /// "book-open" | "puzzle" | "target" (iconos Lucide).
    var icon: String
    var savedMinor: Centimos
    var targetMinor: Centimos
    /// Llegó al objetivo alguna vez; no se pierde aunque se use la plata.
    var achieved: Bool? = nil

    /// Avance = acumulado / objetivo, entero 0–100. Nunca extrapolar a aprendizaje.
    var porcentaje: Int { targetMinor <= 0 ? 0 : min(100, Int((Double(savedMinor) * 100 / Double(targetMinor)).rounded())) }
    var lograda: Bool { achieved == true || savedMinor >= targetMinor }
    /// Lograda y ya sin plata: «Ya la usaron».
    var usada: Bool { lograda && savedMinor == 0 }
}

/// Quién le envía la plata (solo entradas), en el orden de la pantalla. Texto: "quien.<id>". «otro» exige senderName.
let quienEnvia = ["mama", "papa", "abuela", "abuelo", "tio", "otro"]

struct Movimiento: Codable, Identifiable, Equatable {
    let id: String
    var kind: TipoFlujo
    /// Texto ya resuelto en el prototipo; en la app nativa derivarlo de kind ("movimientos.in" / "movimientos.out").
    var label: String
    var author: String
    /// ISO-8601. Mostrar «hoy», «ayer» o «1 oct».
    var at: String
    /// Positivo en entradas, negativo en salidas.
    var amountMinor: Centimos
    /// Texto visible guardado (compatibilidad). Mostrar desde reasonId ("motivos.<id>") o reasonDetail si es «otro».
    var reason: String?
    var reasonId: String?
    var reasonDetail: String?
    var goalId: String?
    var goalName: String?
    /// De quién viene la plata (solo entradas): ver quienEnvia.
    var senderId: String?
    /// Nombre propio («Tía Rosa»); si existe, se muestra en lugar de la relación.
    var senderName: String?
}

/// Quien usa el celular. relation = id de quienEnvia (sin «otro»).
struct Acompanante: Codable, Equatable { var name: String; var relation: String? }

/// Lo último anotado por tipo: se precarga al empezar y alimenta «Repetir».
struct UltimoRegistro: Codable, Equatable { var amountMinor: Centimos; var reason: MotivoElegido; var goalId: String?; var senderId: String?; var senderName: String? }

struct Momento: Codable, Identifiable, Equatable {
    let id: String
    var title: String?
    var childId: String
    var narrative: String
    var authorId: String
    var authorDisplayName: String
    var recordedAt: String
    var topic: Tema?
}

struct Conversacion: Codable, Identifiable, Equatable { let id: String; var title: String; var recordedAt: String }
struct Felicitacion: Codable, Identifiable, Equatable { let id: String; var message: String; var observationId: String?; var recordedAt: String }

struct Borrador: Codable, Equatable {
    var kind: TipoFlujo = .entrada
    /// Texto tal como lo escribe la persona; se valida con validarMonto().
    var amountInput = "10.00"
    var reason: MotivoElegido?
    var goalId: String?
    var senderId: String?
    var senderName: String?
    /// true = empezó a anotar y no terminó: ofrecer «Seguir / Descartar».
    var active: Bool? = false
}

/// Estado completo de la app (una persona).
struct EstadoApp: Codable, Equatable {
    var childName: String
    var balanceMinor: Centimos
    var goals: [Meta]
    var movements: [Movimiento]
    var draft = Borrador()
    var observations: [Momento]
    var conversations: [Conversacion]
    var celebrations: [Felicitacion]
    var startedTopics: [Tema]
    var activeTopic: Tema?
    /// Paso actual por tema (índice desde 0). Claves: "ahorrar", "gastar-bien"…
    var activityStep: [String: Int] = [:]
    /// Actividades recorridas hasta el final (sin puntaje).
    var finishedTopics: [Tema] = []
    var caregiver: Acompanante?
    /// 0 = domingo … 6 = sábado; nil = sin recordatorio.
    var propinaDay: Int?
    /// El chanchito se conectó alguna vez. Si no, invitar a conectarlo en vez de «Sin conexión».
    var devicePaired = false
    /// Ya vio el aviso completo de honestidad.
    var seenHonesty = false
    /// Claves "in" / "out".
    var last: [String: UltimoRegistro] = [:]
}

// MARK: - Contenido

struct Cuento: Codable, Identifiable { let id: String; let title: String; let topic: Tema; let minutes: Int; let output: String; let text: String; let short: String; let questions: [String] }
struct Mision: Codable, Identifiable { let id: String; let title: String; let topic: Tema; let minutes: Int; let summary: String; let materials: [String]; let steps: [String] }
struct Juego: Codable, Identifiable { let id: String; let title: String; let topic: Tema; let minutes: Int; let players: String; let scenario: String; let roles: [String]; let questions: [String] }
struct PasoActividad: Codable { let kind: String; let id: String; let title: String; let to: String? }
struct Actividad: Codable { let topic: Tema; let title: String; let blurb: String; let steps: [PasoActividad] }

// MARK: - Dinero (regla)

enum ResultadoMonto: Equatable {
    case ok(Centimos)
    /// Clave en Localizable: dinero.errorVacio, dinero.errorSeparador, dinero.errorDecimales, dinero.errorFormato, dinero.errorCero, dinero.errorMaximo
    case error(String)
}

let maximoCentimos: Centimos = 100_000 // S/ 1,000.00 (provisional de producto)

/// Misma regla que src/lib/money.ts (ver 02-especificacion/reglas-de-negocio.md).
func validarMonto(_ input: String) -> ResultadoMonto {
    var text = input.trimmingCharacters(in: .whitespaces)
    if text.hasPrefix("S/") { text = String(text.dropFirst(2)).trimmingCharacters(in: .whitespaces) }
    if text.isEmpty { return .error("dinero.errorVacio") }
    if text.contains(",") && text.contains(".") { return .error("dinero.errorSeparador") }
    let n = text.replacingOccurrences(of: ",", with: ".")
    if n.range(of: #"^\d+(\.\d{0,2})?$"#, options: .regularExpression) == nil {
        return .error(n.range(of: #"^\d+\.\d{3,}$"#, options: .regularExpression) != nil ? "dinero.errorDecimales" : "dinero.errorFormato")
    }
    let partes = n.split(separator: ".", omittingEmptySubsequences: false)
    // Un número enorme no cabe en Int: es mayor que el máximo.
    guard let enteros = Int(partes[0]), enteros <= maximoCentimos / 100 else { return .error("dinero.errorMaximo") }
    let decimales = partes.count > 1 ? Int(String(partes[1]).padding(toLength: 2, withPad: "0", startingAt: 0)) ?? 0 : 0
    let centimos = enteros * 100 + decimales
    if centimos <= 0 { return .error("dinero.errorCero") }
    if centimos > maximoCentimos { return .error("dinero.errorMaximo") }
    return .ok(centimos)
}

/// «S/ 10.00».
func formatoSoles(_ c: Centimos) -> String {
    let a = abs(c)
    return "\(c < 0 ? "-" : "")S/ \(a / 100).\(String(format: "%02d", a % 100))"
}
