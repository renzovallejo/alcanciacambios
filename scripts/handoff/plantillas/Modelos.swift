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

    /// Avance = acumulado / objetivo, entero 0–100. Nunca extrapolar a aprendizaje.
    var porcentaje: Int { targetMinor <= 0 ? 0 : min(100, Int((Double(savedMinor) * 100 / Double(targetMinor)).rounded())) }
    var lograda: Bool { savedMinor >= targetMinor }
}

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
    var reason: String?
    var goalId: String?
    var goalName: String?
}

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
}

// MARK: - Contenido

struct Cuento: Codable, Identifiable { let id: String; let title: String; let topic: Tema; let minutes: Int; let output: String; let text: String; let questions: [String] }
struct Mision: Codable, Identifiable { let id: String; let title: String; let topic: Tema; let summary: String; let materials: [String]; let steps: [String] }
struct Juego: Codable, Identifiable { let id: String; let title: String; let topic: Tema; let players: String; let scenario: String; let roles: [String]; let questions: [String] }
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
