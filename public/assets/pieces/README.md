# Fotos de piezas del álbum

Sube aquí las fotos que quieras guardar junto con el código del proyecto. Usa nombres cortos y estables basados en el número de pieza, por ejemplo:

- `pieza-001.webp`
- `pieza-002.jpg`

Ruta dentro del repositorio: `public/assets/pieces/pieza-001.webp`  
Ruta pública que usará la aplicación: `./assets/pieces/pieza-001.webp`

No hace falta pegar la imagen dentro de JavaScript: cuando las fotos estén subidas, se enlazarán desde la configuración del álbum. Actualmente esa configuración usa URLs HTTPS o identificadores de Cloudinary; al integrar fotos locales habrá que actualizar el helper que resuelve esas rutas. Por eso, subir una imagen aquí la guarda en el proyecto, pero no la añade automáticamente a una ficha.

Para que sea fácil asociarlas, conserva en el nombre el mismo número que tiene cada pieza. Usa JPG o WebP para fotografías y PNG solo si necesitas transparencia.
