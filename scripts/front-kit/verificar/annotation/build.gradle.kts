// Solo para este entorno sin Google Maven: androidx.annotation desde las fuentes publicadas por JetBrains (Apache 2.0).
plugins { kotlin("multiplatform") }
kotlin {
    jvm()
    jvmToolchain(21)
    sourceSets {
        commonMain { kotlin.srcDir(file(System.getProperty("annotationSrc", "/tmp/annot") + "/commonMain")) }
        jvmMain { kotlin.srcDir(file(System.getProperty("annotationSrc", "/tmp/annot") + "/nonJvmMain")) }
    }
}
