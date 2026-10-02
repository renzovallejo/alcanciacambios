#!/usr/bin/env bash
# Solo si NO tienes acceso a Google Maven (dl.google.com): descarga las fuentes de androidx.collection
# y androidx.annotation que JetBrains publica en Maven Central y las deja listas para compilarse aquí.
# Con acceso a Google Maven no hace falta: borra los subproyectos :collection y :annotation.
set -euo pipefail
V=1.6.11; B=https://repo.maven.apache.org/maven2/org/jetbrains/compose
rm -rf /tmp/coll /tmp/annot && mkdir -p /tmp/coll /tmp/annot
bajar() { curl -fsSL "$1" -o "$2" && unzip -tq "$2" >/dev/null || { echo "No se pudo bajar $1 (¿límite de Maven Central? espera un minuto)"; exit 1; }; }
bajar "$B/collection-internal/collection/$V/collection-$V-sources.jar" /tmp/coll/s.jar && (cd /tmp/coll && unzip -qo s.jar)
bajar "$B/annotation-internal/annotation/$V/annotation-$V-sources.jar" /tmp/annot/s.jar && (cd /tmp/annot && unzip -qo s.jar)
# Las clases expect no aceptan @JvmField/@JvmSynthetic en Kotlin 2.1 fuera del build de Google.
for f in LongSparseArray SparseArrayCompat; do sed -i '/^\s*@JvmSynthetic \/\/ Hide from Java callers\.$/d; /^\s*@JvmField$/d' "/tmp/coll/commonMain/androidx/collection/$f.kt"; done

# La versión JVM de este helper vive en el jvmMain de Google, que no viene en el jar: se agrega.
cat > /tmp/coll/jbMain/androidx/collection/internal/PackingHelpers.jvm.kt <<'KT'
package androidx.collection.internal
@PublishedApi internal actual inline fun floatFromBits(bits: Int): Float = java.lang.Float.intBitsToFloat(bits)
KT
echo "listo"
