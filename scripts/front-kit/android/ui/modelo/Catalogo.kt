package pe.alcancia.ui.modelo

/** Opciones en el orden de pantalla. El texto: motivos.<id> / quien.<id> en es.json. Iguales en web, Android e iOS. */
object Catalogo {
    val MOTIVOS_ENTRADA = listOf(
        Opcion("mesada", "calendar-days"), Opcion("ayuda-en-casa", "house"), Opcion("cumpleanos", "cake"),
        Opcion("propina", "hand-coins"), Opcion("buen-comportamiento", "star"), Opcion("otro", "ellipsis"),
    )
    val MOTIVOS_SALIDA = listOf(
        Opcion("compra", "shopping-cart"), Opcion("regalo", "party-popper"), Opcion("compartir", "hand-heart"), Opcion("otro", "ellipsis"),
    )
    /** «otro» pide el nombre (obligatorio). */
    val QUIEN_ENVIA = listOf(
        Opcion("mama", "user-round"), Opcion("papa", "user-round"), Opcion("abuela", "person-standing"),
        Opcion("abuelo", "person-standing"), Opcion("tio", "users-round"), Opcion("otro", "user-round-plus"),
    )
    /** Montos rápidos del paso «Cuánto». */
    val MONTOS_RAPIDOS = listOf(500, 1000, 2000)
    /** Pasos de cada flujo (claves de es.json). */
    val PASOS_ENTRADA = listOf("flujo.pasoCuanto", "flujo.pasoDeDonde", "flujo.pasoQuien", "flujo.pasoListo")
    val PASOS_SALIDA = listOf("flujo.pasoCuanto", "flujo.pasoEnQue", "flujo.pasoListo")
}
