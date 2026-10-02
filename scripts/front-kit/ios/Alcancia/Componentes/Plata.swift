import SwiftUI

/// Texto de soles que cuenta suavemente entre dos valores (lo anima SwiftUI vía animatableData).
struct SolesAnimados: View, Animatable {
    var centimos: Double
    var animatableData: Double { get { centimos } set { centimos = newValue } }
    var body: some View { Text(Dinero.soles(Int(centimos.rounded()))) }
}

/**
 Tarjeta del saldo: mascota (tócala y salta), «LLEVA AHORRADO», monto que cuenta desde `saldoAnterior`
 hasta `saldo` (0.7 s) y «Esta semana: +S/ X». VoiceOver recibe el valor final de inmediato.
 */
struct TarjetaSaldo: View {
    let nombre: String
    let saldo: Int
    var saldoAnterior: Int? = nil
    var estaSemana = 0
    @Environment(\.accessibilityReduceMotion) private var reducir
    @State private var mostrado: Double = 0
    @State private var saltos = 0

    var body: some View {
        HStack(spacing: AlcanciaDimen.space16) {
            Mascota(tamano: 64, saltos: saltos)
                .contentShape(Rectangle())
                .onTapGesture { saltos += 1 }
                .accessibilityAddTraits(.isButton)
                .accessibilityLabel(t("alcancia.saltar"))
            VStack(alignment: .leading, spacing: 0) {
                Text(t("alcancia.llevaAhorrado")).alcanciaText(AlcanciaType.etiqueta).foregroundStyle(AlcanciaColor.textoSecundario)
                SolesAnimados(centimos: mostrado).alcanciaText(AlcanciaType.importe).foregroundStyle(AlcanciaColor.principal)
                if estaSemana > 0 {
                    Text(t("alcancia.estaSemana", ["monto": Dinero.soles(estaSemana)])).alcanciaText(AlcanciaType.etiqueta.peso(400)).foregroundStyle(AlcanciaColor.textoSecundario)
                }
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("\(t("alcancia.llevaAhorrado")): \(Dinero.soles(saldo))")
            Spacer(minLength: 0)
        }
        .padding(AlcanciaDimen.space20)
        .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius16).fill(AlcanciaColor.fondoAzul))
        .onAppear {
            mostrado = Double(saldoAnterior ?? saldo)
            if let saldoAnterior, saldoAnterior != saldo {
                saltos += 1
                withAnimation(reducir ? nil : .timingCurve(0.33, 1, 0.68, 1, duration: AlcanciaMotion.conteo)) { mostrado = Double(saldo) }
            }
        }
        .onChange(of: saldo) { nuevo in withAnimation(reducir ? nil : .timingCurve(0.33, 1, 0.68, 1, duration: AlcanciaMotion.conteo)) { mostrado = Double(nuevo) } }
    }
}

/// Barra de avance: crece de 0 al valor al aparecer (0.7 s). Siempre acompañada de «S/ X de S/ Y».
struct BarraAvance: View {
    let porcentaje: Int
    let descripcion: String
    var alto: CGFloat = 6
    @Environment(\.accessibilityReduceMotion) private var reducir
    @State private var visible: Double = 0
    var body: some View {
        GeometryReader { g in
            ZStack(alignment: .leading) {
                Capsule().fill(AlcanciaColor.borde)
                Capsule().fill(AlcanciaColor.principal).frame(width: g.size.width * visible)
            }
        }
        .frame(height: alto)
        .onAppear { withAnimation(reducir ? nil : AlcanciaEasing.emphasized(AlcanciaMotion.conteo)) { visible = Double(porcentaje) / 100 } }
        .onChange(of: porcentaje) { p in withAnimation(reducir ? nil : AlcanciaEasing.emphasized(AlcanciaMotion.conteo)) { visible = Double(p) / 100 } }
        .accessibilityElement()
        .accessibilityLabel(descripcion)
        .accessibilityValue("\(porcentaje)%")
    }
}

/// Tarjeta de meta: icono, nombre, «S/ 12.00 de S/ 30.00», % (o «¡Logrado!» / «Ya la usaron») y barra.
struct TarjetaMeta: View {
    let meta: MetaUi
    let accion: () -> Void
    var body: some View {
        Button(action: accion) {
            VStack(spacing: 4) {
                HStack(spacing: AlcanciaDimen.space12) {
                    IconTile(icono: meta.lograda ? Ic.circleCheck : meta.icono, tono: meta.lograda ? .verde : meta.icono == "puzzle" ? .naranja : .azul, tamano: 36)
                    VStack(alignment: .leading, spacing: 0) {
                        Text(meta.nombre).alcanciaText(AlcanciaType.elemento.peso(600)).foregroundStyle(AlcanciaColor.texto)
                        Text(t("meta.deObjetivo", ["guardado": Dinero.soles(meta.guardado), "objetivo": Dinero.soles(meta.objetivo)]))
                            .alcanciaText(AlcanciaType.metadatos).foregroundStyle(AlcanciaColor.textoSecundario)
                    }
                    Spacer(minLength: 0)
                    Text(meta.usada ? t("meta.usada") : meta.lograda ? t("meta.logrado") : "\(meta.porcentaje)%")
                        .alcanciaText(AlcanciaType.metadatos.peso(600)).foregroundStyle(AlcanciaColor.principal)
                    Icono(nombre: Ic.chevronRight, tamano: 16).foregroundStyle(AlcanciaColor.textoSecundario)
                }
                BarraAvance(porcentaje: meta.porcentaje, descripcion: t("meta.avance", ["meta": meta.nombre, "porcentaje": meta.porcentaje]))
            }
            .padding(.horizontal, AlcanciaDimen.space16).padding(.vertical, AlcanciaDimen.space12)
            .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).fill(meta.lograda ? AlcanciaColor.fondoVerde : AlcanciaColor.base))
            .overlay(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).strokeBorder(meta.lograda ? .clear : AlcanciaColor.borde, lineWidth: 1))
        }
        .buttonStyle(Presionable())
    }
}

/**
 Fila de movimiento: título = motivo («Se portó bien»), debajo quién envió (solo entradas) y cuándo («Abuela · ayer»), y el monto.
 «Guardó/Sacó plata» lo dicen la flecha y el signo (VoiceOver lo anuncia); quién lo hizo va en el detalle.
 `nuevo` la resalta en menta y se desvanece (1.6 s), para el que se acaba de guardar.
 */
struct FilaMovimiento: View {
    let m: MovimientoUi
    var nuevo = false
    let accion: () -> Void
    @Environment(\.accessibilityReduceMotion) private var reducir
    @State private var resaltado = false
    var body: some View {
        let salida = m.flujo == .salida
        Button(action: accion) {
            HStack(spacing: AlcanciaDimen.space12) {
                IconTile(icono: Ic.arrowUp, tono: salida ? .naranja : .verde).rotationEffect(.degrees(salida ? 180 : 0))
                VStack(alignment: .leading, spacing: 0) {
                    Text(m.motivo.isEmpty ? t(salida ? "movimientos.out" : "movimientos.in") : m.motivo).alcanciaText(AlcanciaType.elemento).foregroundStyle(AlcanciaColor.texto)
                    Text([salida ? "" : m.quien, m.cuando].filter { !$0.isEmpty }.joined(separator: " · "))
                        .alcanciaText(AlcanciaType.secundario).foregroundStyle(AlcanciaColor.textoSecundario).multilineTextAlignment(.leading)
                }
                Spacer(minLength: 0)
                Text((salida ? "−" : "+") + Dinero.soles(m.centimos)).alcanciaText(AlcanciaType.cuerpo.peso(600)).foregroundStyle(AlcanciaColor.principal)
            }
            .padding(.vertical, AlcanciaDimen.space12)
            .frame(minHeight: 56)
            .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius12).fill(resaltado ? AlcanciaColor.fondoVerde : .clear))
            .contentShape(Rectangle())
        }
        .buttonStyle(Presionable())
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(t(salida ? "movimientos.out" : "movimientos.in")): \(m.motivo), \([salida ? "" : m.quien, m.cuando].filter { !$0.isEmpty }.joined(separator: ", ")), \(salida ? "−" : "+")\(Dinero.soles(m.centimos))")
        .onAppear {
            guard nuevo else { return }
            resaltado = true
            withAnimation(reducir ? nil : .easeOut(duration: 1.6).delay(0.3)) { resaltado = false }
        }
    }
}
