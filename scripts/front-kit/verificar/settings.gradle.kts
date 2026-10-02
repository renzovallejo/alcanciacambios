pluginManagement { repositories { gradlePluginPortal(); mavenCentral() } }
// -PsinGoogleMaven=true: para entornos sin acceso a Google Maven (ver preparar-sin-google-maven.sh).
val sinGoogle = providers.gradleProperty("sinGoogleMaven").isPresent
dependencyResolutionManagement { repositories { mavenCentral(); if (!sinGoogle) google() } }
rootProject.name = "verificar-kit"
if (sinGoogle) include(":collection", ":annotation")
