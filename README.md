# Álbum de Ámbar Casa Violeta Azul

Frontend React 18 + Vite con estética artesanal de cuaderno, portadas por local, hojas animadas y diseño responsive.

## Desarrollo local

```bash
npm ci
npm run dev
```

Vite muestra una URL local, normalmente `http://localhost:5173/`, con recarga rápida al guardar cambios.

```bash
npm run build
npm run preview
```

La carpeta compilada es `dist/`. El workflow `.github/workflows/pages.yml` compila y publica GitHub Pages al actualizar `main`.

## Añadir o editar piezas

Edita `src/albums/ambar-casa-violeta-azul.js`. Cada pieza del arreglo `plantillas` contiene el texto, los datos de inventario, `foto` y un `video` opcional de YouTube (solo el ID de 11 caracteres). Una pieza sin foto conserva un marco de papel; una pieza sin video muestra un panel negro. Los QR se generan con enlaces únicos por álbum y pieza.

## Añadir otro álbum/local

1. Crea `src/albums/<id-del-local>.js` con los mismos campos que el álbum actual: `id`, `brand`, `location`, `title`, `subtitle`, `itemsPerPage`, `pieces` y `cover.front`/`cover.back`.
2. Añade el nuevo módulo a `src/albums/index.js`.
3. Pon imágenes de portada en `public/albums/<id-del-local>/` si se desean usar; si no, el diseño usa la cubierta artesanal de color configurable. Decláralas en `cover.front.image` y `cover.back.image`, por ejemplo `albums/mi-local/portada.jpg` y `albums/mi-local/contraportada.jpg` (rutas relativas a `public/`). El objeto de cada cubierta también admite su propio `color` y textos.

Cada álbum mantiene su propio catálogo, rutas `#album/<id>/pagina/<n>` y `#album/<id>/pieza/<id>`, QR y cubiertas. Los enlaces antiguos `#pagina-n` y `#pieza-id` siguen aceptándose para el álbum Casa Violeta Azul.

## Estructura del código

- `src/main.jsx`: entrada de React y estilos.
- `src/app/AlbumApp.jsx`: ensambla la app y el álbum seleccionado.
- `src/albums/`: registro y datos independientes por local.
- `src/components/book/`: libro, páginas, portadas, anillas y navegación.
- `src/components/pieces/`: tarjetas, páginas de piezas y detalle.
- `src/components/loading/`: imágenes con shimmer diferido.
- `src/hooks/`: navegación, teclado, modo responsive y carga diferida.
- `src/utils/albumRoutes.js`: rutas, paginación y transformaciones.
- `src/styles/album.css`: estilos de escritorio y móvil.
- `public/manus-routes.json`: manifiesto de ruta de la aplicación.
