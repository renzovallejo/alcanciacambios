import SwiftUI

/// Todo lo que se puede tocar en Alcancía. Por defecto no hace nada: conecta solo lo que necesites.
struct AccionesAlcancia {
    var alAjustes: () -> Void = {}
    var alPersona: () -> Void = {}
    var alConexion: () -> Void = {}
    var alAgregar: () -> Void = {}
    var alSacar: () -> Void = {}
    var alSeguirBorrador: () -> Void = {}
    var alDescartarBorrador: () -> Void = {}
    var alGuardarPropina: () -> Void = {}
    var alVerMetas: () -> Void = {}
    var alMeta: (String) -> Void = { _ in }
    var alPonerMeta: () -> Void = {}
    var alVerMovimientos: () -> Void = {}
    var alMovimiento: (String) -> Void = { _ in }
    var alIdeaHecha: () -> Void = {}
}

/**
 Alcancía (inicio) · ruta web «/» · capturas 01 (primer día) y 13 (semana).
 `saldoAnterior`: el saldo que vio la persona antes de guardar/sacar, para que el monto cuente hasta el nuevo.
 `nuevoId`: id del movimiento recién guardado (se resalta).
 */
struct AlcanciaPantalla: View {
    let estado: AlcanciaUi
    var acciones = AccionesAlcancia()
    var saldoAnterior: Int? = nil
    var nuevoId: String? = nil
    @State private var ideaHecha = false

    var body: some View {
        PantallaPestana {
            EncabezadoPantalla(titulo: t("nav.alcancia"), alAjustes: acciones.alAjustes)
            FilaContexto(nombre: estado.nombre, conexion: estado.conexion, alPersona: acciones.alPersona, alConexion: acciones.alConexion)
            TarjetaSaldo(nombre: estado.nombre, saldo: estado.saldo, saldoAnterior: saldoAnterior, estaSemana: estado.estaSemana)

            if let borrador = estado.borrador {
                Banner(icono: Ic.pause, texto: t("alcancia.borrador", ["monto": Dinero.soles(borrador)])) {
                    Boton(texto: t("alcancia.borradorDescartar"), variante: .terciario, anchoCompleto: false, accion: acciones.alDescartarBorrador)
                    Boton(texto: t("alcancia.borradorSeguir"), variante: .secundario, anchoCompleto: false, accion: acciones.alSeguirBorrador)
                }
            } else if let dia = estado.diaPropina {
                Banner(icono: Ic.bell, texto: t("alcancia.recordatorio", ["dia": dia])) {
                    Boton(texto: t("alcancia.recordatorioBoton"), variante: .secundario, anchoCompleto: false, accion: acciones.alGuardarPropina)
                }
            }

            if estado.primerDia {
                Text(t("alcancia.valorPrimerDia", ["nombre": estado.nombre])).alcanciaText(AlcanciaType.secundario).foregroundStyle(AlcanciaColor.textoSecundario)
                Boton(texto: t("alcancia.primeraPlata"), accion: acciones.alAgregar)
            } else {
                HStack(spacing: AlcanciaDimen.space12) {
                    Boton(texto: t("alcancia.agregarPlata"), compacto: true, accion: acciones.alAgregar)
                    // Sin plata no se ofrece sacar.
                    if estado.saldo > 0 { Boton(texto: t("alcancia.sacarPlata"), variante: .secundario, compacto: true, accion: acciones.alSacar) }
                }
            }

            EncabezadoSeccion(titulo: t("alcancia.susMetas"), accion: estado.metas.isEmpty ? nil : t("comun.verTodas", ["count": estado.metas.count]), alAccion: acciones.alVerMetas)
            if estado.metas.isEmpty {
                Tarjeta(tono: .crema) {
                    HStack(spacing: AlcanciaDimen.space12) {
                        IconTile(icono: Ic.target, tono: .acento)
                        Text(t("alcancia.metaVaciaTitulo", ["nombre": estado.nombre])).alcanciaText(AlcanciaType.seccion)
                    }
                    Text(t("alcancia.metaVaciaTexto")).alcanciaText(AlcanciaType.cuerpo).foregroundStyle(AlcanciaColor.textoSecundario)
                    Boton(texto: t("alcancia.metaVaciaBoton"), variante: .secundario, accion: acciones.alPonerMeta)
                }
            } else {
                // Orden estable (de creación); las ya usadas no ocupan lugar en la portada.
                VStack(spacing: AlcanciaDimen.space8) {
                    ForEach(estado.metas.filter { !$0.usada }.prefix(2)) { m in TarjetaMeta(meta: m) { acciones.alMeta(m.id) } }
                }
            }

            EncabezadoSeccion(titulo: t("alcancia.loUltimo"), accion: estado.movimientos.isEmpty ? nil : t("comun.verTodos"), alAccion: acciones.alVerMovimientos)
            if estado.movimientos.isEmpty {
                HStack(spacing: AlcanciaDimen.space12) {
                    IconTile(icono: Ic.list, tono: .azul)
                    VStack(alignment: .leading) {
                        Text(t("alcancia.vacioTitulo")).alcanciaText(AlcanciaType.elemento)
                        Text(t("alcancia.vacioTexto")).alcanciaText(AlcanciaType.secundario).foregroundStyle(AlcanciaColor.textoSecundario)
                    }
                }
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(estado.movimientos.enumerated()), id: \.element.id) { i, m in
                        if i > 0 { Separador() }
                        FilaMovimiento(m: m, nuevo: m.id == nuevoId) { acciones.alMovimiento(m.id) }
                    }
                    Separador()
                }
            }

            if !estado.primerDia, let idea = estado.idea {
                TarjetaIdea(idea: idea, hecho: $ideaHecha, alHecho: acciones.alIdeaHecha)
            }
        }
    }
}

#Preview("Alcancía · semana") { AlcanciaPantalla(estado: Ejemplos.semana) }
#Preview("Alcancía · primer día") { AlcanciaPantalla(estado: Ejemplos.primerDia) }
#Preview("Alcancía · borrador") { AlcanciaPantalla(estado: Ejemplos.semana.cambiando { $0.borrador = 700 }) }
#Preview("Alcancía · día de propina") { AlcanciaPantalla(estado: Ejemplos.semana.cambiando { $0.diaPropina = "viernes" }) }

extension AlcanciaUi {
    /// Copia con cambios, útil para previews: Ejemplos.semana.cambiando { $0.borrador = 700 }
    func cambiando(_ cambio: (inout AlcanciaUi) -> Void) -> AlcanciaUi { var copia = self; cambio(&copia); return copia }
}
