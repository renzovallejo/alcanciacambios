import SwiftUI

/// Icono de la opción; al elegirla cambia a ✓ con un rebote corto.
private struct IconoEleccion: View {
    let icono: String
    let elegida: Bool
    var tamano: CGFloat = 20
    @Environment(\.accessibilityReduceMotion) private var reducir
    var body: some View {
        Icono(nombre: elegida ? Ic.circleCheck : icono, tamano: tamano)
            .foregroundStyle(AlcanciaColor.principal)
            .transition(.scale)
            .id(elegida)
            .animation(reducir ? nil : .spring(response: 0.28, dampingFraction: 0.5), value: elegida)
    }
}

/// Tarjeta de opción para grillas de 2 columnas (motivos). Selección = ✓ + borde + fondo, nunca solo color.
struct OpcionTarjeta: View {
    let texto: String
    let icono: String
    let elegida: Bool
    let accion: () -> Void
    var body: some View {
        Button(action: accion) {
            HStack(spacing: AlcanciaDimen.space8) {
                IconoEleccion(icono: icono, elegida: elegida)
                Text(texto).alcanciaText(AlcanciaType.secundario.peso(elegida ? 600 : 400))
                    .foregroundStyle(elegida ? AlcanciaColor.principal : AlcanciaColor.texto)
                    .multilineTextAlignment(.leading)
                Spacer(minLength: 0)
            }
            .padding(AlcanciaDimen.space12)
            .frame(maxWidth: .infinity, minHeight: 56, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).fill(elegida ? AlcanciaColor.fondoAzul : AlcanciaColor.base))
            .overlay(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).strokeBorder(elegida ? AlcanciaColor.principal : AlcanciaColor.borde, lineWidth: elegida ? 1.5 : 1))
            .contentShape(Rectangle())
        }
        .buttonStyle(Presionable())
        .accessibilityAddTraits(elegida ? [.isButton, .isSelected] : .isButton)
    }
}

/// Grilla de 2 columnas (motivos de plata).
struct GrillaOpciones: View {
    let opciones: [Opcion]
    let elegida: String?
    let texto: (Opcion) -> String
    let elegir: (Opcion) -> Void
    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: AlcanciaDimen.space8), GridItem(.flexible(), spacing: AlcanciaDimen.space8)], spacing: AlcanciaDimen.space8) {
            ForEach(opciones) { o in OpcionTarjeta(texto: texto(o), icono: o.icono, elegida: elegida == o.id) { elegir(o) } }
        }
    }
}

/// Opción a lo ancho con subtítulo opcional y radio a la derecha (¿Quién le envía?, metas, días).
struct OpcionFila: View {
    let titulo: String
    let icono: String
    let elegida: Bool
    var subtitulo: String? = nil
    var conRadio = true
    let accion: () -> Void
    var body: some View {
        Button(action: accion) {
            HStack(spacing: AlcanciaDimen.space8) {
                if conRadio { Icono(nombre: icono, tamano: 22).foregroundStyle(AlcanciaColor.principal) } else { IconoEleccion(icono: icono, elegida: elegida) }
                VStack(alignment: .leading, spacing: 0) {
                    Text(titulo).alcanciaText(AlcanciaType.secundario.peso(600)).foregroundStyle(elegida ? AlcanciaColor.principal : AlcanciaColor.texto)
                    if let subtitulo { Text(subtitulo).alcanciaText(AlcanciaType.metadatos).foregroundStyle(elegida ? AlcanciaColor.principal : AlcanciaColor.textoSecundario) }
                }
                Spacer(minLength: 0)
                if conRadio { PuntoRadio(elegido: elegida) }
            }
            .padding(AlcanciaDimen.space12)
            .frame(maxWidth: .infinity, minHeight: 56, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).fill(elegida ? AlcanciaColor.fondoAzul : AlcanciaColor.base))
            .overlay(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).strokeBorder(elegida ? AlcanciaColor.principal : AlcanciaColor.borde, lineWidth: elegida ? 1.5 : 1))
            .contentShape(Rectangle())
        }
        .buttonStyle(Presionable())
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(elegida ? [.isButton, .isSelected] : .isButton)
    }
}

struct PuntoRadio: View {
    let elegido: Bool
    var body: some View {
        ZStack {
            Circle().strokeBorder(elegido ? AlcanciaColor.principal : AlcanciaColor.borde, lineWidth: 2)
            if elegido { Circle().fill(AlcanciaColor.principal).frame(width: 10, height: 10) }
        }
        .frame(width: 22, height: 22)
        .accessibilityHidden(true)
    }
}

/// S/ 5 · S/ 10 · S/ 20. El elegido va relleno y con ✓.
struct MontosRapidos: View {
    let valores: [Int]
    let elegido: Int?
    let elegir: (Int) -> Void
    var body: some View {
        HStack(spacing: AlcanciaDimen.space12) {
            ForEach(valores, id: \.self) { v in
                let on = v == elegido
                Button { elegir(v) } label: {
                    HStack(spacing: 6) {
                        if on { Icono(nombre: Ic.check, tamano: 16) }
                        Text(Dinero.corto(v)).alcanciaText(AlcanciaType.boton)
                    }
                    .foregroundStyle(on ? AlcanciaColor.base : AlcanciaColor.principal)
                    .frame(maxWidth: .infinity, minHeight: 52)
                    .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).fill(on ? AlcanciaColor.principal : AlcanciaColor.base))
                    .overlay(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).strokeBorder(on ? AlcanciaColor.principal : AlcanciaColor.borde, lineWidth: 1))
                }
                .buttonStyle(Presionable())
                .accessibilityAddTraits(on ? [.isButton, .isSelected] : .isButton)
            }
        }
    }
}

/// Chip de 44 pt (versión del cuento, filtros). `presionado` = elegido.
struct Chip: View {
    let texto: String
    var icono: String? = nil
    var presionado = false
    let accion: () -> Void
    var body: some View {
        Button(action: accion) {
            HStack(spacing: 6) {
                if let icono { Icono(nombre: icono, tamano: 16) }
                Text(texto).alcanciaText(AlcanciaType.secundario.peso(600))
            }
            .foregroundStyle(presionado ? AlcanciaColor.base : AlcanciaColor.principal)
            .padding(.horizontal, AlcanciaDimen.space12)
            .frame(minHeight: AlcanciaDimen.touchMin)
            .background(Capsule().fill(presionado ? AlcanciaColor.principal : AlcanciaColor.fondoAzul))
        }
        .buttonStyle(Presionable())
        .accessibilityAddTraits(presionado ? [.isButton, .isSelected] : .isButton)
    }
}
