# Ámbar Casa Violeta Azul — álbum interactivo

**Sitio publicado:** [https://kentro42.github.io/-mbar-objects/](https://kentro42.github.io/-mbar-objects/)

**Repositorio:** [github.com/kentro42/-mbar-objects](https://github.com/kentro42/-mbar-objects)

Un cuaderno digital para explorar las piezas e historias de Ámbar. Está hecho con React y Vite, con una estética artesanal de scrapbook, portadas por álbum, navegación táctil y de teclado, páginas con giro 3D, fichas individuales y códigos QR que enlazan directamente con cada pieza.

La página inicial comienza en la portada. En pantallas apropiadas en orientación horizontal se muestra un libro abierto de dos páginas; en móvil y otras pantallas se usa una sola página. No hay servidor ni base de datos: el catálogo se define en archivos JavaScript, las imágenes pueden estar alojadas en Cloudinary o en una URL HTTPS y los videos se muestran desde YouTube.

## Cambios básicos: piezas, fotos y videos

El catálogo de Casa Violeta Azul está en `src/albums/ambar-casa-violeta-azul.js`. Allí edita el arreglo `plantillas`: cada objeto representa una pieza y contiene su información. Ejemplo:

```js
{
  title: "Reloj antiguo",
  subtitle: "Acompañó a la familia por años",
  categoria: "Reloj de pared",
  origen: "Alemania",
  material: "Nogal y latón",
  uso: "Cronometraje doméstico",
  year: "1958",
  foto: "https://servidor.example/reloj.jpg",
  video: "VIDEO_ID",
  p1: "Primera parte de la historia.",
  p2: "Segunda parte de la historia."
}
```

- **Textos y datos:** cambia los valores dentro del objeto correspondiente en `plantillas`.
- **Foto:** escribe `foto: "https://..."` con una URL HTTPS directa a una imagen, o un identificador público de Cloudinary. El álbum tiene su nombre de nube en `CLOUD_NAME`. Si la foto no está asignada, se conserva el marco con “foto por pegar”.
- **Video:** el campo `video` recibe el **ID de YouTube de 11 caracteres**, no la URL completa ni el código `<iframe>`. Por ejemplo, de `https://youtu.be/AbCdEf12345` se guarda `video: "AbCdEf12345"`. También sirve extraer el valor después de `v=` en un enlace `watch`, o el segmento después de `/shorts/` o `/embed/`. Déjalo vacío (`video: ""`) para que la ficha muestre su panel oscuro sin video.
- **Añadir pieza:** añade un objeto más al final del arreglo `plantillas`. El código genera el `id` numérico y la etiqueta `Pieza 011`, `Pieza 012`, etc.; el QR también se genera automáticamente.
- **Importante:** los ID actuales se calculan por la posición de la pieza en el arreglo. Añadir al final mantiene los ID existentes; reordenar o eliminar piezas puede cambiar los ID de las siguientes y, por tanto, sus enlaces QR. Haz una copia antes de reorganizar.

El detalle de una pieza presenta sus datos, textos, video opcional y un QR único. Cada QR apunta a la ruta de esa pieza dentro del álbum. Durante una prueba local, el QR lleva al sitio local; el enlace queda con el dominio público al escanear el QR generado en la web publicada.

## Añadir otro álbum o local

1. Crea un archivo en `src/albums/`, por ejemplo `segundo-local.js`, exportando un objeto de álbum con `id`, `brand`, `location`, `title`, `subtitle`, `itemsPerPage`, `pieces`, `coverColor` y `cover.front` / `cover.back`.
2. Usa en `pieces` el mismo formato de pieza que en el álbum existente. Dale al álbum un `id` corto, único y estable, escrito en minúsculas y separado por guiones.
3. Importa el nuevo módulo y agrégalo al arreglo `albums` de `src/albums/index.js`.
4. Opcionalmente, coloca las imágenes de portada en `public/albums/<id-del-album>/` y configura `cover.front.image` y `cover.back.image` con rutas relativas a `public/`, por ejemplo `albums/segundo-local/portada.jpg`. Si no agregas esas imágenes, el diseño usa la cubierta artesanal. `coverColor` define un único color base compartido por portada y contraportada.

La portada permite elegir otro cuaderno cuando hay más de un álbum registrado.

## Ejecutar y revisar el sitio

Necesitas Node.js 22 y npm. Desde la carpeta del repositorio:

```bash
npm ci
npm run dev
```

Abre la URL local que muestra Vite, normalmente `http://localhost:5173/`. Para comprobar la compilación de producción:

```bash
npm run build
npm run preview
```

La salida compilada queda en `dist/`; no edites esos archivos a mano. Modifica los archivos fuente de `src/` y deja que Vite los genere de nuevo. En el sitio, las flechas izquierda/derecha del teclado y los botones permiten cambiar de página; en dispositivos táctiles se puede deslizar horizontalmente. Al reducir el movimiento en el sistema operativo, la transición se sustituye por un fundido sencillo.

## Cómo se publica

El workflow `.github/workflows/pages.yml` se ejecuta cuando hay un cambio en `main` (o manualmente desde GitHub Actions). Instala las dependencias, ejecuta `npm run build` y publica `dist/` en GitHub Pages. Comprueba que la acción termine correctamente si el sitio tarda en reflejar una actualización.

## Mapa del código

| Ruta | Responsabilidad |
| --- | --- |
| `index.html` | HTML inicial, idioma, título y elemento raíz de React. |
| `src/main.jsx` | Punto de entrada: monta `AlbumApp` y carga los estilos. |
| `src/app/AlbumApp.jsx` | Conecta el modo de pantalla, la navegación y el layout del libro. |
| `src/albums/` | Datos por local y registro de todos los álbumes disponibles. |
| `src/components/book/` | Estructura del libro, cubiertas, hojas, anillas y controles. |
| `src/components/pieces/` | Contenido de páginas, tarjetas y detalle de cada pieza. |
| `src/components/loading/` | Presentación de imágenes auxiliares con carga diferida. |
| `src/hooks/` | Estado y comportamiento reutilizable: rutas, giros, gestos, teclado, modo y carga. |
| `src/utils/albumRoutes.js` | Generación y lectura de rutas, QR, paginación y animación del detalle. |
| `src/utils/pageTurn.js` | Geometría, posición del lomo y fotogramas de la animación 3D. |
| `src/styles/album.css` | Estética, distribución adaptable, capas 3D, anillas, shimmer y accesibilidad visual. |
| `public/manus-routes.json` | Manifiesto de rutas de página del sitio. |
| `.github/workflows/pages.yml` | Compilación y despliegue automático a GitHub Pages. |
| `package.json` / `package-lock.json` | Dependencias y comandos reproducibles del proyecto. |

## Rutas útiles

Las rutas actuales tienen el formato `#album/<id>/pagina/<n>`, `#album/<id>/pieza/<id>`, `#album/<id>/portada` y `#album/<id>/contraportada`. Los números de página de la URL empiezan en 1. También se mantienen los enlaces QR antiguos `#pagina-n` y `#pieza-id` del álbum original.

---

Proyecto de catálogo visual; sus piezas, imágenes y videos se editan en los módulos del álbum. Para aprender cómo se conectan React, las rutas, la animación 3D y los gestos táctiles, consulta la guía de aprendizaje que acompaña esta entrega (no forma parte del repositorio).
