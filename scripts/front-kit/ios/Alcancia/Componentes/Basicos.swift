import SwiftUI

/// Icono Lucide por nombre (ver Ic.*). Toma el color de .foregroundStyle. Decorativo salvo que pases [descripcion].
struct Icono: View {
    let nombre: String
    var tamano: CGFloat = 24
    var descripcion: String? = nil
    var body: some View {
        Image("ic-\(nombre)")
            .renderingMode(.template).resizable().scaledToFit()
            .frame(width: tamano, height: tamano)
            .accessibilityHidden(descripcion == nil)
            .accessibilityLabel(descripcion ?? "")
    }
}

/// Mascota (chanchito). Cada vez que `saltos` cambia, da un salto: −10 pt y ±4° en 0.7 s.
/// Para que salte al tocarlo: @State var saltos = 0 … Mascota(saltos: saltos).onTapGesture { saltos += 1 }
struct Mascota: View {
    var tamano: CGFloat = 64
    var saltos: Int = 0
    var retardo: Double = 0
    @Environment(\.accessibilityReduceMotion) private var reducir
    @State private var dy: CGFloat = 0
    @State private var rot: Double = 0

    var body: some View {
        Image("Mascota").resizable().scaledToFit()
            .frame(width: tamano, height: tamano)
            .offset(y: dy).rotationEffect(.degrees(rot))
            .accessibilityHidden(true)
            .onChange(of: saltos) { _ in saltar() }
            .onAppear { if saltos > 0 { saltar() } }
    }

    /// Misma curva que @keyframes hop de la web: 35 % arriba e inclinado, 65 % abajo, 100 % quieto.
    private func saltar() {
        guard !reducir else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + retardo) {
            withAnimation(.easeInOut(duration: 0.245)) { dy = -10; rot = -4 }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.245) {
                withAnimation(.easeInOut(duration: 0.21)) { dy = 0; rot = 2 }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.21) { withAnimation(.easeInOut(duration: 0.245)) { rot = 0 } }
            }
        }
    }
}

enum Variante { case primario, secundario, terciario }

/**
 Botón del DS: píldora de 48 pt (terciario 44 pt), escala 0.98 al presionar.
 `cargando` muestra «Un ratito…» con spinner y bloquea toques repetidos (un solo envío).
 `compacto` (dentro de un par de botones): relleno lateral 8 para que el texto quepa en una línea.
 */
struct Boton: View {
    let texto: String
    var variante: Variante = .primario
    var habilitado = true
    var cargando = false
    var icono: String? = nil
    var compacto = false
    var anchoCompleto = true
    let accion: () -> Void

    var body: some View {
        Button(action: accion) {
            HStack(spacing: AlcanciaDimen.space8) {
                if cargando {
                    ProgressView().tint(colores.texto).controlSize(.small)
                    Text(t("comun.unRatito"))
                } else {
                    if let icono { Icono(nombre: icono, tamano: 20) }
                    Text(texto).multilineTextAlignment(.center)
                }
            }
            .alcanciaText(variante == .terciario ? AlcanciaType.secundario.peso(600) : AlcanciaType.boton)
            .foregroundStyle(colores.texto)
            .padding(.horizontal, variante == .terciario || compacto ? AlcanciaDimen.space8 : AlcanciaDimen.space24)
            .frame(maxWidth: anchoCompleto ? .infinity : nil, minHeight: variante == .terciario ? AlcanciaDimen.touchMin : AlcanciaDimen.controlHeight)
            .background(Capsule().fill(colores.fondo))
            .overlay(Capsule().strokeBorder(colores.borde, lineWidth: AlcanciaDimen.borderWidth))
            .contentShape(Capsule())
        }
        .buttonStyle(Presionable())
        .disabled(!habilitado || cargando)
    }

    private var colores: (fondo: Color, texto: Color, borde: Color) {
        if !habilitado { return (AlcanciaColor.borde, AlcanciaColor.textoSecundario, .clear) }
        switch variante {
        case .primario: return (AlcanciaColor.principal, AlcanciaColor.base, .clear)
        case .secundario: return (AlcanciaColor.base, AlcanciaColor.principal, AlcanciaColor.principal)
        case .terciario: return (.clear, AlcanciaColor.principal, .clear)
        }
    }
}

/// Escala 0.98 mientras se presiona (120 ms). Sirve para botones y tarjetas tocables.
struct Presionable: ButtonStyle {
    @Environment(\.accessibilityReduceMotion) private var reducir
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed && !reducir ? 0.98 : 1)
            .animation(reducir ? nil : .easeOut(duration: AlcanciaMotion.rapida), value: configuration.isPressed)
    }
}

/// Botón redondo de 44 pt solo con icono (ajustes, volver, cerrar). `descripcion` la lee VoiceOver.
struct BotonIcono: View {
    let icono: String
    let descripcion: String
    var conFondo = true
    let accion: () -> Void
    var body: some View {
        Button(action: accion) {
            Icono(nombre: icono, tamano: 22)
                .foregroundStyle(AlcanciaColor.principal)
                .frame(width: AlcanciaDimen.touchMin, height: AlcanciaDimen.touchMin)
                .background(Circle().fill(conFondo ? AlcanciaColor.fondoAzul : .clear))
        }
        .buttonStyle(Presionable())
        .accessibilityLabel(descripcion)
    }
}
