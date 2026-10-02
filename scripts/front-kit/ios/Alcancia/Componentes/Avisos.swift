import SwiftUI

/// Aviso crema con acciones debajo a la derecha (borrador a medias, día de la propina).
struct Banner<Acciones: View>: View {
    let icono: String
    let texto: String
    @ViewBuilder let acciones: () -> Acciones
    var body: some View {
        VStack(alignment: .trailing, spacing: AlcanciaDimen.space8) {
            HStack(spacing: AlcanciaDimen.space12) {
                Icono(nombre: icono, tamano: 20)
                Text(texto).alcanciaText(AlcanciaType.secundario).frame(maxWidth: .infinity, alignment: .leading)
            }
            HStack(spacing: AlcanciaDimen.space8, content: acciones)
        }
        .foregroundStyle(AlcanciaColor.texto)
        .padding(AlcanciaDimen.space12)
        .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).fill(AlcanciaColor.fondoNaranja))
    }
}

/// Aviso flotante oscuro con «Deshacer» (dura 6 s: el contenedor lo quita con un Task.sleep).
struct AvisoDeshacer: View {
    let mensaje: String
    let accion: String
    let alAccion: () -> Void
    let alCerrar: () -> Void
    var body: some View {
        HStack(spacing: 0) {
            Text(mensaje).alcanciaText(AlcanciaType.secundario).frame(maxWidth: .infinity, alignment: .leading)
            Button(action: alAccion) { Text(accion).alcanciaText(AlcanciaType.secundario.peso(600)).underline().padding(.horizontal, 8).frame(minHeight: 44) }
            Button(action: alCerrar) { Icono(nombre: Ic.x, tamano: 18).frame(width: 44, height: 44) }.accessibilityLabel(t("comun.cerrar"))
        }
        .foregroundStyle(AlcanciaColor.base)
        .padding(.leading, AlcanciaDimen.space16)
        .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius12).fill(AlcanciaColor.texto))
    }
}

/// Check de éxito de 72 pt: aparece con rebote (0.4 → 1.12 → 1) y un anillo que se expande.
struct IconoExito: View {
    var icono: String = Ic.circleCheck
    var fondo: Color = AlcanciaColor.fondoVerde
    @Environment(\.accessibilityReduceMotion) private var reducir
    @State private var escala: CGFloat = 0.4
    @State private var anillo: CGFloat = 0
    var body: some View {
        ZStack {
            Circle().stroke(AlcanciaColor.principal.opacity(0.25 * (1 - anillo)), lineWidth: 8).scaleEffect(1 + 0.35 * anillo)
            Circle().fill(fondo).overlay(Icono(nombre: icono, tamano: 40).foregroundStyle(AlcanciaColor.principal)).scaleEffect(escala)
        }
        .frame(width: 72, height: 72)
        .accessibilityHidden(true)
        .onAppear {
            guard !reducir else { escala = 1; anillo = 1; return }
            withAnimation(.spring(response: 0.45, dampingFraction: 0.55)) { escala = 1 }
            withAnimation(.easeOut(duration: 1).delay(0.35)) { anillo = 1 }
        }
    }
}

/// «¿Y si Sofía mete la moneda?»: al tocar, la moneda cae dentro del chanchito y este salta. Opcional, no bloquea nada.
struct MonedaAlChanchito: View {
    let descripcion: String
    let alMeter: () -> Void
    @Environment(\.accessibilityReduceMotion) private var reducir
    @State private var caida: CGFloat = 0
    @State private var saltos = 0
    @State private var metida = false
    var body: some View {
        ZStack(alignment: .top) {
            Circle().fill(AlcanciaColor.fondoAzul)
            Mascota(tamano: 72, saltos: saltos).frame(maxHeight: .infinity, alignment: .bottom).padding(.bottom, 12)
            Text("S/").font(.system(size: 11, weight: .bold)).foregroundStyle(Color(hex: 0x6B4A00))
                .frame(width: 30, height: 30).background(Circle().fill(Color(hex: 0xF5B83D)))
                .scaleEffect(1 - 0.4 * caida).opacity(caida >= 1 ? 0 : 1)
                .offset(y: 6 + 46 * caida)
        }
        .frame(width: 112, height: 112)
        .clipShape(Circle())
        .contentShape(Circle())
        .onTapGesture {
            guard !metida else { return }
            metida = true; alMeter()
            withAnimation(reducir ? nil : .easeIn(duration: 0.6)) { caida = 1 }
            DispatchQueue.main.asyncAfter(deadline: .now() + (reducir ? 0 : 0.45)) { saltos += 1 }
        }
        .accessibilityElement()
        .accessibilityAddTraits(.isButton)
        .accessibilityLabel(descripcion)
    }
}

/// Idea de 1 minuto: tarjeta lavanda con «Ya lo hicimos» → «¡Listo! …».
struct TarjetaIdea: View {
    let idea: String
    @Binding var hecho: Bool
    var alHecho: () -> Void = {}
    var body: some View {
        Tarjeta(tono: .violeta) {
            HStack(spacing: 6) {
                Icono(nombre: Ic.lightbulb, tamano: 16)
                Text(t("idea.ceja")).alcanciaText(AlcanciaType.etiqueta)
            }
            .foregroundStyle(AlcanciaColor.secundario)
            Text(idea).alcanciaText(AlcanciaType.relato)
            if hecho { Aviso(texto: t("idea.anotado"), ok: true) } else { Boton(texto: t("idea.hecho"), variante: .secundario) { hecho = true; alHecho() } }
        }
    }
}
