# Plan: segunda pasada de identidad para Ámbar Tu Casa

## Dirección visual

- **Movimiento:** conservar el cuaderno y la carta artesanal ya implementados; hacer que se sienta más cálido, vivido y propio de Ámbar, no como una plantilla genérica.
- **Principios:** beige y crema como superficies dominantes; amarillo miel y mostaza para cintas y notas; azules y coral/rojo como acentos; integrar la variedad cromática que ya traen los PNG originales.
- **Composición:** mantener el libro, su navegación y la legibilidad de las piezas. Colocar stickers auténticos en márgenes libres, visibles y sin tapar las fotografías ni los textos.
- **Motivos distintivos:** conservar el distintivo circular amarillo `Ambar_abduccioncirculo.png` en las cubiertas; usar `Ambar_logo.png` como marca pequeña de cada foto y firma; nubes CSS azules, coral y blancas; cintas amarillas para los datos principales y post-its de tonos sacados de la paleta de los stickers.
- **Interacción:** conservar giro 3D, rutas de página/pieza, navegación táctil y de teclado y `prefers-reduced-motion`. Mantener el mismo identificador de álbum para no invalidar QR existentes.
- **Tipografía:** conservar Fredoka para títulos, Kalam para anotaciones y DM Sans/DM Mono para lectura y etiquetas.
- **Esencia y voz:** nombre visible “Ámbar Tu Casa”; descriptor público “Objetos, sabores y hogar”. El álbum se titula editorialmente “Casa de los objetos”. Usar un tono cálido sobre objetos con historia, sin atribuir lemas inventados ni añadir datos no verificados de las piezas.
- **Alcance:** un solo cuaderno, una cubierta y contracubierta coherentes. Eliminar el selector visible y las instrucciones para registrar un segundo álbum/local; conservar el `id` actual y las rutas antiguas para compatibilidad.

## Implementación y estructura

- `src/albums/ambar-casa-violeta-azul.js`: actualizar copy, ubicación y color miel; mantener el identificador técnico estable; conservar el logo circular amarillo en cubiertas y asignar `Ambar_logo.png` a las fotos y la firma.
- `src/albums/index.js`, `useAlbumNavigation.js`, `AlbumApp.jsx`, `AlbumLayout.jsx`, `BookState.jsx` y `BookCover.jsx`: quitar la ruta de selección de otro libro sin cambiar el estado de página/pieza ni la lectura de QR existentes.
- `src/utils/pageDecorations.js` y `PageStickers.jsx`: colocar cuatro stickers únicos por página, con posiciones alternativas y nube CSS cuando el catálogo único se termine.
- `PieceDetail.jsx`: cintas amarillas para número, época, clase y procedencia; post-its para material, procedencia, estado, uso y descripción; actualizar el texto del QR y usar el logo original en la firma.
- `album.css`: hacer dominante el papel beige, ampliar el amarillo y usar azul/coral y colores de los stickers como detalles. Respetar el layout móvil/escritorio y todas las clases de giro.
- `index.html` y `README.md`: actualizar el nombre público, descripción y guía para reflejar un único álbum.

## Base de identidad

La biografía pública de Ámbar usa “Ámbar, Tu casa” y “Objetos, sabores y hogar”; una publicación oficial vincula la marca con objetos que tienen historia. Referencias: [perfil oficial](https://www.instagram.com/ambar.tucasa/?hl=en), [publicación sobre objetos](https://www.instagram.com/p/Desm-eOG-Hw/) y [enlaces oficiales](https://linktr.ee/ambartucasa).
