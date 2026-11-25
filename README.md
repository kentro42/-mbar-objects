# Ámbar Tu Casa — guía del álbum digital

**Sitio publicado actualmente:** [kentro42.github.io/-mbar-objects](https://kentro42.github.io/-mbar-objects/)
**Repositorio GitHub actual:** [github.com/kentro42/-mbar-objects](https://github.com/kentro42/-mbar-objects)

El proyecto es un álbum/cuaderno web para conocer objetos e historias de Ámbar Tu Casa. Tiene portada, hojas tipo Polaroid, fichas individuales, videos, códigos QR por pieza y stickers PNG aportados por la marca. Está hecho con React y Vite; los textos y el catálogo viven en JavaScript y los archivos gráficos locales en `site/public/assets/pieces/`.

Esta guía acompaña el código de la rama de revisión. Sus cambios nuevos no alteran la página publicada hasta que la rama se integre a `main`.

## Empezar y probar en tu computador

Se necesita Node.js 22 y npm. Abre una terminal en la raíz del repositorio y ejecuta:

```bash
cd site
npm ci
npm run check:data
npm run dev
```

Vite mostrará la dirección de vista previa local, normalmente `http://localhost:5173/`. Para verificar la compilación de producción:

```bash
npm run build
npm run preview
```

`npm run build` ejecuta primero las comprobaciones de datos y después compila. No edites `site/dist/`: se genera de nuevo en cada compilación. Conserva `site/package-lock.json`; fija las versiones exactas de dependencias.

## Cambios habituales: qué editar y dónde

Los números de línea siguientes corresponden al código de esta revisión. Pueden desplazarse cuando se agregue o quite contenido; busca también el nombre de la propiedad o selector indicado.

| Lo que quieres cambiar | Archivo y ubicación |
| --- | --- |
| Título, subtítulo, año, origen, material, uso e historia de una pieza | `site/src/albums/ambar-tu-casa.js`, arreglo `plantillas`, líneas 35–146 |
| Texto pequeño de la portada y contraportada | `site/src/albums/ambar-tu-casa.js`, `cover.front` y `cover.back`, líneas 187–197 |
| Color de las dos cubiertas | `site/src/albums/ambar-tu-casa.js`, `coverColor`, línea 181 |
| Logo central de la portada y logo junto al QR | `site/src/albums/ambar-tu-casa.js`, `branding.logo` y `branding.signatureLogo`, líneas 182–185 |
| Imagen de una Polaroid | `foto` de su objeto en `plantillas`; asignación especial de la primera foto, línea 170 |
| Video de una pieza | Propiedad `video` en esa misma pieza. Ahora solo la primera tiene un ID asignado (línea 44); las demás quedan sin video hasta que se les ponga el propio |
| Stickers que se pueden pegar a las hojas | Arreglo `stickers`, líneas 5–31; las rutas de imágenes apuntan a `site/public/assets/pieces/` |
| Posición y tamaño de las Polaroids y márgenes de stickers | `site/src/styles/base-layout.css` (página y fotos) y `site/src/styles/responsive-refinements.css` (carriles/posiciones de stickers) |
| Tamaño del logo de la cubierta o de la firma | `site/src/styles/warm-visuals.css`, selectores `.book-cover__logo` y `.signed-note__logo` |
| Texto de botones de portada/contraportada | `site/src/components/book/BookCover.jsx`, líneas 48–57 |
| Texto y nombres accesibles de botones de pasar hoja | `site/src/components/book/PageNavigation.jsx`, líneas 9–16 |
| Acción de “Volver a curiosear” y “Volver atrás” | `site/src/hooks/useAlbumNavigation.js`, líneas 166–168 |
| Título de la pestaña, descripción y color del navegador | `site/index.html`, líneas 5–8 |
| Fuentes, colores base, tamaño de página y animación | `site/src/styles/base-layout.css`; tiempo/estilo del giro en `site/src/utils/pageTurn.js`, líneas 3–6 |

### Editar la información de una pieza

En `site/src/albums/ambar-tu-casa.js`, modifica los valores de un objeto dentro de `plantillas` (líneas 35–146). Ejemplo:

```js
{
  title: 'Nombre del objeto',
  subtitle: 'Una frase corta',
  categoria: 'Tipo de pieza',
  origen: 'País o lugar',
  material: 'Materiales principales',
  uso: 'Para qué servía',
  year: '1958',
  foto: 'assets/pieces/pieza-001.webp',
  video: 'ID_DE_YOUTUBE',
  p1: 'La primera nota de su historia.',
  p2: 'Una segunda nota opcional.'
}
```

`title` y `subtitle` aparecen en la ficha. `categoria`, `origen`, `material`, `uso` y `year` alimentan las etiquetas de información. `p1` y `p2` son notas; `p2` es opcional y no se dibuja cuando está vacío. Los datos predeterminados `procedencia: 'Colección del local'` y `estado: 'Exhibición'` se asignan al construir cada pieza en las líneas 148–167; si quieres valores distintos por objeto, agrégalos al registro y a ese mapeo.

Para añadir una pieza, copia un objeto y pégalo al final de `plantillas`. Añadir al final conserva los IDs de las piezas anteriores. **No reordenes, no elimines ni cambies los IDs existentes sin revisar los QR ya compartidos o impresos:** el número de pieza se deriva de su posición en el catálogo.

### Fotos, logos y stickers

Guarda los archivos locales en `site/public/assets/pieces/`. Por ejemplo, para el archivo `site/public/assets/pieces/pieza-011.webp`, escribe en la pieza:

```js
foto: 'assets/pieces/pieza-011.webp'
```

También puedes usar una URL HTTPS o un identificador de Cloudinary. La foto actualmente asignada a la primera ficha es un identificador de imagen de Cloudinary (línea 170); los demás campos `foto` están vacíos. No se asignaron stickers como fotos de objetos para no confundir ilustraciones con fotografías reales.

Para reemplazar los logos, conserva una ruta local en `branding` (líneas 182–185):

- `logo` se muestra en el centro de la portada y la contraportada.
- `signatureLogo` se muestra junto al QR en la historia de cada pieza.

Copia el PNG nuevo en `site/public/assets/pieces/` y cambia el nombre de archivo en la propiedad apropiada. El sello/círculo superpuesto sobre las fotos de las Polaroids se eliminó; ya no existe `photoMark` ni un círculo blanco en esa zona. El logo de las cubiertas y el de la firma del QR son elementos distintos y se conservan.

El arreglo `stickers` (líneas 5–31) determina qué PNG puede usar el álbum. `site/src/utils/pageDecorations.js` asigna cuatro archivos distintos por hoja y no repite un archivo entre páginas. Si agregas una página nueva, recibe las siguientes pegatinas disponibles; agotado el catálogo, queda una nube CSS de reemplazo en lugar de reciclar stickers. `Care_chimba.png` permanece en la carpeta de assets, pero se quitó de la selección visible de este álbum.

Los stickers ahora quedan por encima de la superficie de la página y dentro de carriles laterales reservados. Así no quedan debajo de una Polaroid ni se recortan por ella. Se usa el mismo patrón espaciado en escritorio y móvil. Ajusta las medidas de `.page-content`, `.page-sticker` y `.page-sticker--position-*` en `base-layout.css` y `responsive-refinements.css`; cambia los PNG usados en `ambar-tu-casa.js`.

### Videos y textos de muestra

El campo `video` espera el ID de YouTube, no la URL completa ni el código `<iframe>`. De `https://youtu.be/AbCdEf12345`, por ejemplo, escribe `video: 'AbCdEf12345'`. También se puede tomar el ID que aparece después de `v=`, `/shorts/` o `/embed/`. `site/src/components/pieces/PieceDetail.jsx`, línea 8, valida que el ID tenga el formato correcto.

Con `video: ''`, la ficha conserva el cuadro oscuro sin un video inventado. Se retiraron las leyendas “Toca el video para verla en movimiento” y “Video de ejemplo…”. Además, se quitaron los nueve IDs repetidos que mostraban el mismo video en piezas diferentes; cuando tengas el clip real de cada objeto, pega su ID en esa ficha. La primera pieza conserva el único ID no repetido que estaba asignado.

### Textos de portada, botones y otros detalles

- Textos editoriales de las cubiertas: `cover.front.eyebrow`, `title`, `note` y `cover.back.note`/`signature` en `ambar-tu-casa.js`, líneas 187–197.
- “Abrir este cuaderno”, “Volver a curiosear” y “Volver atrás”: `BookCover.jsx`, líneas 48–57. El primer botón abre el cuaderno; los dos últimos están en la contraportada.
- “Volver a curiosear” ahora regresa a la **portada**, no a la hoja 1. El callback está en `useAlbumNavigation.js`, línea 167. “Volver atrás” recorre una hoja hacia atrás (línea 168).
- “Anterior”, “Siguiente”, “Portada” y “Final”: `PageNavigation.jsx`, líneas 9–16.
- “volver al álbum”, indicación del video y QR: `PieceDetail.jsx`, líneas 31–56 y 87–98.
- Nombre de la marca en la hoja: `AlbumPage.jsx`, líneas 14–20 y 40; título de la pestaña: `site/index.html`, línea 8.
- Tipografía: variables `--hand`, `--story`, `--body` y `--label` al comienzo de `base-layout.css`; ahí también están los colores de papel y tinta.

## Cómo se conservan los enlaces y los QR

Los nuevos enlaces usan el ID técnico `ambar-tu-casa`, definido en `ambar-tu-casa.js`, línea 173. El ID anterior `ambar-casa-violeta-azul` se conserva únicamente como alias de compatibilidad (`legacyRouteIds`, línea 174), y `site/src/utils/albumRoutes.js` lo convierte al álbum actual. Así los QR antiguos que apuntan a una pieza siguen abriendo su historia.

Los QR se generan desde la URL del sitio y el ID de cada pieza, no desde una imagen QR guardada a mano. La lógica está en `PieceDetail.jsx`, líneas 8–9, y `albumRoutes.js`, líneas 28–46 y 54–95. El nombre del paquete de npm también se actualizó a `ambar-tu-casa-objetos`; el nombre/slug del repositorio GitHub **sigue siendo** `-mbar-objects`.

Renombrar el repositorio desde GitHub es una operación aparte del código. Cambia la URL de GitHub Pages y puede afectar la parte del enlace incluida en los QR impresos. Por eso no se cambió el repositorio en esta revisión. Antes de hacerlo hay que elegir el nombre definitivo y comprobar un plan de redirección/actualización de los QR.

## Estructura del proyecto y función de cada archivo

```text
.
├── .github/workflows/pages.yml        # Compila y publica en GitHub Pages
├── .gitignore                         # Excluye dependencias y artefactos locales
├── README.md                           # Esta guía
└── site/
    ├── index.html                      # Documento inicial y metadatos del sitio
    ├── package.json                    # Nombre del paquete y comandos npm
    ├── package-lock.json               # Versiones exactas de dependencias
    ├── vite.config.js                  # Configuración de Vite y base relativa
    ├── scripts/check-album.mjs         # Valida datos y assets antes de compilar
    ├── public/
    │   ├── assets/pieces/              # Fotos, logos y stickers PNG/JPG
    │   └── manus-routes.json           # Manifiesto de ruta del sitio
    └── src/
        ├── main.jsx                    # Monta React y carga el CSS de entrada
        ├── app/AlbumApp.jsx            # Conecta modo, navegación y composición
        ├── albums/
        │   ├── index.js                # Registra el álbum actual y sus alias
        │   └── ambar-tu-casa.js        # Contenido, branding y catálogo de assets
        ├── components/
        │   ├── book/                   # Hojas, cubierta, anillas y controles
        │   ├── loading/                # Imágenes con carga diferida/esqueleto
        │   └── pieces/                 # Páginas, Polaroids, stickers e historias
        ├── hooks/                      # Estado y comportamiento reutilizable
        ├── styles/                     # Entrada CSS y hojas por responsabilidad
        └── utils/                      # Rutas, asignación decorativa y giros
```

### Archivos de la interfaz (`site/src/components/`)

- `book/AlbumLayout.jsx`: arma la escena completa, decide qué estado del libro se ve y enlaza las páginas, cubierta, anillas, ficha y controles.
- `book/BinderRings.jsx`: dibuja el lomo y las anillas; las coloca en la cubierta delantera, centro o contraportada según el estado del cuaderno.
- `book/BookCover.jsx`: muestra portada/contraportada y los botones de abrir, volver a portada o retroceder.
- `book/BookPage.jsx`: representa una hoja interior y evita crear fichas fuera del intervalo de páginas.
- `book/BookState.jsx`: decide si el estado visible es cubierta o página abierta (una o dos hojas).
- `book/PageNavigation.jsx`: botones inferiores y contador de páginas.
- `loading/DelayedImage.jsx`: imagen para QR/vistas previas con un esqueleto solo si tarda más de 300 ms.
- `pieces/AlbumPage.jsx`: encabezado, número de hoja, cuadrícula de piezas y pie.
- `pieces/PageStickers.jsx`: coloca la nube CSS y los PNG asignados a esa hoja.
- `pieces/PieceCard.jsx`: Polaroid, título, foto y esqueleto de carga. Ya no pinta ningún sello sobre la foto.
- `pieces/PieceDetail.jsx`: historia completa, cuadro de video, QR único y logo de firma.

### Hooks (`site/src/hooks/`)

- `useAlbumKeyboard.js`: flechas izquierda/derecha, Escape y límites de foco de la ficha.
- `useAlbumNavigation.js`: estado de portada/página/contraportada/ficha, rutas en el hash y callbacks de los botones.
- `useBookMode.js`: elige doble página en landscape amplio y una página en móvil/portrait.
- `useDelayedLoad.js`: demora 300 ms antes de mostrar esqueleto para evitar parpadeo en cargas rápidas.
- `usePageTurn.js`: inicia, anima, termina o revierte giros de página/cubierta.
- `usePageTurnGesture.js`: arrastre táctil/ratón y protección contra clics que interrumpan el giro.
- `usePieceDetail.js`: apertura y cierre de la ficha con zoom desde/hacia la Polaroid.
- `useReducedMotionTurn.js`: cambia el giro por un fundido corto cuando el sistema pide movimiento reducido.

### Estilos y lógica (`site/src/styles/`, `site/src/utils/`)

`main.jsx` importa `styles/album.css`, que es el punto de entrada de estilos. Ese archivo importa las hojas en orden para mantener la cascada:

- `base-layout.css`: tipografías, variables base, dimensiones, estructura del libro y reglas generales responsivas.
- `warm-visuals.css`: identidad cálida, papel, cintas, nubes, Polaroids y logo de cubierta.
- `responsive-refinements.css`: botones de cubierta, márgenes/posiciones de stickers y refinamientos de móvil.

Las utilidades se encargan de cálculos sin dibujar componentes:

- `utils/albumRoutes.js`: URL de piezas, QR, rutas heredadas, paginación y recursos locales/Cloudinary.
- `utils/pageDecorations.js`: cuatro stickers por hoja y selección sin duplicados.
- `utils/pageTurn.js`: destino del siguiente/anterior estado, posición del eje, anillas y fotogramas de giro. `TURN_MS` y `FADE_MS` están en las líneas 3–4.

Otros archivos de `site/`:

- `site/index.html`: título, idioma, descripción y elemento `#root` donde React monta el sitio.
- `site/package.json`: scripts `dev`, `check:data`, `build` y `preview`, además de dependencias React/Vite.
- `site/package-lock.json`: no se edita a mano; npm lo mantiene sincronizado con `package.json`.
- `site/vite.config.js`: usa `base: './'` para servir recursos desde GitHub Pages sin rutas absolutas rotas.
- `site/scripts/check-album.mjs`: confirma IDs únicos, videos distintos y válidos, disponibilidad de logos/stickers, asignaciones únicas y alias de QR.
- `site/public/manus-routes.json`: manifiesto de la ruta `/`; no contiene las fichas como páginas HTML independientes porque se navegan con fragmentos `#`.
- `.github/workflows/pages.yml`: instala Node 22 y compila desde `site/`; publica `site/dist/` al desplegarse `main`.
- `.gitignore`: ignora `node_modules/`, `dist/`, cachés y otros artefactos generados.

## Movimiento, responsive y aspecto visual

La portada es una hoja/cubierta completa en escritorio; al abrirse, el libro enseña dos páginas. En móvil o en orientación vertical se enseña una hoja. El criterio de orientación y tamaño está en `useBookMode.js`, líneas 3–8. Las páginas usan giro 3D; en móvil se evitan efectos de luz/sombra repintados en cada fotograma. El tiempo del giro y del fundido accesible está en `site/src/utils/pageTurn.js`.

Las medidas visuales importantes están en:

- `base-layout.css`, líneas 3–26: colores/tipografías globales; línea 82: tamaño interior y carril reservado para stickers; líneas 93–113: cuadrícula y dimensiones de Polaroid.
- `warm-visuals.css`, línea 60 en adelante: capas decorativas; líneas 121–122: tamaños del logo en cubiertas.
- `responsive-refinements.css`, líneas 157–173: posiciones/tamaños finales de stickers y adaptación en móvil.

## Comprobaciones y publicación

`npm run check:data` comprueba piezas, IDs, videos, existencia de logos/stickers y que las pegatinas de páginas no se repitan. `npm run build` vuelve a ejecutar ese chequeo y genera `site/dist/`. Si falta un PNG asignado, un ID está repetido o un video no es válido, el chequeo detiene la compilación y muestra el problema.

El workflow es `.github/workflows/pages.yml`. La compilación se ejecuta cuando se integra un cambio en `main` (o manualmente desde GitHub Actions). Una rama `review/...` sirve para revisar código y vista previa local, pero no cambia el sitio publicado hasta que se integre a `main`.

## Revisión crítica: cosas que aún requieren datos reales

La estructura de código ya está dividida por responsabilidades y el CSS, antes concentrado en un único archivo largo, ahora está separado en módulos de menos de 300 líneas. También se añadió una comprobación automática de datos para detectar errores antes de publicar. No generé ni sustituí assets; se usan los archivos PNG/JPG existentes.

Hay dos pendientes de contenido que no conviene “resolver” inventando datos: actualmente solo la primera pieza tiene foto asignada y solo esa pieza tiene un video no repetido. Las demás Polaroids mostrarán el estado de foto pendiente y su cuadro de video permanecerá oscuro hasta que se añadan sus imágenes/clips reales. Revisa también años, procedencias y relatos con la información del local antes de presentarlos como hechos históricos.

El nombre visible y los identificadores internos de la aplicación ya dicen Ámbar Tu Casa. El slug del repositorio GitHub sigue siendo `-mbar-objects`: cambiarlo fuera del código alteraría la URL pública de Pages y podría afectar QR físicos; se requiere escoger el nombre final y planear esa migración antes de hacerlo.
