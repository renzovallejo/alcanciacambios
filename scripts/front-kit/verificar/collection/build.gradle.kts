// Solo para este entorno sin Google Maven: compila androidx.collection desde las fuentes
// publicadas por JetBrains en Maven Central (org.jetbrains.compose.collection-internal:1.6.11, Apache 2.0).
plugins { kotlin("multiplatform") }
kotlin {
    jvm()
    jvmToolchain(21)
    sourceSets {
        commonMain { kotlin.srcDir(file(System.getProperty("collectionSrc", "/tmp/coll") + "/commonMain")) }
        jvmMain { kotlin.srcDir(file(System.getProperty("collectionSrc", "/tmp/coll") + "/jbMain")) }
    }
}
kotlin { sourceSets { commonMain { dependencies { implementation(project(":annotation")); implementation("org.jetbrains.kotlinx:atomicfu:0.23.2") } } } }
kotlin { sourceSets.all { languageSettings.optIn("kotlin.contracts.ExperimentalContracts"); languageSettings.optIn("kotlin.ExperimentalMultiplatform") }; compilerOptions { freeCompilerArgs.add("-Xexpect-actual-classes") } }
