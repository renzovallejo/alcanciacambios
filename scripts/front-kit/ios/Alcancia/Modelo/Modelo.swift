import Foundation

/*
 Estado de UI: lo que cada pantalla necesita para dibujarse, con los textos dinámicos ya resueltos.
 Tu ViewModel convierte el dominio (06-datos/modelos/Modelos.swift) a estas estructuras.
 Dinero siempre en céntimos (Int). S/ 10.50 = 1050.
 */

enum Flujo { case entrada, salida }

/// conectado · sinConexion (ya se conectó antes) · nuncaConectado (cuenta nueva: se invita a conectar, no es error).
enum Conexion { case conectado, sinConexion, nuncaConectado }

struct MetaUi: Identifiable, Equatable {
    let id: String
    var nombre: String
    /// Icono Lucide: "book-open" | "puzzle" | "target".
    var icono: String
    var guardado: Int
    var objetivo: Int
    /// Llegó al objetivo alguna vez (no se pierde aunque se use la plata).
    var lograda: Bool
    /// Lograda y ya sin plata.
    var usada: Bool = false

    init(id: String, nombre: String, icono: String, guardado: Int, objetivo: Int, lograda: Bool? = nil, usada: Bool = false) {
        self.id = id; self.nombre = nombre; self.icono = icono; self.guardado = guardado; self.objetivo = objetivo
        self.lograda = lograda ?? (guardado >= objetivo); self.usada = usada
    }
    /// 0–100, entero. La barra nunca va sola: siempre con «S/ X de S/ Y».
    var porcentaje: Int { objetivo <= 0 ? 0 : min(100, Int((Double(guardado) * 100 / Double(objetivo)).rounded())) }
}

struct MovimientoUi: Identifiable, Equatable {
    let id: String
    var flujo: Flujo
    /// Siempre positivo; el signo lo pone la UI según el flujo.
    var centimos: Int
    /// Entradas: quién envió (Abuela, Tío Jorge). Salidas: quién lo hizo.
    var quien: String
    /// «hoy», «ayer», «30 sep».
    var cuando: String
    var motivo: String
    var meta: String? = nil
}

struct MesUi: Identifiable, Equatable {
    var id: String { titulo }
    var titulo: String
    var entro: Int
    var salio: Int
    var movimientos: [MovimientoUi]
}

/// Pantalla Alcancía (inicio).
struct AlcanciaUi: Equatable {
    var nombre: String
    var conexion: Conexion
    var saldo: Int
    /// Entradas de los últimos 7 días (0 = no se muestra la línea).
    var estaSemana: Int = 0
    var metas: [MetaUi] = []
    /// Los 2 últimos.
    var movimientos: [MovimientoUi] = []
    /// Monto del borrador a medias (nil = no hay).
    var borrador: Int? = nil
    /// Nombre del día si hoy es día de propina y aún no la guardan (nil = sin aviso).
    var diaPropina: String? = nil
    /// Idea de 1 minuto del día.
    var idea: String? = nil

    var primerDia: Bool { saldo == 0 && metas.isEmpty && movimientos.isEmpty }
}

/// Una opción elegible (motivo, quién envía): id + icono; el texto sale de Localizable.strings.
struct Opcion: Identifiable, Equatable { let id: String; let icono: String }

/// Opciones en el orden de pantalla. Texto: motivos.<id> / quien.<id>. Iguales en web, Android e iOS.
enum Catalogo {
    static let motivosEntrada = [
        Opcion(id: "mesada", icono: "calendar-days"), Opcion(id: "ayuda-en-casa", icono: "house"), Opcion(id: "cumpleanos", icono: "cake"),
        Opcion(id: "propina", icono: "hand-coins"), Opcion(id: "buen-comportamiento", icono: "star"), Opcion(id: "otro", icono: "ellipsis"),
    ]
    static let motivosSalida = [
        Opcion(id: "compra", icono: "shopping-cart"), Opcion(id: "regalo", icono: "party-popper"), Opcion(id: "compartir", icono: "hand-heart"), Opcion(id: "otro", icono: "ellipsis"),
    ]
    /// «otro» pide el nombre (obligatorio).
    static let quienEnvia = [
        Opcion(id: "mama", icono: "user-round"), Opcion(id: "papa", icono: "user-round"), Opcion(id: "abuela", icono: "person-standing"),
        Opcion(id: "abuelo", icono: "person-standing"), Opcion(id: "tio", icono: "users-round"), Opcion(id: "otro", icono: "user-round-plus"),
    ]
    static let montosRapidos = [500, 1000, 2000]
    static let pasosEntrada = ["flujo.pasoCuanto", "flujo.pasoDeDonde", "flujo.pasoQuien", "flujo.pasoListo"]
    static let pasosSalida = ["flujo.pasoCuanto", "flujo.pasoEnQue", "flujo.pasoListo"]
}
