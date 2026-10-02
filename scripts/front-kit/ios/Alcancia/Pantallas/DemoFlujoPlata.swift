import SwiftUI

/**
 Ejemplo completo y funcional de cómo cablear Alcancía + el flujo de plata con estado local.
 En la app real este estado vive en tu ViewModel (ObservableObject); las pantallas no cambian.
 Pruébalo: WindowGroup { DemoFlujoPlata(inicial: Ejemplos.semana) }
 */
struct DemoFlujoPlata: View {
    @State var estado: AlcanciaUi
    @State private var paso = 0 // 0 Alcancía · 1 Cuánto · 2 Motivo · 3 Quién · 4 Listo
    @State private var flujo: Flujo = .entrada
    @State private var monto = "10.00"
    @State private var motivo: String? = "mesada"   // se recuerda de la última vez
    @State private var detalle = ""
    @State private var meta: String? = nil
    @State private var quien: String? = "mama"      // por defecto, quien administra la cuenta
    @State private var otro = ""
    @State private var saldoAntes: Int? = nil
    @State private var nuevo: String? = nil
    @State private var lograda: String? = nil

    init(inicial: AlcanciaUi) { _estado = State(initialValue: inicial) }

    private var centimos: Int { if case .ok(let c) = Dinero.validar(monto) { return c }; return 0 }
    private var motivoTexto: String { motivo == "otro" ? detalle : motivo.map { t("motivos.\($0)") } ?? "" }
    private var quienTexto: String { quien == "otro" ? otro : quien.map { t("quien.\($0)") } ?? "" }

    private func guardar() {
        let signo = flujo == .entrada ? 1 : -1
        let m = estado.metas.first { $0.id == meta }
        if let m, flujo == .entrada, m.guardado < m.objetivo, m.guardado + centimos >= m.objetivo { lograda = m.nombre } else { lograda = nil }
        let id = UUID().uuidString
        saldoAntes = estado.saldo
        estado.saldo += signo * centimos
        estado.metas = estado.metas.map { g in
            guard g.id == meta else { return g }
            var c = g; c.guardado = max(0, g.guardado + signo * centimos); c.lograda = g.lograda || c.guardado >= c.objetivo; return c
        }
        let mov = MovimientoUi(id: id, flujo: flujo, centimos: centimos, quien: flujo == .entrada ? quienTexto : "Mamá", cuando: "hoy", motivo: motivoTexto, meta: m?.nombre)
        estado.movimientos = Array(([mov] + estado.movimientos).prefix(2))
        nuevo = id
        paso = 4
    }

    var body: some View {
        switch paso {
        case 0:
            AlcanciaPantalla(estado: estado, acciones: AccionesAlcancia(
                alAgregar: { flujo = .entrada; monto = "10.00"; paso = 1 },
                alSacar: { flujo = .salida; monto = "5.00"; motivo = nil; paso = 1 }
            ), saldoAnterior: saldoAntes, nuevoId: nuevo)
        case 1:
            CuantoPantalla(flujo: flujo, nombre: estado.nombre, saldo: estado.saldo, monto: $monto, alCerrar: { paso = 0 }, alContinuar: { paso = 2 })
        case 2:
            MotivoPantalla(flujo: flujo, nombre: estado.nombre, centimos: centimos, saldo: estado.saldo, motivo: $motivo, detalle: $detalle,
                           metas: estado.metas, meta: $meta, alAtras: { paso = 1 }, alContinuar: { if flujo == .entrada { paso = 3 } else { guardar() } })
        case 3:
            QuienPantalla(centimos: centimos, saldo: estado.saldo, motivoTexto: motivoTexto, metaNombre: estado.metas.first { $0.id == meta }?.nombre,
                          quien: $quien, nombreOtro: $otro, relacionAdmin: "mama", alAtras: { paso = 2 }, alConfirmar: guardar)
        default:
            ListoPantalla(flujo: flujo, nombre: estado.nombre, saldo: estado.saldo, metaLograda: lograda, alVolver: { paso = 0 })
        }
    }
}

#Preview("Demo interactiva") { DemoFlujoPlata(inicial: Ejemplos.semana) }
