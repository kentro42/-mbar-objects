# Ámbar Tu Casa — Casa de los objetos

**Sitio publicado:** [https://kentro42.github.io/-mbar-objects/](https://kentro42.github.io/-mbar-objects/)

**Repositorio:** [github.com/kentro42/-mbar-objects](https://github.com/kentro42/-mbar-objects)

Un álbum digital para recorrer objetos con historia de Ámbar Tu Casa. La identidad toma como descriptor público de la marca “Objetos, sabores y hogar” y se enfoca en el local de Pueblo Viejo, La Estrella. El proyecto tiene un único cuaderno interactivo, con portada, contraportada, navegación táctil y de teclado, giro de página 3D, fichas individuales y un QR distinto para cada pieza.

La página empieza en la portada. En pantallas de escritorio adecuadas muestra el libro abierto; en móvil presenta una página a la vez. No necesita servidor ni base de datos: la colección vive en JavaScript, las imágenes pueden estar en `public/`, Cloudinary o una URL HTTPS y los videos se insertan desde YouTube.

## Cambiar piezas, fotos y videos

El catálogo está en `src/albums/ambar-casa-violeta-azul.js`. El nombre del archivo y el `id` técnico del álbum se conservan para no romper las rutas y los QR que ya se compartieron. En ese archivo edita el arreglo `plantillas`: cada objeto corresponde a una pieza.

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

- **Textos y datos:** cambia los valores del objeto de la pieza en `plantillas`.
- **Foto:** puedes escribir una URL HTTPS, un identificador público de Cloudinary o una ruta local como `foto: "assets/pieces/pieza-001.webp"`. Las fotos locales van en `public/assets/pieces/`; no se pega el contenido de la imagen dentro del JavaScript. Las rutas locales respetan la base de Vite/GitHub Pages. Si dejas `foto` vacía, se conserva el marco de foto.
- **Logo:** `branding.logo` indica el distintivo circular amarillo usado en las cubiertas. `branding.photoMark` y `branding.signatureLogo` apuntan a `assets/pieces/Ambar_logo.png`, utilizado como marca discreta en cada foto cargada y como firma junto al QR. Los archivos originales están en `public/assets/pieces/`.
- **Stickers:** el arreglo `stickers` enumera los PNG originales del usuario. `src/utils/pageDecorations.js` asigna cuatro archivos únicos por página; `src/components/pieces/PageStickers.jsx` los coloca en los márgenes. No se repiten entre páginas. Al agotarse el catálogo, las nubes decorativas se dibujan con CSS.
- **Video:** `video` recibe el ID de YouTube de 11 caracteres, no la URL completa ni el código `<iframe>`. De `https://youtu.be/AbCdEf12345` se guarda `video: "AbCdEf12345"`. También puedes copiar el valor que sigue a `v=`, `/shorts/` o `/embed/`. Déjalo vacío (`video: ""`) para mostrar el panel oscuro sin video.
- **Añadir pieza:** agrega un objeto al final de `plantillas`. El código crea el ID y la etiqueta `Pieza 011`, `Pieza 012`, etc.; asigna su QR único y la página recibe los stickers originales que sigan disponibles.
- **Orden e identificadores:** los IDs se calculan según la posición en el arreglo. Agregar piezas al final mantiene los actuales; ordenar o borrar piezas puede cambiar los IDs posteriores y sus QR. Haz una copia antes de reorganizar.

Cada ficha presenta año, tipo y origen en cintas amarillas; material, procedencia, estado, uso y relato aparecen como notas de papel. La frase bajo el QR es “escanea para conocerme”.

## Ejecutar y revisar

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

La salida compilada queda en `dist/`; modifica los archivos de `src/`, no edites la salida a mano. Las flechas izquierda/derecha y los botones cambian de página; en dispositivos táctiles puedes deslizar. Con `prefers-reduced-motion` activo, el giro se reemplaza por un fundido simple.

## Publicación

El workflow `.github/workflows/pages.yml` se ejecuta al cambiar `main` o manualmente desde GitHub Actions. Instala dependencias, ejecuta `npm run build` y publica `dist/` en GitHub Pages. La rama de revisión no reemplaza el sitio publicado: se puede probar antes de fusionarla.

## Mapa del código

| Ruta | Responsabilidad |
| --- | --- |
| `index.html` | Idioma, título, descripción y nodo raíz de React. |
| `src/main.jsx` | Monta `AlbumApp` y carga los estilos. |
| `src/app/AlbumApp.jsx` | Conecta modo de pantalla, navegación y libro único. |
| `src/albums/ambar-casa-violeta-azul.js` | Textos, piezas, logos, stickers y cubiertas del álbum. |
| `src/albums/index.js` | Registro del cuaderno único y su ID técnico estable. |
| `src/components/book/` | Estructura del libro, cubiertas, hojas, anillas y controles. |
| `src/components/pieces/` | Páginas, tarjetas, ficha de objeto y stickers. |
| `src/components/loading/` | Imágenes auxiliares con carga diferida. |
| `src/hooks/` | Rutas, giros, gestos, teclado, modo y carga. |
| `src/utils/albumRoutes.js` | Rutas, QR, recursos locales y paginación. |
| `src/utils/pageDecorations.js` | Reparto de stickers sin repetir archivos. |
| `src/utils/pageTurn.js` | Geometría y fotogramas de la animación 3D. |
| `src/styles/album.css` | Paleta, tipografía, papel, post-its, nubes, stickers y capas 3D. |
| `public/manus-routes.json` | Manifiesto de rutas de página del sitio. |
| `.github/workflows/pages.yml` | Compilación y despliegue de GitHub Pages. |
| `package.json` / `package-lock.json` | Dependencias y comandos reproducibles. |

Las rutas de página y pieza mantienen el formato `#album/<id>/pagina/<n>` y `#album/<id>/pieza/<id>`. Aunque se muestra un solo álbum, el identificador técnico actual no cambia para mantener válidos los QR existentes. También se leen los enlaces antiguos `#pagina-n` y `#pieza-id`.
