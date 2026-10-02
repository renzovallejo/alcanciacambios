"""
Genera todas las variantes del ícono de la app desde el maestro del sistema de diseño:
  docs/sistema-de-diseno/assets/icono-app/original/AppIcon-1024.png
Salidas en docs/sistema-de-diseno/assets/icono-app/{web,android,ios} y copia web en public/.
Uso: python3 scripts/icono-app/generar.py   (requiere: pip install pillow)
"""
import json, os, shutil
from PIL import Image, ImageDraw, ImageFilter

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
A = os.path.join(RAIZ, 'docs', 'sistema-de-diseno', 'assets', 'icono-app')
src = Image.open(os.path.join(A, 'original', 'AppIcon-1024.png')).convert('RGB')

def guardar(im, *partes):
    p = os.path.join(A, *partes); os.makedirs(os.path.dirname(p), exist_ok=True); im.save(p, optimize=True); return p

def tam(n): return src.resize((n, n), Image.LANCZOS)

def redondeado(n, radio=0.225):
    """Para favicons: la pestaña del navegador no aplica máscara, así que se redondea aquí."""
    k = 4; m = Image.new('L', (n * k, n * k), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, n * k - 1, n * k - 1), radius=int(n * k * radio), fill=255)
    im = tam(n).convert('RGBA'); im.putalpha(m.resize((n, n), Image.LANCZOS)); return im

def fondo_icono(n):
    """Fondo del ícono sin el chanchito: azul principal con halo morado arriba a la izquierda y naranja abajo a la derecha
    (mismos colores que el maestro)."""
    k = 256; azul, morado, naranja = (0x14, 0x1C, 0x7A), (0x6A, 0x22, 0xB9), (0xE9, 0x76, 0x39)
    im = Image.new('RGB', (k, k), azul); px = im.load()
    for y in range(k):
        for x in range(k):
            dm = ((x / k - 0.02) ** 2 + (y / k - 0.18) ** 2) ** 0.5; dn = ((x / k - 1.0) ** 2 + (y / k - 1.0) ** 2) ** 0.5
            wm = max(0.0, 1 - dm / 0.55) ** 1.6; wn = max(0.0, 1 - dn / 0.6) ** 1.5
            px[x, y] = tuple(int(azul[i] * (1 - wm - wn if wm + wn < 1 else 0) + morado[i] * min(wm, 1) + naranja[i] * min(wn, 1)) for i in range(3))
    return im.resize((n, n), Image.LANCZOS).filter(ImageFilter.GaussianBlur(n / 64))

def con_margen(n, escala):
    """El ícono reducido al centro sobre una versión ampliada y desenfocada de sí mismo (mantiene los halos).
    Para máscaras que recortan los bordes (ícono «maskable» de la web y adaptativo de Android)."""
    fondo = fondo_icono(n)
    s = int(n * escala); borde = max(2, s // 16)  # el chanchito deja ~15 % de margen: el difuminado no lo toca
    # Máscara con borde difuminado: el ícono se funde con el fondo, sin aristas.
    m = Image.new('L', (s, s), 0); ImageDraw.Draw(m).rectangle((borde, borde, s - borde, s - borde), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(borde / 2.5))
    fondo.paste(src.resize((s, s), Image.LANCZOS), ((n - s) // 2, (n - s) // 2), m); return fondo

# Web
web = {'favicon-16.png': redondeado(16), 'favicon-32.png': redondeado(32), 'favicon-64.png': redondeado(64),
       'apple-touch-icon.png': tam(180), 'icono-192.png': tam(192), 'icono-512.png': tam(512),
       'icono-maskable-512.png': con_margen(512, 0.8)}
for f, im in web.items():
    guardar(im, 'web', f); shutil.copy(os.path.join(A, 'web', f), os.path.join(RAIZ, 'public', f))

# Android launcher: mipmaps clásicos + adaptativo (API 26+). El maestro no trae capas separadas:
# la capa de fondo es el ícono con margen (zona segura 66 %) y la de frente queda transparente.
for d, n in {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    guardar(tam(n), 'android', f'mipmap-{d}', 'ic_launcher.png')
    r = tam(n).convert('RGBA'); m = Image.new('L', (n * 4, n * 4), 0); ImageDraw.Draw(m).ellipse((0, 0, n * 4 - 1, n * 4 - 1), fill=255)
    r.putalpha(m.resize((n, n), Image.LANCZOS)); guardar(r, 'android', f'mipmap-{d}', 'ic_launcher_round.png')
for d, n in {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}.items():
    guardar(con_margen(n, 0.66), 'android', f'mipmap-{d}', 'ic_launcher_fondo.png')
    guardar(Image.new('RGBA', (n, n), (0, 0, 0, 0)), 'android', f'mipmap-{d}', 'ic_launcher_frente.png')
xml = '''<?xml version="1.0" encoding="utf-8"?>
<!-- Ícono adaptativo generado desde el maestro de 1024 px (scripts/icono-app/generar.py). -->
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_fondo" />
    <foreground android:drawable="@mipmap/ic_launcher_frente" />
</adaptive-icon>
'''
for f in ['ic_launcher.xml', 'ic_launcher_round.xml']:
    p = os.path.join(A, 'android', 'mipmap-anydpi-v26', f); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w').write(xml)
guardar(src.resize((512, 512), Image.LANCZOS), 'android', 'Google-Play-512.png')

# iOS: un solo maestro de 1024 (Xcode 14+ genera los demás tamaños).
guardar(src, 'ios', 'AppIcon.appiconset', 'AppIcon-1024.png')
open(os.path.join(A, 'ios', 'AppIcon.appiconset', 'Contents.json'), 'w').write(json.dumps(
    {'images': [{'filename': 'AppIcon-1024.png', 'idiom': 'universal', 'platform': 'ios', 'size': '1024x1024'}], 'info': {'author': 'xcode', 'version': 1}}, indent=2))
print('✔ ícono: web, android e ios generados en', os.path.relpath(A, RAIZ))
