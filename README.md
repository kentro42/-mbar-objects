# Álbum de Ámbar Casa Violeta Azul

Frontend en React con Vite. La interfaz está diseñada como un cuaderno/scrapbook con papel texturado, cinta, anillas, Polaroids y tipografía manuscrita.

## Ejecutar en local

```bash
npm install
npm run dev
```

Para crear la versión estática de producción:

```bash
npm run build
```

Vite escribe el sitio compilado en `dist/`. La configuración usa rutas relativas para que los recursos funcionen también en hosting bajo la ruta de un repositorio, como GitHub Pages.

## Editar las piezas

Los datos están en `js/data.js`, dentro del arreglo `plantillas`. Cada objeto debe tener su propio `title`, `subtitle`, `categoria`, `origen`, `material`, `uso`, `year`, `p1` y `p2`.

- `video`: solo el ID de YouTube de 11 caracteres, por ejemplo `LdzSFBtqLks`. Si se omite o se deja vacío, el reproductor queda negro.
- `foto`: URL HTTPS o nombre de archivo de Cloudinary. Si no hay una foto propia, se muestra un espacio de papel marcado «foto por pegar» en vez de una imagen genérica.
- Al añadir una pieza al arreglo, React la coloca en la página correspondiente y crea un QR que enlaza a su ruta `#pieza-ID`.

## Estructura principal

- `src/main.jsx`: componentes React, navegación, historial, zoom y animación de giro.
- `css/styles.css`: estilo artesanal, adaptación a móvil y movimiento reducido.
- `js/data.js`: catálogo editable de las piezas.
- `index.html`: documento raíz de Vite.


## Publicación

GitHub Pages compila `dist/` con el workflow de `.github/workflows/pages.yml` en cada push a `main`. El sitio público del repositorio es `https://kentro42.github.io/-mbar-objects/`.
