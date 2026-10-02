import SwiftUI

/// Título de pestaña (26 pt) + botón ⚙️ que abre los ajustes del chanchito.
struct EncabezadoPantalla: View {
    let titulo: String
    var alAjustes: (() -> Void)? = nil
    var body: some View {
        HStack {
            Text(titulo).alcanciaText(AlcanciaType.tituloPantalla).accessibilityAddTraits(.isHeader)
            Spacer()
            if let alAjustes { BotonIcono(icono: Ic.settings, descripcion: t("comun.ajustesChanchito"), accion: alAjustes) }
        }
        .frame(minHeight: 44)
    }
}

/// Fila de contexto: nombre del niño (abre el selector) y estado del chanchito (abre sus ajustes).
struct FilaContexto: View {
    let nombre: String
    let conexion: Conexion
    var alPersona: () -> Void = {}
    var alConexion: () -> Void = {}
    var body: some View {
        HStack {
            Button(action: alPersona) {
                HStack(spacing: 6) {
                    Text(nombre).alcanciaText(AlcanciaType.seccion)
                    Icono(nombre: Ic.chevronDown, tamano: 16)
                }
                .foregroundStyle(AlcanciaColor.texto).frame(minHeight: 44)
            }
            .accessibilityLabel(t("comun.estasViendo", ["nombre": nombre]))
            Spacer()
            EstadoConexion(conexion: conexion, accion: alConexion)
        }
    }
}

/// Un solo estado para toda la app. Si nunca se conectó, se invita («Conectar chanchito»), no se alarma.
struct EstadoConexion: View {
    let conexion: Conexion
    var accion: () -> Void = {}
    var body: some View {
        let invita = conexion == .nuncaConectado
        let clave = conexion == .conectado ? "conexion.conectado" : invita ? "conexion.conectar" : "conexion.sinConexion"
        let color = invita ? AlcanciaColor.principal : AlcanciaColor.textoSecundario
        let peso = invita ? 600 : 400
        return Button(action: accion) {
            HStack(spacing: 6) {
                Icono(nombre: Ic.wifi, tamano: 16)
                Text(t(clave)).alcanciaText(AlcanciaType.etiqueta.peso(peso))
            }
            .foregroundStyle(color).frame(minHeight: 44)
        }
    }
}

/// «Sus metas ··· Ver todas (2)».
struct EncabezadoSeccion: View {
    let titulo: String
    var accion: String? = nil
    var alAccion: () -> Void = {}
    var body: some View {
        HStack {
            Text(titulo).alcanciaText(AlcanciaType.seccion).accessibilityAddTraits(.isHeader)
            Spacer()
            if let accion {
                Button(action: alAccion) { Text(accion).alcanciaText(AlcanciaType.secundario.peso(600)).foregroundStyle(AlcanciaColor.principal).frame(minHeight: 44) }
            }
        }
        .padding(.top, AlcanciaDimen.space12)
    }
}

/// Pantalla de pestaña: margen 24 y scroll. La barra inferior la pone tu TabView / contenedor.
struct PantallaPestana<Contenido: View>: View {
    @ViewBuilder let contenido: () -> Contenido
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AlcanciaDimen.space12, content: contenido)
                .padding(.horizontal, AlcanciaDimen.pageMargin)
                .padding(.vertical, AlcanciaDimen.space24)
        }
        .background(AlcanciaColor.base)
        .foregroundStyle(AlcanciaColor.texto)
    }
}

/**
 Tarea enfocada (flujos de plata, formularios): barra con ← o ✕, contenido con scroll y
 acción principal fija al pie (sobre el teclado y el área segura) con una ayuda corta.
 */
struct PantallaTarea<Contenido: View, Pie: View>: View {
    let titulo: String
    var alAtras: (() -> Void)? = nil
    var cerrar = false
    var ayudaPie: String? = nil
    @ViewBuilder let pie: () -> Pie
    @ViewBuilder let contenido: () -> Contenido

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: AlcanciaDimen.space12) {
                    if let alAtras {
                        HStack(spacing: AlcanciaDimen.space12) {
                            BotonIcono(icono: cerrar ? Ic.x : Ic.arrowLeft, descripcion: t(cerrar ? "comun.cerrar" : "comun.volver"), conFondo: false, accion: alAtras)
                            Text(titulo).alcanciaText(AlcanciaType.seccion)
                        }
                        .padding(.leading, -10)
                    }
                    contenido()
                }
                .padding(.horizontal, AlcanciaDimen.pageMargin)
                .padding(.vertical, AlcanciaDimen.space16)
            }
            // Sin acción al pie (pie = EmptyView) no se dibuja la barra.
            if Pie.self != EmptyView.self {
                Separador()
                VStack(spacing: AlcanciaDimen.space8) {
                    pie()
                    if let ayudaPie { Text(ayudaPie).alcanciaText(AlcanciaType.secundario).foregroundStyle(AlcanciaColor.textoSecundario).multilineTextAlignment(.center) }
                }
                .padding(.horizontal, AlcanciaDimen.pageMargin)
                .padding(.vertical, AlcanciaDimen.space16)
            }
        }
        .background(AlcanciaColor.base)
        .foregroundStyle(AlcanciaColor.texto)
    }
}

/// «Paso 2 de 4 · De dónde salió» + segmentos que se pintan al avanzar.
struct IndicadorPasos: View {
    let actual: Int
    let etiquetas: [String]
    @Environment(\.accessibilityReduceMotion) private var reducir
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(t("flujo.paso", ["actual": actual, "total": etiquetas.count, "etiqueta": etiquetas[actual - 1]]))
                .alcanciaText(AlcanciaType.secundario).foregroundStyle(AlcanciaColor.textoSecundario)
            HStack(spacing: 4) {
                ForEach(etiquetas.indices, id: \.self) { i in
                    Capsule().fill(i < actual ? AlcanciaColor.principal : AlcanciaColor.borde).frame(height: 4)
                }
            }
            .animation(reducir ? nil : .easeOut(duration: 0.35), value: actual)
            .accessibilityHidden(true)
        }
        .padding(.bottom, AlcanciaDimen.space8)
    }
}

/// Barra inferior: Alcancía · Aprender · Progreso. La píldora azul se desliza a la pestaña elegida (280 ms).
struct BarraPestanas: View {
    @Binding var elegida: Int
    @Namespace private var pildora
    @Environment(\.accessibilityReduceMotion) private var reducir
    private let pestanas = [(Ic.piggyBank, "nav.alcancia"), (Ic.bookOpen, "nav.aprender"), (Ic.chartNoAxesCombined, "nav.progreso")]
    var body: some View {
        VStack(spacing: 0) {
            Separador()
            HStack(spacing: 8) {
                ForEach(pestanas.indices, id: \.self) { i in
                    let on = i == elegida
                    Button {
                        withAnimation(reducir ? nil : AlcanciaEasing.emphasized(AlcanciaMotion.pildora)) { elegida = i }
                    } label: {
                        VStack(spacing: 2) {
                            Icono(nombre: pestanas[i].0, tamano: 22)
                            Text(t(pestanas[i].1)).alcanciaText(AlcanciaType.etiqueta.peso(on ? 600 : 400))
                        }
                        .foregroundStyle(on ? AlcanciaColor.principal : AlcanciaColor.textoSecundario)
                        .frame(maxWidth: .infinity, minHeight: 52)
                        .background {
                            if on { RoundedRectangle(cornerRadius: AlcanciaDimen.radius14).fill(AlcanciaColor.fondoAzul).matchedGeometryEffect(id: "pildora", in: pildora) }
                        }
                    }
                    .accessibilityAddTraits(on ? [.isButton, .isSelected] : .isButton)
                }
            }
            .padding(AlcanciaDimen.space8)
        }
        .background(AlcanciaColor.base)
    }
}
