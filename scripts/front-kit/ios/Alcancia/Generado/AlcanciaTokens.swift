// Generado por scripts/front-kit/generar.ts. No editar a mano: cambia la fuente (src/) y vuelve a generar.
import SwiftUI

/// Colores del DS v3.4. Blanco siempre como fondo de página; fondos suaves solo en bloques con significado.
enum AlcanciaColor {
    static let acento = Color(hex: 0xFF7F32)
    static let base = Color(hex: 0xFFFFFF)
    static let borde = Color(hex: 0xE4E5EC)
    static let fondoAzul = Color(hex: 0xF5F7FE)
    static let fondoNaranja = Color(hex: 0xFFF8F3)
    static let fondoRojo = Color(hex: 0xFFF4F4)
    static let fondoVerde = Color(hex: 0xF1FBF6)
    static let fondoVioleta = Color(hex: 0xFAF6FF)
    static let principal = Color(hex: 0x141C7A)
    static let secundario = Color(hex: 0x7B24C5)
    static let texto = Color(hex: 0x0A0D29)
    static let textoSecundario = Color(hex: 0x5B6080)
}

/// Dimensiones a 1× (pt). Objetivo táctil mínimo: touchMin.
enum AlcanciaDimen {
    static let borderWidth: CGFloat = 1
    static let contentWidth: CGFloat = 354
    static let controlHeight: CGFloat = 48
    static let focusWidth: CGFloat = 2
    static let pageMargin: CGFloat = 24
    static let radius10: CGFloat = 10
    static let radius12: CGFloat = 12
    static let radius14: CGFloat = 14
    static let radius16: CGFloat = 16
    static let space10: CGFloat = 10
    static let space12: CGFloat = 12
    static let space14: CGFloat = 14
    static let space16: CGFloat = 16
    static let space18: CGFloat = 18
    static let space20: CGFloat = 20
    static let space24: CGFloat = 24
    static let space32: CGFloat = 32
    static let space4: CGFloat = 4
    static let space6: CGFloat = 6
    static let space7: CGFloat = 7
    static let space8: CGFloat = 8
    static let touchMin: CGFloat = 44
}

/// Rol tipográfico con Dynamic Type: el tamaño escala con la preferencia del sistema.
struct AlcanciaTextStyle {
    let size: CGFloat
    let lineHeight: CGFloat
    let weight: Int
    let relativeTo: Font.TextStyle

    var font: Font {
        let nombre = weight >= 600 ? "Inter-SemiBold" : weight >= 500 ? "Inter-Medium" : "Inter-Regular"
        return .custom(nombre, size: size, relativeTo: relativeTo)
    }
    /// SwiftUI usa espacio extra entre líneas, no altura de línea total.
    var lineSpacing: CGFloat { lineHeight - size }
}

enum AlcanciaType {
    /// 36/44 · 600 · S/ 15.00
    static let importe = AlcanciaTextStyle(size: 36, lineHeight: 44, weight: 600, relativeTo: .title)
    /// 26/34 · 600 · Alcancía, Aprender, ¿Cuánto va a guardar?
    static let tituloPantalla = AlcanciaTextStyle(size: 26, lineHeight: 34, weight: 600, relativeTo: .title)
    /// 22/30 · 600 · Fijar una meta de ahorro
    static let destacado = AlcanciaTextStyle(size: 22, lineHeight: 30, weight: 600, relativeTo: .title3)
    /// 20/28 · 600 · Aprendan a ahorrar juntos, título de momento
    static let bienvenida = AlcanciaTextStyle(size: 20, lineHeight: 28, weight: 600, relativeTo: .title3)
    /// 18/26 · 600 · Sus metas
    static let seccion = AlcanciaTextStyle(size: 18, lineHeight: 26, weight: 600, relativeTo: .headline)
    /// 16/24 · 600 · Agregar plata
    static let boton = AlcanciaTextStyle(size: 16, lineHeight: 24, weight: 600, relativeTo: .body)
    /// 16/24 · 500 · Libro de dinosaurios
    static let elemento = AlcanciaTextStyle(size: 16, lineHeight: 24, weight: 500, relativeTo: .body)
    /// 16/24 · 400 · Texto del cuento
    static let relato = AlcanciaTextStyle(size: 16, lineHeight: 24, weight: 400, relativeTo: .body)
    /// 15/22 · 400 · Explicaciones y ayudas
    static let cuerpo = AlcanciaTextStyle(size: 15, lineHeight: 22, weight: 400, relativeTo: .body)
    /// 14/20 · 400 · Descripciones cortas
    static let secundario = AlcanciaTextStyle(size: 14, lineHeight: 20, weight: 400, relativeTo: .footnote)
    /// 13/18 · 400 · Ahorrar · 5 min
    static let metadatos = AlcanciaTextStyle(size: 13, lineHeight: 18, weight: 400, relativeTo: .footnote)
    /// 12/16 · 600 · LLEVA AHORRADO, navegación
    static let etiqueta = AlcanciaTextStyle(size: 12, lineHeight: 16, weight: 600, relativeTo: .caption)
}

extension View {
    func alcanciaText(_ style: AlcanciaTextStyle) -> some View {
        font(style.font).lineSpacing(style.lineSpacing)
    }
}

/// Duraciones (s). Respetar @Environment(\.accessibilityReduceMotion): sin animación si está activo.
enum AlcanciaMotion {
    /// Respuesta táctil (escala 0.98)
    static let rapida: Double = 0.12
    /// Aparición de contenido, cambio de formato
    static let corta: Double = 0.2
    /// Entrada de pantallas y subpantallas
    static let pantalla: Double = 0.24
    /// Indicador de pestaña / formato que se desliza
    static let pildora: Double = 0.28
    /// Icono de éxito con rebote
    static let confirmacion: Double = 0.45
    /// Conteo del saldo y barras de avance
    static let conteo: Double = 0.7
}

enum AlcanciaEasing {
    static func standard(_ d: Double) -> Animation { .timingCurve(0.2, 0, 0, 1, duration: d) }
    static func decelerate(_ d: Double) -> Animation { .timingCurve(0, 0, 0.2, 1, duration: d) }
    static func emphasized(_ d: Double) -> Animation { .timingCurve(0.2, 0.8, 0.2, 1, duration: d) }
    static func overshoot(_ d: Double) -> Animation { .timingCurve(0.2, 0.9, 0.3, 1.3, duration: d) }
}

extension Color {
    init(hex: UInt32) {
        self.init(red: Double((hex >> 16) & 0xFF) / 255, green: Double((hex >> 8) & 0xFF) / 255, blue: Double(hex & 0xFF) / 255)
    }
}
