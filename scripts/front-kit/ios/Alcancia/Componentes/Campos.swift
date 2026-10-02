import SwiftUI
import UIKit

/**
 Campo de monto grande (36 pt, prefijo «S/», teclado decimal).
 Al enfocarlo se selecciona todo: se escribe encima sin borrar a mano.
 `error` aparece debajo, junto al campo (sin ayuda permanente).
 */
struct CampoMonto: View {
    @Binding var valor: String
    /// No se ve (el título ya pregunta «¿Cuánto…?»); la lee VoiceOver.
    let etiqueta: String
    let error: String?
    @FocusState private var enfocado: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 10) {
                Text("S/").alcanciaText(AlcanciaType.importe).accessibilityHidden(true)
                TextField("", text: $valor)
                    .keyboardType(.decimalPad)
                    .alcanciaText(AlcanciaType.importe)
                    .foregroundStyle(AlcanciaColor.texto)
                    .tint(AlcanciaColor.principal)
                    .focused($enfocado)
                    .accessibilityLabel(etiqueta)
                    .onChange(of: enfocado) { si in
                        // Seleccionar todo al entrar (UIKit): así se escribe encima del monto sugerido.
                        if si { DispatchQueue.main.async { UIApplication.shared.sendAction(#selector(UIResponder.selectAll(_:)), to: nil, from: nil, for: nil) } }
                    }
            }
            .padding(.horizontal, AlcanciaDimen.space16)
            .frame(minHeight: 72)
            .background(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).fill(error != nil ? AlcanciaColor.fondoRojo : AlcanciaColor.base))
            .overlay(RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).strokeBorder(error != nil ? AlcanciaExtra.error : AlcanciaColor.principal, lineWidth: 1.5))
            .contentShape(Rectangle())
            .onTapGesture { enfocado = true }
            if let error { Text(error).alcanciaText(AlcanciaType.secundario).foregroundStyle(AlcanciaExtra.error) }
        }
    }
}

/// Campo de texto con etiqueta arriba y error debajo.
struct CampoTexto: View {
    @Binding var valor: String
    let etiqueta: String
    var ejemplo: String? = nil
    var error: String? = nil
    var maximo = 60
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(etiqueta).alcanciaText(AlcanciaType.boton)
            TextField(ejemplo ?? "", text: $valor)
                .alcanciaText(AlcanciaType.relato)
                .padding(.horizontal, AlcanciaDimen.space16)
                .frame(minHeight: AlcanciaDimen.controlHeight)
                .overlay(RoundedRectangle(cornerRadius: AlcanciaDimen.radius12).strokeBorder(error != nil ? AlcanciaExtra.error : AlcanciaColor.textoSecundario, lineWidth: 1))
                .accessibilityLabel(etiqueta)
                .onChange(of: valor) { v in if v.count > maximo { valor = String(v.prefix(maximo)) } }
            if let error { Text(error).alcanciaText(AlcanciaType.secundario).foregroundStyle(AlcanciaExtra.error) }
        }
    }
}
