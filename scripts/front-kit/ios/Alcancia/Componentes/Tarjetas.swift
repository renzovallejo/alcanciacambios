import SwiftUI

/// Fondos con significado. Blanca lleva borde; las de color, no.
enum Tono {
    case blanca, crema, violeta, menta, azul
    var fondo: Color {
        switch self {
        case .blanca: return AlcanciaColor.base
        case .crema: return AlcanciaColor.fondoNaranja
        case .violeta: return AlcanciaColor.fondoVioleta
        case .menta: return AlcanciaColor.fondoVerde
        case .azul: return AlcanciaColor.fondoAzul
        }
    }
}

/// Tarjeta del DS: radio 16, relleno 16.
struct Tarjeta<Contenido: View>: View {
    var tono: Tono = .blanca
    var espacio: CGFloat = AlcanciaDimen.space12
    @ViewBuilder let contenido: () -> Contenido
    var body: some View {
        VStack(alignment: .leading, spacing: espacio, content: contenido)
            .padding(AlcanciaDimen.space16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius16).fill(tono.fondo))
            .overlay(RoundedRectangle(cornerRadius: AlcanciaDimen.radius16).strokeBorder(tono == .blanca ? AlcanciaColor.borde : .clear, lineWidth: AlcanciaDimen.borderWidth))
    }
}

enum TonoTile {
    case azul, violeta, naranja, verde, acento
    var colores: (fondo: Color, icono: Color) {
        switch self {
        case .azul: return (AlcanciaColor.fondoAzul, AlcanciaColor.principal)
        case .violeta: return (AlcanciaColor.fondoVioleta, AlcanciaColor.secundario)
        case .naranja: return (AlcanciaColor.fondoNaranja, AlcanciaColor.principal)
        case .verde: return (AlcanciaColor.fondoVerde, AlcanciaColor.principal)
        case .acento: return (AlcanciaColor.acento, AlcanciaColor.texto)
        }
    }
}

/// Cuadrito con icono (40 pt, radio 10).
struct IconTile: View {
    let icono: String
    let tono: TonoTile
    var tamano: CGFloat = 40
    var body: some View {
        Icono(nombre: icono, tamano: 20).foregroundStyle(tono.colores.icono)
            .frame(width: tamano, height: tamano)
            .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius10).fill(tono.colores.fondo))
    }
}

/// Caja azul suave «Ahora tiene ahorrado · S/ 15.00».
struct CajaDato: View {
    let etiqueta: String
    let valor: String
    var body: some View {
        HStack {
            Text(etiqueta).alcanciaText(AlcanciaType.secundario).foregroundStyle(AlcanciaColor.textoSecundario)
            Spacer()
            Text(valor).alcanciaText(AlcanciaType.boton).foregroundStyle(AlcanciaColor.principal)
        }
        .padding(AlcanciaDimen.space16)
        .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).fill(AlcanciaColor.fondoAzul))
        .accessibilityElement(children: .combine)
    }
}

/// Aviso en línea: crema (informa) o menta `ok` (algo salió bien).
struct Aviso: View {
    let texto: String
    var ok = false
    var icono: String? = nil
    var body: some View {
        HStack(spacing: AlcanciaDimen.space8) {
            if let icono { Icono(nombre: icono, tamano: 20) }
            Text(texto).alcanciaText(AlcanciaType.secundario).frame(maxWidth: .infinity, alignment: .leading)
        }
        .foregroundStyle(AlcanciaColor.texto)
        .padding(AlcanciaDimen.space12)
        .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius12).fill(ok ? AlcanciaColor.fondoVerde : AlcanciaColor.fondoNaranja))
        .accessibilityElement(children: .combine)
    }
}

struct Separador: View {
    var body: some View { Rectangle().fill(AlcanciaColor.borde).frame(height: AlcanciaDimen.borderWidth) }
}

/// Resumen: «Cuánto · S/ 10.00». La última fila (Así quedaría) va en azul.
struct ListaResumen: View {
    let filas: [(String, String)]
    var body: some View {
        VStack(spacing: 0) {
            Separador()
            ForEach(Array(filas.enumerated()), id: \.offset) { i, f in
                HStack(spacing: 12) {
                    Text(f.0).alcanciaText(AlcanciaType.cuerpo).foregroundStyle(AlcanciaColor.textoSecundario)
                    Spacer()
                    Text(f.1).alcanciaText(AlcanciaType.cuerpo.peso(600)).foregroundStyle(i == filas.count - 1 ? AlcanciaColor.principal : AlcanciaColor.texto).multilineTextAlignment(.trailing)
                }
                .padding(.vertical, AlcanciaDimen.space12)
                .accessibilityElement(children: .combine)
                Separador()
            }
        }
    }
}
