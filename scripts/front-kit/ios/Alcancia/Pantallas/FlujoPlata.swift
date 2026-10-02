import SwiftUI

/*
 Flujo de plata.
  Agregar: Cuánto → ¿De dónde salió? → ¿Quién le envía? (+ resumen y «Sí, guardar») → ¡Listo!   (4 pasos)
  Sacar:   Cuánto → ¿En qué la va a usar? (+ resumen y «Sí, sacar») → ¡Listo!                   (3 pasos)
 Pantallas sin estado de negocio propio: reciben el borrador por Binding. Ver DemoFlujoPlata para cablearlas.
 */

private extension Flujo { var k: String { self == .entrada ? "in" : "out" } }
private func tf(_ f: Flujo, _ clave: String, _ a: [String: Any] = [:]) -> String { t("flujo.\(f.k).\(clave)", a) }
private func pasos(_ f: Flujo) -> [String] { (f == .entrada ? Catalogo.pasosEntrada : Catalogo.pasosSalida).map { t($0) } }

private struct Titulo: View {
    let texto: String
    var body: some View { Text(texto).alcanciaText(AlcanciaType.tituloPantalla).accessibilityAddTraits(.isHeader) }
}

/// Valida el texto del monto. En salidas no puede pasar lo ahorrado ni lo que tiene la meta de origen.
func errorDeMonto(_ texto: String, flujo: Flujo, saldo: Int, metaOrigen: MetaUi? = nil) -> String? {
    switch Dinero.validar(texto) {
    case .error(let clave, let args): return t(clave, args)
    case .ok(let c):
        if flujo == .salida && c > saldo { return t("dinero.errorNoAlcanza", ["monto": Dinero.soles(saldo)]) }
        if flujo == .salida, let m = metaOrigen, c > m.guardado { return t("dinero.errorMetaNoAlcanza", ["meta": m.nombre, "monto": Dinero.soles(m.guardado)]) }
        return nil
    }
}

private func centimos(_ texto: String) -> Int? { if case .ok(let c) = Dinero.validar(texto) { return c }; return nil }

/// Paso 1 · Cuánto · /saldo/importe · capturas 53 (agregar), 59 (sacar, no alcanza), 07 (error).
struct CuantoPantalla: View {
    let flujo: Flujo
    let nombre: String
    let saldo: Int
    @Binding var monto: String
    var metaOrigen: MetaUi? = nil
    let alCerrar: () -> Void
    let alContinuar: () -> Void
    @State private var tocado = false

    var body: some View {
        let error = errorDeMonto(monto, flujo: flujo, saldo: saldo, metaOrigen: metaOrigen)
        let c = centimos(monto)
        PantallaTarea(titulo: tf(flujo, "titulo"), alAtras: alCerrar, cerrar: true) {
            Boton(texto: t("comun.continuar"), habilitado: error == nil) { tocado = true; if error == nil { alContinuar() } }
        } contenido: {
            IndicadorPasos(actual: 1, etiquetas: pasos(flujo))
            Titulo(texto: tf(flujo, "pregunta"))
            CampoMonto(valor: Binding(get: { monto }, set: { tocado = true; monto = $0 }), etiqueta: t("flujo.cuanto"), error: tocado ? error : nil)
            MontosRapidos(valores: Catalogo.montosRapidos, elegido: c) { v in tocado = false; monto = String(format: "%d.%02d", v / 100, v % 100) }
            if let c, error == nil { Proyeccion(flujo: flujo, saldo: saldo, centimos: c) }
        }
    }
}

/// Metas como tarjetas a la vista (no desplegable). En salidas, solo metas con plata; en entradas, no las ya usadas.
struct EleccionMeta: View {
    let flujo: Flujo
    let metas: [MetaUi]
    @Binding var elegida: String?
    var body: some View {
        Text(tf(flujo, "paraMeta")).alcanciaText(AlcanciaType.seccion).accessibilityAddTraits(.isHeader)
        VStack(spacing: AlcanciaDimen.space8) {
            OpcionFila(titulo: t("flujo.ningunaMeta"), icono: Ic.wallet, elegida: elegida == nil, conRadio: false) { elegida = nil }
            ForEach(metas.filter { flujo == .entrada ? !$0.usada : $0.guardado > 0 }) { g in
                OpcionFila(titulo: g.nombre, icono: g.icono, elegida: elegida == g.id,
                           subtitulo: t("meta.deObjetivo", ["guardado": Dinero.soles(g.guardado), "objetivo": Dinero.soles(g.objetivo)]), conRadio: false) { elegida = g.id }
            }
        }
    }
}

/// «Así quedaría S/ X» antes de confirmar (lo elegido ya está a la vista: no se repite en un resumen).
struct Proyeccion: View {
    let flujo: Flujo
    let saldo: Int
    let centimos: Int
    var body: some View {
        HStack {
            Text(t("flujo.asiQuedaria")).alcanciaText(AlcanciaType.cuerpo).foregroundStyle(AlcanciaColor.textoSecundario)
            Spacer()
            Text(Dinero.soles(saldo + (flujo == .entrada ? centimos : -centimos))).alcanciaText(AlcanciaType.seccion).foregroundStyle(AlcanciaColor.principal)
        }
        .accessibilityElement(children: .combine)
    }
}

/// Paso 2 · ¿De dónde salió? / ¿En qué la va a usar? · /saldo/motivo · capturas 54, 60. En salidas aquí mismo se confirma.
struct MotivoPantalla: View {
    let flujo: Flujo
    let nombre: String
    let centimos: Int
    let saldo: Int
    @Binding var motivo: String?
    @Binding var detalle: String
    let metas: [MetaUi]
    @Binding var meta: String?
    var enviando = false
    let alAtras: () -> Void
    let alContinuar: () -> Void

    var body: some View {
        let valido = motivo != nil && (motivo != "otro" || !detalle.trimmingCharacters(in: .whitespaces).isEmpty)
        let entrada = flujo == .entrada
        PantallaTarea(titulo: tf(flujo, "titulo"), alAtras: alAtras) {
            Boton(texto: entrada ? t("comun.continuar") : tf(flujo, "confirmar"), habilitado: valido, cargando: enviando, accion: alContinuar)
        } contenido: {
            IndicadorPasos(actual: 2, etiquetas: pasos(flujo))
            Titulo(texto: tf(flujo, "deDonde"))
            GrillaOpciones(opciones: entrada ? Catalogo.motivosEntrada : Catalogo.motivosSalida, elegida: motivo, texto: { t("motivos.\($0.id)") }) { motivo = $0.id }
            if motivo == "otro" { CampoTexto(valor: $detalle, etiqueta: t("flujo.otroCampo")) }
            EleccionMeta(flujo: flujo, metas: metas, elegida: $meta)
            if !entrada && valido { Proyeccion(flujo: flujo, saldo: saldo, centimos: centimos) }
        }
    }
}

/**
 Paso 3 (solo agregar) · ¿Quién le envía? · /saldo/quien · captura 55.
 `relacionAdmin`: relación de quien administra la cuenta (sale «Administra la cuenta» debajo).
 */
struct QuienPantalla: View {
    let centimos: Int
    let saldo: Int
    let motivoTexto: String
    let metaNombre: String?
    @Binding var quien: String?
    @Binding var nombreOtro: String
    var relacionAdmin: String? = nil
    var enviando = false
    let alAtras: () -> Void
    let alConfirmar: () -> Void

    var body: some View {
        let valido = quien != nil && (quien != "otro" || !nombreOtro.trimmingCharacters(in: .whitespaces).isEmpty)
        PantallaTarea(titulo: t("flujo.in.titulo"), alAtras: alAtras) {
            Boton(texto: t("flujo.in.confirmar"), habilitado: valido, cargando: enviando, accion: alConfirmar)
        } contenido: {
            IndicadorPasos(actual: 3, etiquetas: pasos(.entrada))
            Titulo(texto: t("quien.titulo"))
            VStack(spacing: AlcanciaDimen.space8) {
                ForEach(Catalogo.quienEnvia) { p in
                    OpcionFila(titulo: t("quien.\(p.id)"), icono: p.icono, elegida: quien == p.id, subtitulo: relacionAdmin == p.id ? t("quien.admin") : nil) { quien = p.id }
                }
            }
            if quien == "otro" { CampoTexto(valor: $nombreOtro, etiqueta: t("quien.otroCampo"), ejemplo: t("quien.otroEjemplo"), maximo: 30) }
            if valido { Proyeccion(flujo: .entrada, saldo: saldo, centimos: centimos) }
        }
    }
}

/**
 Último paso · ¡Listo! · /saldo/listo · capturas 56, 57.
 `metaLograda`: meta que se completó con esta plata. `diaRecordatorio`: ofrece el recordatorio de propina.
 No se puede volver atrás: al salir, reemplaza la pila de navegación.
 */
struct ListoPantalla: View {
    let flujo: Flujo
    let nombre: String
    let saldo: Int
    var metaLograda: String? = nil
    var diaRecordatorio: String? = nil
    var alRecordar: (Bool) -> Void = { _ in }
    let alVolver: () -> Void
    @State private var moneda = false
    @State private var recordatorio = 0 // 0 = pregunta, 1 = sí, -1 = no

    var body: some View {
        PantallaTarea(titulo: tf(flujo, "titulo")) {
            Boton(texto: t("flujo.volverAlcancia"), accion: alVolver)
        } contenido: {
            IndicadorPasos(actual: pasos(flujo).count, etiquetas: pasos(flujo))
            VStack(spacing: AlcanciaDimen.space12) {
                Spacer().frame(height: 24)
                IconoExito()
                Text(tf(flujo, "listo")).alcanciaText(AlcanciaType.tituloPantalla).multilineTextAlignment(.center).accessibilityAddTraits(.isHeader)
                Text(tf(flujo, "ahora", ["nombre": nombre, "monto": Dinero.soles(saldo)])).alcanciaText(AlcanciaType.cuerpo).foregroundStyle(AlcanciaColor.textoSecundario).multilineTextAlignment(.center)
                if let metaLograda { Aviso(texto: t("flujo.metaAlcanzada", ["meta": metaLograda]), ok: true, icono: Ic.partyPopper) }
                if flujo == .entrada {
                    Text(t("flujo.nino", ["nombre": nombre])).alcanciaText(AlcanciaType.secundario).foregroundStyle(AlcanciaColor.textoSecundario).multilineTextAlignment(.center)
                    MonedaAlChanchito(descripcion: t("flujo.ninoBoton")) { moneda = true }
                    if moneda { Text(t("flujo.ninoListo")).alcanciaText(AlcanciaType.secundario) }
                }
                if let dia = diaRecordatorio, recordatorio == 0 {
                    Tarjeta(tono: .crema) {
                        HStack(spacing: 8) { Icono(nombre: Ic.bell, tamano: 18); Text(t("flujo.recordarTitulo", ["dia": dia])).alcanciaText(AlcanciaType.cuerpo) }
                        HStack(spacing: AlcanciaDimen.space12) {
                            Boton(texto: t("flujo.recordarSi"), variante: .secundario, compacto: true) { recordatorio = 1; alRecordar(true) }
                            Boton(texto: t("flujo.recordarNo"), variante: .terciario, compacto: true) { recordatorio = -1; alRecordar(false) }
                        }
                    }
                }
                if let dia = diaRecordatorio, recordatorio == 1 { Aviso(texto: t("flujo.recordarListo", ["dia": dia]), ok: true) }
            }
            .frame(maxWidth: .infinity)
        }
    }
}

#Preview("Agregar 1 · Cuánto") { CuantoPantalla(flujo: .entrada, nombre: "Sofía", saldo: 2500, monto: .constant("10.00"), alCerrar: {}, alContinuar: {}) }
#Preview("Agregar 2 · De dónde") { MotivoPantalla(flujo: .entrada, nombre: "Sofía", centimos: 1000, saldo: 2500, motivo: .constant("mesada"), detalle: .constant(""), metas: Ejemplos.semana.metas, meta: .constant("g2"), alAtras: {}, alContinuar: {}) }
#Preview("Agregar 3 · Quién envía") { QuienPantalla(centimos: 1000, saldo: 2500, motivoTexto: "Propina de la semana", metaNombre: "Pelota de fútbol", quien: .constant("mama"), nombreOtro: .constant(""), relacionAdmin: "mama", alAtras: {}, alConfirmar: {}) }
#Preview("Agregar 4 · Listo") { ListoPantalla(flujo: .entrada, nombre: "Sofía", saldo: 3500, metaLograda: "Pelota de fútbol", diaRecordatorio: "viernes", alVolver: {}) }
#Preview("Sacar 2 · En qué") { MotivoPantalla(flujo: .salida, nombre: "Sofía", centimos: 500, saldo: 2500, motivo: .constant("compra"), detalle: .constant(""), metas: Ejemplos.semana.metas, meta: .constant(nil), alAtras: {}, alContinuar: {}) }
