import Foundation
import SwiftUI

/**
 Textos: misma clave que es.json / strings.xml (p. ej. "alcancia.agregarPlata").
 Las variables se pasan por nombre y se ordenan como en Localizable.strings (%1$@, %2$@…):
     t("flujo.in.ahora", ["nombre": "Sofía", "monto": "S/ 25.00"])
 */
func t(_ clave: String, _ args: [String: Any] = [:]) -> String {
    let plantilla = NSLocalizedString(clave, comment: "")
    let orden = textoArgs[clave] ?? []
    if orden.isEmpty { return plantilla }
    // Localizable.strings usa %1$@ (texto) para todo, salvo {count} que es %1$d (número).
    let valores: [CVarArg] = orden.map { nombre in
        let v = args[nombre] ?? ""
        if nombre == "count", let n = v as? Int { return n }
        return "\(v)" as NSString
    }
    return String(format: plantilla, locale: Locale(identifier: "es_PE"), arguments: valores)
}

/// Plurales (Localizable.stringsdict): tn("progreso.cosas", 3) → «3 cosas contadas».
func tn(_ clave: String, _ cantidad: Int) -> String {
    String.localizedStringWithFormat(NSLocalizedString(clave, comment: ""), cantidad)
}

/// Regla de montos idéntica a src/lib/money.ts. Probar con 06-datos/casos-de-prueba/dinero.json.
enum Dinero {
    static let maximoCentimos = 100_000 // S/ 1,000.00 (provisional de producto)

    /// 1050 → «S/ 10.50».
    static func soles(_ c: Int) -> String {
        let abs = Swift.abs(c)
        return "\(c < 0 ? "-" : "")S/ \(abs / 100).\(String(format: "%02d", abs % 100))"
    }
    /// 500 → «S/ 5».
    static func corto(_ c: Int) -> String {
        let s = soles(c); return s.hasSuffix(".00") ? String(s.dropLast(3)) : s
    }

    enum Resultado: Equatable {
        case ok(Int)
        /// clave = texto de error (dinero.errorVacio…), args = sus variables.
        case error(String, [String: String])
    }

    static func validar(_ entrada: String) -> Resultado {
        var texto = entrada.trimmingCharacters(in: .whitespaces)
        if let r = texto.range(of: "^S/\\s*", options: [.regularExpression, .caseInsensitive]) { texto.removeSubrange(r) }
        if texto.isEmpty { return .error("dinero.errorVacio", [:]) }
        if texto.contains(",") && texto.contains(".") { return .error("dinero.errorSeparador", [:]) }
        let n = texto.replacingOccurrences(of: ",", with: ".")
        if n.range(of: "^\\d+(\\.\\d{0,2})?$", options: .regularExpression) == nil {
            return n.range(of: "^\\d+\\.\\d{3,}$", options: .regularExpression) != nil ? .error("dinero.errorDecimales", [:]) : .error("dinero.errorFormato", [:])
        }
        let partes = n.split(separator: ".", omittingEmptySubsequences: false)
        let maximo: [String: String] = ["monto": soles(maximoCentimos)]
        guard let entero = Int(partes[0]), entero <= maximoCentimos else { return .error("dinero.errorMaximo", maximo) }
        let frac = partes.count > 1 ? Int(String(partes[1]).padding(toLength: 2, withPad: "0", startingAt: 0)) ?? 0 : 0
        let c = entero * 100 + frac
        if c <= 0 { return .error("dinero.errorCero", [:]) }
        if c > maximoCentimos { return .error("dinero.errorMaximo", maximo) }
        return .ok(c)
    }
}

/// Color de error (no es token del DS: mismo valor que la web).
enum AlcanciaExtra { static let error = Color(hex: 0xB3261E) }

extension View {
    /// Aplica una animación solo si el sistema no pide reducir movimiento.
    func animacion<V: Equatable>(_ a: Animation, value: V, reducir: Bool) -> some View { animation(reducir ? nil : a, value: value) }
}

extension AlcanciaTextStyle {
    /// Mismo tamaño con otro peso (400/500/600): AlcanciaType.cuerpo.peso(600).
    func peso(_ w: Int) -> AlcanciaTextStyle { AlcanciaTextStyle(size: size, lineHeight: lineHeight, weight: w, relativeTo: relativeTo) }
}
