// Verifica el kit Compose de Android compilándolo para escritorio (mismas APIs de Compose)
// y renderiza cada componente y pantalla a PNG. Uso: gradle -q run --args="<carpeta-salida>"
plugins {
    kotlin("jvm") version "2.1.21"
    kotlin("multiplatform") version "2.1.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.21"
    application
}
val compose = "1.6.11"
dependencies {
    implementation("org.jetbrains.compose.ui:ui-desktop:$compose")
    implementation("org.jetbrains.compose.foundation:foundation-desktop:$compose")
    implementation("org.jetbrains.compose.material3:material3-desktop:$compose")
    implementation("org.jetbrains.compose.ui:ui-test-junit4-desktop:$compose")
    runtimeOnly("org.jetbrains.skiko:skiko-awt-runtime-linux-x64:0.8.4")
}
kotlin { jvmToolchain(21) }
sourceSets["main"].kotlin.srcDir("../android/ui")   // el código del kit, tal cual se entrega
sourceSets["main"].kotlin.srcDir("plataforma")       // reemplazo de escritorio de Plataforma.android.kt
application { mainClass.set("pe.alcancia.verificar.RenderKt") }
// Sin Google Maven (-PsinGoogleMaven=true): androidx.collection/annotation se compilan desde fuentes y lifecycle no se usa.
if (providers.gradleProperty("sinGoogleMaven").isPresent) configurations.all {
    exclude(group = "androidx.lifecycle")
    resolutionStrategy.dependencySubstitution {
        substitute(module("androidx.collection:collection")).using(project(":collection"))
        substitute(module("androidx.annotation:annotation")).using(project(":annotation"))
    }
}
