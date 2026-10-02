import SwiftUI

/// Lo que entró y salió · /movimientos · captura 16. Agrupado por mes con «Entró S/ X · Salió S/ Y».
struct MovimientosPantalla: View {
    let meses: [MesUi]
    let alAtras: () -> Void
    var alMovimiento: (String) -> Void = { _ in }
    var body: some View {
        PantallaTarea(titulo: t("nav.alcancia"), alAtras: alAtras) {
            EmptyView()
        } contenido: {
            Text(t("movimientos.titulo")).alcanciaText(AlcanciaType.tituloPantalla).accessibilityAddTraits(.isHeader)
            if meses.isEmpty { Text(t("movimientos.vacio")).alcanciaText(AlcanciaType.cuerpo).foregroundStyle(AlcanciaColor.textoSecundario) }
            ForEach(meses) { mes in
                VStack(spacing: 0) {
                    HStack(alignment: .lastTextBaseline) {
                        Text(mes.titulo.prefix(1).uppercased() + mes.titulo.dropFirst()).alcanciaText(AlcanciaType.elemento.peso(600)).accessibilityAddTraits(.isHeader)
                        Spacer()
                        Text(t("movimientos.mesTotales", ["entro": Dinero.soles(mes.entro), "salio": Dinero.soles(mes.salio)]))
                            .alcanciaText(AlcanciaType.secundario).foregroundStyle(AlcanciaColor.textoSecundario)
                    }
                    .padding(.top, AlcanciaDimen.space16)
                    ForEach(Array(mes.movimientos.enumerated()), id: \.element.id) { i, m in
                        if i > 0 { Separador() }
                        FilaMovimiento(m: m) { alMovimiento(m.id) }
                    }
                    Separador()
                }
            }
        }
    }
}

#Preview("Lo que entró y salió") { MovimientosPantalla(meses: Ejemplos.meses, alAtras: {}) }
