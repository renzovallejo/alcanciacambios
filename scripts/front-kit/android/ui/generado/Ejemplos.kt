// Generado por scripts/front-kit/generar.ts. No editar a mano: cambia la fuente (src/) y vuelve a generar.
package pe.alcancia.ui.ejemplos

import pe.alcancia.ui.modelo.*

/** Datos reales de las semillas del prototipo (semana y primer día) para previews y pruebas de UI. */
object Ejemplos {
    val semana = AlcanciaUi(
        nombre = "Sofía", conexion = Conexion.Conectado, saldo = 2500, estaSemana = 2000,
        metas = listOf(MetaUi("g1", "Libro de dinosaurios", "book-open", guardado = 1200, objetivo = 3000, lograda = false, usada = false), MetaUi("g2", "Pelota de fútbol", "target", guardado = 1000, objetivo = 2000, lograda = false, usada = false)),
        movimientos = listOf(
            MovimientoUi("w8", Flujo.Entrada, 1000, quien = "Mamá", cuando = "hoy", motivo = "Propina de la semana", meta = "Pelota de fútbol"),
            MovimientoUi("w7", Flujo.Entrada, 100, quien = "Abuela", cuando = "ayer", motivo = "Se portó bien", meta = null),
        ),
        idea = "Cuenten juntos las monedas de su chanchito antes de dormir.",
    )

    val primerDia = AlcanciaUi(
        nombre = "Sofía", conexion = Conexion.NuncaConectado, saldo = 0, estaSemana = 0,
        metas = listOf(),
        movimientos = listOf(

        ),
        idea = null,
    )

    /** Lo que entró y salió en la semana, agrupado por mes. */
    val meses = listOf(
        MesUi("octubre", entro = 1100, salio = 0, movimientos = listOf(
            MovimientoUi("w8", Flujo.Entrada, 1000, quien = "Mamá", cuando = "hoy", motivo = "Propina de la semana", meta = "Pelota de fútbol"),
            MovimientoUi("w7", Flujo.Entrada, 100, quien = "Abuela", cuando = "ayer", motivo = "Se portó bien", meta = null),
        )),
        MesUi("setiembre", entro = 1900, salio = 500, movimientos = listOf(
            MovimientoUi("w6", Flujo.Entrada, 200, quien = "Papá", cuando = "30 sep", motivo = "Ayudó en casa", meta = "Libro de dinosaurios"),
            MovimientoUi("w5", Flujo.Salida, 200, quien = "", cuando = "29 sep", motivo = "Hizo un regalo", meta = null),
            MovimientoUi("w4", Flujo.Salida, 300, quien = "", cuando = "28 sep", motivo = "Se compró algo", meta = null),
            MovimientoUi("w3", Flujo.Entrada, 500, quien = "Tío Jorge", cuando = "27 sep", motivo = "Le dieron propina", meta = null),
            MovimientoUi("w2", Flujo.Entrada, 200, quien = "Papá", cuando = "26 sep", motivo = "Ayudó en casa", meta = null),
            MovimientoUi("w1", Flujo.Entrada, 1000, quien = "Mamá", cuando = "25 sep", motivo = "Propina de la semana", meta = "Libro de dinosaurios"),
        )),
    )
}
