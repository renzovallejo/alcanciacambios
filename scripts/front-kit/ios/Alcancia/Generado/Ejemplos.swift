// Generado por scripts/front-kit/generar.ts. No editar a mano: cambia la fuente (src/) y vuelve a generar.

/// Datos reales de las semillas del prototipo (semana y primer día) para previews y pruebas de UI.
enum Ejemplos {
    static let semana = AlcanciaUi(
        nombre: "Sofía", conexion: .conectado, saldo: 2500, estaSemana: 2000,
        metas: [MetaUi(id: "g1", nombre: "Libro de dinosaurios", icono: "book-open", guardado: 1200, objetivo: 3000, lograda: false, usada: false), MetaUi(id: "g2", nombre: "Pelota de fútbol", icono: "target", guardado: 1000, objetivo: 2000, lograda: false, usada: false)],
        movimientos: [
            MovimientoUi(id: "w8", flujo: .entrada, centimos: 1000, quien: "Mamá", cuando: "hoy", motivo: "Su propina de la semana", meta: "Pelota de fútbol"),
            MovimientoUi(id: "w7", flujo: .entrada, centimos: 100, quien: "Abuela", cuando: "ayer", motivo: "Se portó bien", meta: nil),
        ],
        idea: "Cuenten juntos las monedas de su chanchito antes de dormir."
    )

    static let primerDia = AlcanciaUi(
        nombre: "Sofía", conexion: .nuncaConectado, saldo: 0, estaSemana: 0,
        metas: [],
        movimientos: [

        ],
        idea: nil
    )

    /// Lo que entró y salió en la semana, agrupado por mes.
    static let meses = [
        MesUi(titulo: "octubre", entro: 1100, salio: 0, movimientos: [
            MovimientoUi(id: "w8", flujo: .entrada, centimos: 1000, quien: "Mamá", cuando: "hoy", motivo: "Su propina de la semana", meta: "Pelota de fútbol"),
            MovimientoUi(id: "w7", flujo: .entrada, centimos: 100, quien: "Abuela", cuando: "ayer", motivo: "Se portó bien", meta: nil),
        ]),
        MesUi(titulo: "setiembre", entro: 1900, salio: 500, movimientos: [
            MovimientoUi(id: "w6", flujo: .entrada, centimos: 200, quien: "Papá", cuando: "30 sep", motivo: "Ayudó en casa", meta: "Libro de dinosaurios"),
            MovimientoUi(id: "w5", flujo: .salida, centimos: 200, quien: "Mamá", cuando: "29 sep", motivo: "Hizo un regalo", meta: nil),
            MovimientoUi(id: "w4", flujo: .salida, centimos: 300, quien: "Mamá", cuando: "28 sep", motivo: "Se compró algo", meta: nil),
            MovimientoUi(id: "w3", flujo: .entrada, centimos: 500, quien: "Tío Jorge", cuando: "27 sep", motivo: "Le dieron propina", meta: nil),
            MovimientoUi(id: "w2", flujo: .entrada, centimos: 200, quien: "Papá", cuando: "26 sep", motivo: "Ayudó en casa", meta: nil),
            MovimientoUi(id: "w1", flujo: .entrada, centimos: 1000, quien: "Mamá", cuando: "25 sep", motivo: "Su propina de la semana", meta: "Libro de dinosaurios"),
        ]),
    ]
}
