# Fotos, logo y stickers del álbum

Guarda aquí las fotos de piezas y los PNG originales de la marca. Usa nombres cortos y estables basados en el número de pieza para las fotos, por ejemplo:

- `pieza-001.webp`
- `pieza-002.jpg`

Ruta dentro del repositorio: `public/assets/pieces/pieza-001.webp`  
Ruta pública que usará la aplicación: `./assets/pieces/pieza-001.webp`

No hace falta pegar la imagen dentro de JavaScript: la ficha usa una ruta al archivo. En la configuración del álbum, el distintivo `Ambar_abduccioncirculo.png` se enlaza desde `branding.logo`, y los stickers están listados en `stickers`. Las fotos se conectan mediante `foto: "assets/pieces/nombre-del-archivo.webp"`. Subir una imagen aquí la guarda en el proyecto, pero no la asigna automáticamente a una ficha.

Para que sea fácil asociarlas, conserva en el nombre el mismo número que tiene cada pieza. Usa JPG o WebP para fotografías y PNG para logos o stickers con transparencia. Las rutas locales funcionan con la base relativa configurada para GitHub Pages.
