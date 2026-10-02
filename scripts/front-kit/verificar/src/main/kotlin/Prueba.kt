package pe.alcancia.verificar

import androidx.compose.ui.test.*
import pe.alcancia.ui.ejemplos.Ejemplos
import pe.alcancia.ui.pantallas.DemoFlujoPlata
import pe.alcancia.ui.tema.AlcanciaTheme

/** Recorre el flujo real con toques: agregar S/ 10 de la Abuela y sacar S/ 5. Falla si algo no responde. */
@OptIn(ExperimentalTestApi::class)
fun probarFlujo() = runComposeUiTest {
    setContent { AlcanciaTheme(reducirMovimiento = true) { DemoFlujoPlata(Ejemplos.semana) } }
    fun toca(texto: String) { println("    toca «$texto»"); onAllNodesWithText(texto, substring = true, useUnmergedTree = true).onFirst().performClick(); waitForIdle() }
    fun ve(texto: String) { println("    ve «$texto»"); onAllNodesWithText(texto, substring = true, useUnmergedTree = true).onFirst().assertExists() }

    ve("S/ 25.00")
    toca("Agregar plata"); ve("¿Cuánto va a guardar?"); ve("Paso 1 de 4")
    toca("Continuar"); ve("¿De dónde salió esta plata?")
    toca("Continuar"); ve("¿Quién le envía?"); ve("Administra la cuenta")
    toca("Abuela"); ve("Así quedaría")
    toca("Otro pariente"); onNodeWithText("Sí, guardar", useUnmergedTree = true).onParent().assertIsNotEnabled()
    toca("Abuela"); onNodeWithText("Sí, guardar", useUnmergedTree = true).onParent().assertIsEnabled()
    toca("Sí, guardar"); ve("¡Listo, ya se guardó!"); ve("S/ 35.00")
    toca("Volver a Alcancía"); ve("Abuela · hoy · Su propina de la semana")
    toca("Sacar plata"); ve("¿Cuánto va a sacar?"); ve("Paso 1 de 3")
    toca("Continuar"); toca("Se compró algo"); ve("Así quedaría")
    toca("Sí, sacar"); ve("¡Listo, ya se sacó!"); ve("S/ 30.00")
    println("  flujo agregar + sacar: ok")
}
