# Mascota «Chanchito»

**Fuente vectorial:** `chanchito.svg` (proporción 585 × 576, fondo transparente, solo el chanchito, margen parejo de 4 a cada lado).

- Sin ancho ni alto fijos: se adapta al espacio donde se abre o se coloca y queda centrado (vista previa de macOS, navegador, Figma). Si una herramienta pide tamaño, usar 585 × 576 o múltiplos.

- Lienzo desde 0, 0 (`viewBox="0 0 585 576"`). El archivo original tenía `viewBox="192 216 608 600"`: el navegador lo respetaba, pero muchos visores y apps de diseño ignoran ese desplazamiento y el dibujo se corría a la izquierda con espacio vacío. Se corrigió moviendo el contenido, sin cambiar el dibujo (comparado píxel a píxel con el original).
- Se quitaron los metadatos de procedencia (C2PA) que no hacen falta para usarlo.
- Usa degradados y desenfoques (`feGaussianBlur`). Para las apps se entrega en PNG (`1x/`, `2x/`, `3x/`), porque el catálogo de Xcode y los VectorDrawable de Android no soportan desenfoques. El SVG es la fuente para diseño y para generar nuevos tamaños.
- Uso en la app: 64 dp en el saldo y las tarjetas; 72 dp en «¡Listo!». Nunca deformarlo ni cambiarle los colores.
